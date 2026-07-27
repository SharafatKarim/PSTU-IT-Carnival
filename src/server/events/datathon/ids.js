import mongoose from 'mongoose';
import Registration from './model';

const PREFIX = 'PSTU-DATA-2026';
const COUNTER_KEY = 'datathon-registration';

const counterSchema = new mongoose.Schema(
  { _id: String, seq: { type: Number, default: 0 } },
  { versionKey: false }
);

const Counter =
  mongoose.models.Counter || mongoose.model('Counter', counterSchema, 'counters');

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
    { returnDocument: 'after', upsert: true }
  );

  return `${PREFIX}-${String(counter.seq).padStart(4, '0')}`;
}
