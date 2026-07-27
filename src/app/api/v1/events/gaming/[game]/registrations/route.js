import { NextResponse } from 'next/server';
import connectDB from '@/server/db';
import { getGame, isGameRegistrationOpen } from '@/data/gaming';
import GamingRegistration from '@/server/events/gaming/model';
import { validateGameRegistration } from '@/server/events/gaming/validation';
import { normalizeGameRegistration } from '@/server/events/gaming/normalize';
import { generateGameRegistrationId } from '@/server/events/gaming/ids';
import { checkWriteLimits, clientKey } from '@/server/rateLimit';
import { verifyTurnstile } from '@/server/turnstile';
import { sendGamingConfirmationEmail } from '@/lib/email';

// ---------------------------------------------------------------------------
// Gaming registration intake.
//
// One route for all three tournaments: the slug in the path resolves to a game
// in src/data/gaming.js, and that config drives validation, the document shape
// and the registration ID prefix. Adding a fourth tournament needs no change
// here.
//
// Same order of operations as the IUPC handler — throttle, size, challenge,
// validate, check duplicates, then write — so the two behave alike under load.
// ---------------------------------------------------------------------------

/* A squad registration is ~1 KB. Anything far larger is not a real submission,
   so reject it before parsing rather than buffering it into memory. */
const MAX_BODY_BYTES = 16 * 1024;

/* Never hand a raw driver error to the client — connection failures quote the
   host, port and sometimes the credentials from MONGO_URI. Log it, return a
   flat message. */
const serverError = (context, error) => {
  console.error(`[gaming/registrations] ${context}:`, error);
  return NextResponse.json(
    { success: false, message: 'Something went wrong. Please try again.' },
    { status: 500 }
  );
};

const conflict = (message, field, detail) =>
  NextResponse.json(
    { success: false, message, errors: [{ field, message: detail || message }] },
    { status: 409 }
  );

export async function POST(req, { params }) {
  try {
    /* Throttle before touching the database, so a flood costs us nothing. */
    const limit = checkWriteLimits(req, 'gaming:register');
    if (!limit.ok) {
      return NextResponse.json(
        {
          success: false,
          message:
            limit.layer === 'global'
              ? 'Registrations are busy right now. Please try again in a few minutes.'
              : 'Too many registration attempts. Please try again shortly.',
        },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
      );
    }

    const { game: slug } = await params;
    const game = getGame(slug);

    if (!game) {
      return NextResponse.json(
        { success: false, message: `Unknown game "${slug}"` },
        { status: 404 }
      );
    }

    if (!isGameRegistrationOpen(game)) {
      return NextResponse.json(
        { success: false, message: `${game.name} registration is not open` },
        { status: 409 }
      );
    }

    const declared = Number(req.headers.get('content-length') || 0);
    if (declared > MAX_BODY_BYTES) {
      return NextResponse.json(
        { success: false, message: 'Request body too large' },
        { status: 413 }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    /* A JSON array passes typeof 'object' but has none of the fields below. */
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: 'Request body must be a JSON object' },
        { status: 400 }
      );
    }

    /* No-op unless TURNSTILE_SECRET_KEY is configured. */
    const challenge = await verifyTurnstile(body.turnstileToken, clientKey(req));
    if (!challenge.ok) {
      return NextResponse.json(
        { success: false, message: challenge.message },
        { status: 403 }
      );
    }

    // 1. Validation, against the game's own field config.
    const validationErrors = validateGameRegistration(game, body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: validationErrors },
        { status: 400 }
      );
    }

    await connectDB();

    const doc = normalizeGameRegistration(game, body);

    // 2. Duplicate checks — all scoped to this game. The same person may enter
    //    PUBG and Free Fire; they may not enter either one twice.
    if (doc.teamName) {
      const existingTeam = await GamingRegistration.findOne({
        game: doc.game,
        teamName: doc.teamName,
      });
      if (existingTeam) {
        return conflict(
          `A team called "${doc.teamName}" is already registered for ${game.name}`,
          'teamName',
          'Team name already taken — pick another'
        );
      }
    }

    const existingContact = await GamingRegistration.findOne({
      game: doc.game,
      'contact.email': doc.contact.email,
    });
    if (existingContact) {
      return conflict(
        `This email is already registered for ${game.name}`,
        'players.0.email',
        `Already used for registration ${existingContact.registrationId}`
      );
    }

    const existingPlayer = await GamingRegistration.findOne({
      game: doc.game,
      gameIds: { $in: doc.gameIds },
    });
    if (existingPlayer) {
      /* Naming the ID matters: on a squad form the captain needs to know which
         of their four players is the problem. */
      const clash = existingPlayer.gameIds.find((id) => doc.gameIds.includes(id));
      return conflict(
        `A player is already registered for ${game.name}`,
        'players',
        `Game ID ${clash} is already entered on registration ${existingPlayer.registrationId}`
      );
    }

    // 3. Generate ID & create.
    const registrationId = await generateGameRegistrationId(game);
    const created = await GamingRegistration.create({ ...doc, registrationId });

    // 4. Confirmation email. Awaited so a serverless function is not frozen
    //    before the message leaves; a failure here must not undo the write.
    try {
      await sendGamingConfirmationEmail({
        to: created.contact.email,
        name: created.contact.name,
        game,
        entryType: created.entryType,
        teamName: created.teamName,
        playerCount: created.players.length,
        registrationId: created.registrationId,
      });
    } catch (emailError) {
      console.error('[email] Failed to send gaming confirmation:', emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Registration completed successfully',
        data: { registrationId: created.registrationId },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error && error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0] || 'field';
      return conflict(`Duplicate value for ${field}`, field, `${field} must be unique`);
    }
    return serverError('POST', error);
  }
}
