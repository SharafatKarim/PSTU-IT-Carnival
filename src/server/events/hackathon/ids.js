import Registration from './model';
import { nextSequence, formatSequence } from '@/server/counters';

/* PSTU-HACK-2026-0001. Same shared counter as every other flow — see
   src/server/counters.js for why a counter document rather than a count. */

const PREFIX = 'PSTU-HACK-2026';
const COUNTER_KEY = 'hackathon-registration';

export async function generateRegistrationId() {
  const seq = await nextSequence(COUNTER_KEY, {
    seed: () => Registration.countDocuments(),
  });

  return formatSequence(PREFIX, seq);
}
