// ---------------------------------------------------------------------------
// Seed / update the coordinator contacts the event pages read.
//
// Contacts live in the database (see src/server/coordinators/model.js) so they
// can be corrected without a redeploy. This script is how they get there the
// first time, and the safest way to change one afterwards.
//
// Run it through scripts/seed-coordinators.sh, which executes it inside the
// builder image where mongoose and MONGO_URI live.
//
//   ./scripts/seed-coordinators.sh            # show what is stored today
//   ./scripts/seed-coordinators.sh --apply    # write CONTACTS below
//
// Upserts on `scope` + `email`, so re-running is safe: an existing row is
// updated in place rather than duplicated. Nothing is ever deleted — retire a
// coordinator by setting active:false on their row.
// ---------------------------------------------------------------------------

import mongoose from 'mongoose';

/* Edit this list, then run with --apply.

   scope 'gaming' is the wing-wide desk: it answers for every game that has no
   row of its own, so one entry covers PUBG Mobile, Free Fire and eFootball.
   Add a row with scope 'pubg-mobile' (or 'free-fire' / 'efootball') to give
   that one game a dedicated contact — a game's own rows replace the wing
   default rather than adding to it. */
const CONTACTS = [
  {
    scope: 'gaming',
    name: 'Gaming Fest Coordinator',
    role: 'Gaming Fest · CSE Club, PSTU',
    phone: '01670244069',
    email: 'ug2102067@cse.pstu.ac.bd',
    order: 0,
    active: true,
  },
];

const coordinatorSchema = new mongoose.Schema(
  {
    scope: { type: String, required: true, trim: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    role: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true, default: '' },
    facebook: { type: String, trim: true, default: '' },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Coordinator =
  mongoose.models.Coordinator ||
  mongoose.model('Coordinator', coordinatorSchema, 'coordinators');

const apply = process.argv.includes('--apply');
const uri = process.env.MONGO_URI;

if (!uri) {
  console.error('error: MONGO_URI is not set');
  process.exit(1);
}

/* Never print the credentials embedded in the URI. */
console.log('  database   :', uri.replace(/\/\/[^@]*@/, '//***@'));
console.log('  mode       :', apply ? 'APPLY (writes)' : 'dry run (read only)');
console.log('');

await mongoose.connect(uri);

if (apply) {
  for (const contact of CONTACTS) {
    const { scope, email } = contact;
    const res = await Coordinator.updateOne(
      { scope, email },
      { $set: contact },
      { upsert: true }
    );
    const what = res.upsertedCount ? 'inserted' : res.modifiedCount ? 'updated' : 'unchanged';
    console.log(`  ${what.padEnd(9)} ${scope} · ${contact.name} <${email}>`);
  }
  console.log('');
}

const stored = await Coordinator.find({}).sort({ scope: 1, order: 1 }).lean();

console.log(`  stored coordinators (${stored.length}):`);
if (stored.length === 0) {
  console.log('    (none — run again with --apply to seed CONTACTS)');
}
for (const doc of stored) {
  const state = doc.active ? '' : '  [inactive]';
  console.log(`    ${doc.scope.padEnd(14)} ${doc.name} · ${doc.phone} · ${doc.email}${state}`);
}

await mongoose.disconnect();
