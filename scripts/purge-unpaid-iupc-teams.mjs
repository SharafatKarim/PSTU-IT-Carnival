#!/usr/bin/env node
// ---------------------------------------------------------------------------
// Purge unpaid IUPC teams from MongoDB.
// Keeps ONLY teams with registrationStatus 'paid' or 'approved'.
// Deletes all other entries (pre-registered, pending, rejected, payment-submitted, etc.)
// ---------------------------------------------------------------------------

import mongoose from 'mongoose';

const uri =
  process.env.MONGO_URI ||
  `mongodb://${process.env.MONGO_ROOT_USER}:${process.env.MONGO_ROOT_PASSWORD}@127.0.0.1:27017/${process.env.MONGO_DB || 'pstu_it_carnival'}?authSource=admin`;

const apply = process.argv.includes('--apply');

console.log('Connecting to MongoDB...');
await mongoose.connect(uri);
const teams = mongoose.connection.collection('IUPC_pre_reg');

const unpaidFilter = {
  registrationStatus: { $nin: ['paid', 'approved'] },
};

const unpaidTeams = await teams
  .find(unpaidFilter, { projection: { teamName: 1, registrationId: 1, registrationStatus: 1 } })
  .sort({ registrationId: 1 })
  .toArray();

console.log(`Found ${unpaidTeams.length} non-paid IUPC team(s):\n`);
for (const team of unpaidTeams) {
  console.log(`  ${team.registrationId}  [${team.registrationStatus || 'empty'}]  ${team.teamName}`);
}

if (apply) {
  const result = await teams.deleteMany(unpaidFilter);
  console.log(`\nSuccessfully deleted ${result.deletedCount} non-paid team(s) from database.`);
} else {
  console.log('\nDry run — nothing was changed.');
  console.log('Re-run with --apply to purge non-paid teams.');
}

await mongoose.disconnect();
