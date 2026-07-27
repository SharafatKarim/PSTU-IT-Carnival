import Registration from './model';
import { nextSequence, formatSequence } from '@/server/counters';

// ---------------------------------------------------------------------------
// IUPC registration ID generation.
//
// The counter mechanics moved to src/server/counters.js when gaming needed the
// same thing. Behaviour here is unchanged: same key, same prefix, and the same
// seed — rows created before the counter existed already hold 0001, 0002...,
// so it starts from however many are on disk rather than from zero.
// ---------------------------------------------------------------------------

const PREFIX = 'PSTU-IUPC-2026';
const COUNTER_KEY = 'iupc-registration';

export async function generateRegistrationId() {
  const seq = await nextSequence(COUNTER_KEY, {
    seed: () => Registration.countDocuments(),
  });

  return formatSequence(PREFIX, seq);
}
