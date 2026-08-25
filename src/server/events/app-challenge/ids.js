import Registration from './model';
import { nextSequence, formatSequence } from '@/server/counters';

// ---------------------------------------------------------------------------
// App Challenge registration ID: PSTU-APP-2026-0001.
// ---------------------------------------------------------------------------

const PREFIX = 'PSTU-APP-2026';
const COUNTER_KEY = 'app-challenge-registration';

export async function generateRegistrationId() {
  const seq = await nextSequence(COUNTER_KEY, {
    seed: () => Registration.countDocuments(),
  });

  return formatSequence(PREFIX, seq);
}
