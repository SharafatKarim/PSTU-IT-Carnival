#!/usr/bin/env node
/* Sweep payment screenshots that no registration claimed.
 *
 * A submission can die between the upload and the insert — a validation error,
 * a duplicate transaction ID, a dropped connection. The routes clean up after
 * themselves, but a process killed mid-request cannot. Run this from cron.
 *
 *   node scripts/purge-screenshots.mjs
 */
import mongoose from 'mongoose';
import { purgeOrphans } from '../src/server/payments/index.js';

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('MONGO_URI is not set.');
  process.exit(1);
}

await mongoose.connect(uri);
const removed = await purgeOrphans();
console.log(`Removed ${removed} unclaimed screenshot(s).`);
await mongoose.disconnect();
