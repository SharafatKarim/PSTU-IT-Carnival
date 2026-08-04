#!/usr/bin/env node
// ---------------------------------------------------------------------------
// Clear the "payment announcement sent" stamp from IUPC teams.
//
// paymentNotifiedAt is what turns a team's Notify button green. The bulk sweep
// stamped teams whose mail never reached anyone, so the panel was reporting a
// notification that did not happen — worse than no record at all, because it
// tells a coordinator not to bother.
//
// This unsets the field on every team that carries it, putting the panel back
// to "nobody has been told". It does not touch registrationStatus, payments or
// anything else.
//
// Run it through scripts/clear-iupc-notified.sh, which executes this inside the
// builder image where mongoose and MONGO_URI live:
//
//   ./scripts/clear-iupc-notified.sh            # list what is stamped
//   ./scripts/clear-iupc-notified.sh --apply    # unset it
//
// Reads the collection directly rather than through the Mongoose model: the
// model lives behind the '@/' alias that only the bundler resolves, and a
// one-field unset does not need schema validation standing in front of it.
// ---------------------------------------------------------------------------

import mongoose from 'mongoose';

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('MONGO_URI is not set.');
  process.exit(1);
}

const apply = process.argv.includes('--apply');

await mongoose.connect(uri);
const teams = mongoose.connection.collection('IUPC_pre_reg');

const stamped = await teams
  .find(
    { paymentNotifiedAt: { $exists: true } },
    { projection: { teamName: 1, registrationId: 1, paymentNotifiedAt: 1 } }
  )
  .sort({ registrationId: 1 })
  .toArray();

if (stamped.length === 0) {
  console.log('No team carries paymentNotifiedAt — nothing to clear.');
  await mongoose.disconnect();
  process.exit(0);
}

console.log(`${stamped.length} team(s) currently marked as notified:\n`);
for (const team of stamped) {
  const when = team.paymentNotifiedAt
    ? new Date(team.paymentNotifiedAt).toISOString()
    : '(empty)';
  console.log(`  ${team.registrationId}  ${when}  ${team.teamName}`);
}

if (apply) {
  const result = await teams.updateMany(
    { paymentNotifiedAt: { $exists: true } },
    { $unset: { paymentNotifiedAt: '' } }
  );
  console.log(`\nCleared the stamp on ${result.modifiedCount} team(s).`);
} else {
  console.log('\nDry run — nothing was changed.');
  console.log('Re-run with --apply to unset paymentNotifiedAt on all of the above.');
}

await mongoose.disconnect();
