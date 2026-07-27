// ---------------------------------------------------------------------------
// Seed / update the settings the site reads from the database.
//
// Two things live in Mongo rather than in src/data/ so they can be corrected
// without a redeploy — and both are ones that cause real harm when stale:
//
//   coordinators     who to contact (src/server/coordinators/model.js)
//   payment accounts where the entry fee is sent (src/server/payments/model.js)
//
// This script is how they get there the first time, and the safest way to
// change one afterwards. Run it through scripts/seed-db.sh, which executes it
// inside the builder image where mongoose and MONGO_URI live.
//
//   ./scripts/seed-db.sh            # show what is stored today
//   ./scripts/seed-db.sh --apply    # write the lists below
//
// Both upsert on their scope key, so re-running is safe: an existing row is
// updated in place rather than duplicated. Nothing is ever deleted — retire a
// row by setting active:false on it.
// ---------------------------------------------------------------------------

import mongoose from 'mongoose';

/* Edit these, then run with --apply.

   scope 'gaming' is the wing-wide default: it answers for every game that has
   no row of its own, so one entry covers PUBG Mobile, Free Fire and eFootball.
   Add a row with scope 'pubg-mobile' (or 'free-fire' / 'efootball') to give one
   tournament its own — a game's own row replaces the wing default rather than
   adding to it. */

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

/* The wallet entrants send the registration fee to. One number covers all
   three tournaments. The ACCEPTED METHODS are not here — they live in
   PAYMENT_METHODS in src/data/gaming.js, because the server validates the
   submitted method against that list. */
const PAYMENT_ACCOUNTS = [
  {
    scope: 'gaming',
    number: '01790876257',
    accountType: 'Personal',
    instructions:
      'Use “Send Money” (not Payment) from any of the accepted wallets above, then enter the transaction ID it gives you.',
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

const paymentAccountSchema = new mongoose.Schema(
  {
    scope: { type: String, required: true, trim: true, index: true },
    number: { type: String, required: true, trim: true },
    accountType: { type: String, trim: true, default: 'Personal' },
    instructions: { type: String, trim: true, default: '' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Coordinator =
  mongoose.models.Coordinator ||
  mongoose.model('Coordinator', coordinatorSchema, 'coordinators');

const PaymentAccount =
  mongoose.models.PaymentAccount ||
  mongoose.model('PaymentAccount', paymentAccountSchema, 'payment_accounts');

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

const upsert = async (Model, rows, keyOf, describe) => {
  for (const row of rows) {
    const res = await Model.updateOne(keyOf(row), { $set: row }, { upsert: true });
    const what = res.upsertedCount
      ? 'inserted'
      : res.modifiedCount
        ? 'updated'
        : 'unchanged';
    console.log(`  ${what.padEnd(9)} ${describe(row)}`);
  }
};

if (apply) {
  console.log('  coordinators:');
  await upsert(
    Coordinator,
    CONTACTS,
    ({ scope, email }) => ({ scope, email }),
    (c) => `${c.scope} · ${c.name} <${c.email}>`
  );

  console.log('');
  console.log('  payment accounts:');
  await upsert(
    PaymentAccount,
    PAYMENT_ACCOUNTS,
    ({ scope }) => ({ scope }),
    (a) => `${a.scope} · ${a.number} (${a.accountType})`
  );
  console.log('');
}

const [coordinators, accounts] = await Promise.all([
  Coordinator.find({}).sort({ scope: 1, order: 1 }).lean(),
  PaymentAccount.find({}).sort({ scope: 1 }).lean(),
]);

console.log(`  stored coordinators (${coordinators.length}):`);
if (coordinators.length === 0) {
  console.log('    (none — run again with --apply to seed them)');
}
for (const doc of coordinators) {
  const state = doc.active ? '' : '  [inactive]';
  console.log(`    ${doc.scope.padEnd(14)} ${doc.name} · ${doc.phone} · ${doc.email}${state}`);
}

console.log('');
console.log(`  stored payment accounts (${accounts.length}):`);
if (accounts.length === 0) {
  console.log('    (none — the site falls back to GAMING_PAYMENT in src/data/gaming.js)');
}
for (const doc of accounts) {
  const state = doc.active ? '' : '  [inactive]';
  console.log(`    ${doc.scope.padEnd(14)} ${doc.number} (${doc.accountType})${state}`);
}

await mongoose.disconnect();
