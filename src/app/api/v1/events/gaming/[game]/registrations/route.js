import { NextResponse } from 'next/server';
import connectDB from '@/server/db';
import { getGame, isGameRegistrationOpen, GAMING_PAYMENT } from '@/data/gaming';
import GamingRegistration from '@/server/events/gaming/model';
import { validateGameRegistration } from '@/server/events/gaming/validation';
import { normalizeGameRegistration } from '@/server/events/gaming/normalize';
import { generateGameRegistrationId } from '@/server/events/gaming/ids';
import { listGameRegistrations } from '@/server/events/gaming/directory';
import { checkWriteLimits, clientKey } from '@/server/rateLimit';
import { verifyTurnstile } from '@/server/turnstile';

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

/* Public directory of who has registered. Returns an allow-listed projection
   only — read the PRIVACY note in src/server/events/gaming/directory.js before
   widening it. */
export async function GET(req, { params }) {
  try {
    const { game: slug } = await params;
    const game = getGame(slug);

    if (!game) {
      return NextResponse.json(
        { success: false, message: `Unknown game "${slug}"` },
        { status: 404 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    /* Long search strings cost a collection scan and buy nothing. */
    const search = (searchParams.get('search') || '').slice(0, 100);
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    /* Capped so the endpoint cannot be used to pull the whole table at once. */
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 25));

    const data = await listGameRegistrations(game.slug, { search, page, limit });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return serverError('GET', error);
  }
}

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

    /* The wallet that was on screen when they paid, stamped onto the row so a
       payment stays reconcilable if the constant is ever changed and
       redeployed. Read from the same constant the form renders from, so the
       two can never disagree. */
    const doc = normalizeGameRegistration(game, body, {
      receiverNumber: GAMING_PAYMENT.number,
    });

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

    /* A transaction ID is one real transfer, so this is checked across every
       tournament rather than within one — otherwise a single ৳100 payment could
       be quoted on a PUBG entry and a Free Fire entry both. The unique index in
       the model closes the race between two simultaneous submissions; this is
       what turns it into a message somebody can act on. */
    const existingTxn = await GamingRegistration.findOne({
      'payment.transactionId': doc.payment.transactionId,
    });
    if (existingTxn) {
      return conflict(
        'This transaction ID has already been used',
        'payment.transactionId',
        `Already recorded against registration ${existingTxn.registrationId}. Each payment covers one entry — send a separate payment and use its own transaction ID.`
      );
    }

    // 3. Generate ID & create.
    const registrationId = await generateGameRegistrationId(game);
    const created = await GamingRegistration.create({ ...doc, registrationId });

    /* 4. No email on registration.
       A gaming entry lands as 'pending' and means nothing until a coordinator
       has matched the transaction ID against the wallet statement, so mailing
       here would confirm something unverified and spend quota doing it. The
       one message that goes out is the payment approval, sent when an admin
       moves the status to 'paid' — see sendGamingPaymentApprovedEmail in
       src/app/api/v1/admin/registrations/route.js.
       The registration ID is on screen the moment this returns, so nothing is
       lost by staying quiet here. */

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
