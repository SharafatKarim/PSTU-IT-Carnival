import mongoose from 'mongoose';
import { readImageUpload } from '@/server/payments/image';

// ---------------------------------------------------------------------------
// Participant photos.
//
// Same storage mechanics as a payment screenshot — bytes in their own
// collection, select:false, served only to admins — but a DIFFERENT lifetime,
// which is why it is a different collection rather than a `kind` flag.
//
//   A payment screenshot proves a transfer. Once an admin has checked it, it
//   has done its job and is deleted.
//
//   A participant photo goes on an ID badge and a certificate. It has to
//   survive right through the event, so nothing deletes it automatically. It
//   goes when the registration does, or when someone purges after the
//   carnival.
//
// Getting that backwards would either destroy the badges or hoard financial
// documents, so the two are kept apart at the schema.
// ---------------------------------------------------------------------------

const photoSchema = new mongoose.Schema(
  {
    /* Which registration flow — 'hackathon' today. */
    scope: { type: String, required: true, index: true },
    /* Set once the registration row exists. Null in between, which is how
       purgeOrphanPhotos() finds uploads whose submission never landed. */
    registrationId: { type: String, default: null, index: true },

    data: { type: Buffer, required: true, select: false },
    contentType: { type: String, required: true },
    bytes: { type: Number, required: true },
    originalName: { type: String, trim: true, maxlength: 200 },
  },
  { timestamps: true }
);

export const ParticipantPhoto =
  mongoose.models.ParticipantPhoto ||
  mongoose.model('ParticipantPhoto', photoSchema, 'participant_photos');

/**
 * Validate and store one photo.
 *
 * Stored before the registration is inserted, because the registration holds
 * the reference.
 */
export async function storePhoto(file, { scope }) {
  const read = await readImageUpload(file);
  if (!read.ok) return read;

  const doc = await ParticipantPhoto.create({
    scope,
    data: read.buffer,
    contentType: read.contentType,
    bytes: read.bytes,
    originalName: typeof file.name === 'string' ? file.name.slice(0, 200) : '',
  });

  return { ok: true, id: doc._id };
}

/** Claim photos for a registration, once that row exists. */
export async function attachPhotos(ids, registrationId) {
  const real = (ids || []).filter(Boolean);
  if (real.length === 0) return;
  await ParticipantPhoto.updateMany(
    { _id: { $in: real } },
    { $set: { registrationId } }
  );
}

/**
 * Delete photos. Called when a submission fails after the upload, and whenever
 * a registration is removed — mongoose has no cascade.
 *
 * Deliberately NOT called on payment approval. See the header.
 */
export async function dropPhotos(ids) {
  const real = (ids || []).filter(Boolean);
  if (real.length === 0) return;
  await ParticipantPhoto.deleteMany({ _id: { $in: real } });
}

/** Photos whose registration never got written, older than an hour. */
export async function purgeOrphanPhotos({ olderThanMs = 60 * 60 * 1000 } = {}) {
  const cutoff = new Date(Date.now() - olderThanMs);
  const result = await ParticipantPhoto.deleteMany({
    registrationId: null,
    createdAt: { $lt: cutoff },
  });

  return result.deletedCount || 0;
}
