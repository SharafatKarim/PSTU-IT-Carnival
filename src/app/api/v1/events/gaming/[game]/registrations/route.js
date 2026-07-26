import { NextResponse } from 'next/server';
import { getGame, isGameRegistrationOpen } from '@/data/gaming';
import { validateGameRegistration } from '@/server/events/gaming/validation';
import { checkWriteLimits } from '@/server/rateLimit';

// ---------------------------------------------------------------------------
// Gaming registration intake — SCAFFOLD, NOT YET STORING ANYTHING.
//
// Everything up to persistence is real: the slug is resolved, entries are
// checked as open, and the payload is validated against the game's own field
// config. It then answers 501 instead of writing, because no gaming schema has
// been agreed yet.
//
// The browser never reaches this today — src/services/events/gaming.js is
// still in DEMO_MODE. To go live: add a model + ID generator under
// src/server/events/gaming/, replace the 501 block below with the create call,
// then flip DEMO_MODE to false. Mirror the IUPC handler at
// src/app/api/v1/events/iupc/registrations/route.js for duplicate checks.
// ---------------------------------------------------------------------------

export async function POST(req, { params }) {
  /* Same throttle as IUPC, applied now so it is already in place on the day
     this route starts writing. */
  const limit = checkWriteLimits(req, 'gaming:register');
  if (!limit.ok) {
    return NextResponse.json(
      { success: false, message: 'Too many attempts. Please try again shortly.' },
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

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  const errors = validateGameRegistration(game, body);
  if (errors.length > 0) {
    return NextResponse.json(
      { success: false, message: 'Validation failed', errors },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      message: `${game.name} registrations are not being stored yet. Your details were not saved.`,
    },
    { status: 501 }
  );
}
