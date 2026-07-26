import mongoose from 'mongoose';
import Registration from './model';

// ---------------------------------------------------------------------------
// Registration ID generation.
//
// This used to be countDocuments() + 1, which is not atomic: two submissions
// arriving together both read the same count and both build the same ID. One
// then loses to the unique index and the person sees a confusing "duplicate
// value" 409 instead of a registration. With entries closing 31 July that
// overlap is likely, not theoretical.
//
// A counter document with $inc is atomic at the database, so concurrent
// callers are handed distinct numbers.
// ---------------------------------------------------------------------------

const PREFIX = 'PSTU-IUPC-2026';
const COUNTER_KEY = 'iupc-registration';

const counterSchema = new mongoose.Schema(
  { _id: String, seq: { type: Number, default: 0 } },
  { versionKey: false }
);

const Counter =
  mongoose.models.Counter || mongoose.model('Counter', counterSchema, 'counters');

/* Rows created before this counter existed already hold 0001, 0002... so the
   counter has to start from however many are on disk, not from zero.
   $setOnInsert means only the first caller ever seeds it. */
async function seedCounter() {
  const existing = await Counter.findById(COUNTER_KEY).lean();
  if (existing) return;

  const current = await Registration.countDocuments();
  await Counter.updateOne(
    { _id: COUNTER_KEY },
    { $setOnInsert: { seq: current } },
    { upsert: true }
  );
}

export async function generateRegistrationId() {
  await seedCounter();

  const counter = await Counter.findOneAndUpdate(
    { _id: COUNTER_KEY },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return `${PREFIX}-${String(counter.seq).padStart(4, '0')}`;
}
