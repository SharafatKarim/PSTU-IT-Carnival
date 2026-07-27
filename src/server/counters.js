// ---------------------------------------------------------------------------
// Atomic sequence numbers, shared by every registration flow.
//
// This used to live inside src/server/events/iupc/ids.js. Gaming needs the
// same thing — one counter per tournament — and two files declaring
// mongoose.model('Counter', ...) against the same collection is a schema
// waiting to drift. One definition, many keys.
//
// Why a counter document rather than countDocuments() + 1: the count is not
// atomic. Two submissions arriving together both read the same number and both
// build the same ID; one then loses to the unique index and the person sees a
// confusing "duplicate value" 409 instead of a registration. $inc is resolved
// by the database, so concurrent callers are handed distinct numbers.
// ---------------------------------------------------------------------------

import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema(
  { _id: String, seq: { type: Number, default: 0 } },
  { versionKey: false }
);

export const Counter =
  mongoose.models.Counter || mongoose.model('Counter', counterSchema, 'counters');

/* A counter added after rows already exist must start from however many are on
   disk, not from zero, or it reissues IDs that are already taken. `seed` is
   called at most once per key — $setOnInsert means only the first caller ever
   writes it. */
async function seedCounter(key, seed) {
  const existing = await Counter.findById(key).lean();
  if (existing) return;

  const start = typeof seed === 'function' ? await seed() : 0;
  await Counter.updateOne(
    { _id: key },
    { $setOnInsert: { seq: start } },
    { upsert: true }
  );
}

/**
 * The next number for `key`, incremented atomically.
 *
 * @param {string} key   counter document id, e.g. 'gaming:pubg-mobile'
 * @param {object} [opts]
 * @param {() => Promise<number>|number} [opts.seed]
 *        Starting value, used only the first time this key is ever seen.
 */
export async function nextSequence(key, { seed } = {}) {
  await seedCounter(key, seed);

  const counter = await Counter.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true }
  );

  return counter.seq;
}

/** `PREFIX-0001` — the shape every registration ID on the site uses. */
export const formatSequence = (prefix, seq, width = 4) =>
  `${prefix}-${String(seq).padStart(width, '0')}`;
