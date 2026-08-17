import fs from 'node:fs';

try {
  const envContent = fs.readFileSync('/mnt/CSE/Skills/GITHUB/PSTU-IT-Carnival/.env', 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      process.env[key] = val;
    }
  }
} catch (e) {
  console.log('Reading .env warning:', e.message);
}

if (!process.env.MONGO_URI) {
  if (process.env.MONGO_ROOT_USER && process.env.MONGO_ROOT_PASSWORD) {
    process.env.MONGO_URI = `mongodb://${process.env.MONGO_ROOT_USER}:${process.env.MONGO_ROOT_PASSWORD}@127.0.0.1:27017/${process.env.MONGO_DB || 'pstu_it_carnival'}?authSource=admin`;
  } else {
    process.env.MONGO_URI = `mongodb://127.0.0.1:27017/${process.env.MONGO_DB || 'pstu_it_carnival'}`;
  }
}

import connectDB from '../src/server/db.js';
import Registration from '../src/server/events/hackathon/model.js';
import { HACKATHON_ACCEPTED_TEAMS } from '../src/data/events.js';

async function main() {
  await connectDB();
  console.log('Connected to Database.');

  const filter = {
    registrationStatus: { $nin: ['paid'] },
    finalRegistered: { $ne: true },
    $or: [
      { shortlisted: true },
      { registrationId: { $in: HACKATHON_ACCEPTED_TEAMS } }
    ]
  };

  const docs = await Registration.find(filter);
  console.log(`Found ${docs.length} selected unpaid hackathon team(s) in DB.`);

  let updatedCount = 0;
  for (const doc of docs) {
    if (doc.registrationStatus !== 'delayed') {
      doc.registrationStatus = 'delayed';
      await doc.save();
      console.log(`Updated team ${doc.registrationId} (${doc.teamName}) to 'delayed'.`);
      updatedCount++;
    }
  }

  console.log(`Successfully updated ${updatedCount} team(s) to 'delayed'.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Error executing script:', err);
  process.exit(1);
});
