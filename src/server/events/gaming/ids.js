import GamingRegistration from './model';
import { nextSequence, formatSequence } from '@/server/counters';

// ---------------------------------------------------------------------------
// Gaming registration IDs — PSTU-PUBG-2026-0001, PSTU-FF-2026-0007, and so on.
//
// One counter per tournament, so each game's numbers run from 1 and a person
// can read their ID and know which event it belongs to. The prefix comes from
// the game's own config in src/data/gaming.js rather than a table here.
//
// See src/server/counters.js for why this is a counter document and not a
// count of existing rows.
// ---------------------------------------------------------------------------

export async function generateGameRegistrationId(game) {
  const seq = await nextSequence(`gaming:${game.slug}`, {
    /* Only ever read the first time this game's counter is created — rows
       written before it existed must not have their IDs reissued. */
    seed: () => GamingRegistration.countDocuments({ game: game.slug }),
  });

  return formatSequence(game.registration.idPrefix, seq);
}
