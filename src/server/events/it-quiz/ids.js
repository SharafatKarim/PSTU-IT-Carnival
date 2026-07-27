import Registration from './model';
import { nextSequence, formatSequence } from '@/server/counters';

// ---------------------------------------------------------------------------
// IT Quiz registration ID: PSTU-QUIZ-2026-0001.
//
// Copied from src/server/events/iupc/ids.js, not from the datathon one — that
// file re-declares mongoose.model('Counter', ...) against the same collection
// src/server/counters.js owns, which its own header names as the thing not to
// do. This uses the shared counter.
// ---------------------------------------------------------------------------

const PREFIX = 'PSTU-QUIZ-2026';
const COUNTER_KEY = 'it-quiz-registration';

export async function generateRegistrationId() {
  const seq = await nextSequence(COUNTER_KEY, {
    seed: () => Registration.countDocuments(),
  });

  return formatSequence(PREFIX, seq);
}
