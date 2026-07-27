import { PaymentScreenshot } from './screenshot';
import { readImageUpload } from './image';

// ---------------------------------------------------------------------------
// The two operations a registration flow needs from the screenshot store.
//
// Both events use these, so the storage decision lives in one place and a
// future change of mind — object storage, a signed URL — is one file.
// ---------------------------------------------------------------------------

/**
 * Validate and store an uploaded screenshot.
 *
 * Stored BEFORE the registration is inserted, because the registration holds
 * the reference. If the insert then fails, this row is an orphan with
 * registrationId still null — which is exactly how purgeOrphans() finds it.
 *
 * @returns {Promise<{ ok: true, id: import('mongoose').Types.ObjectId }
 *                  | { ok: false, message: string }>}
 */
export async function storeScreenshot(file, { scope }) {
  const read = await readImageUpload(file);
  if (!read.ok) return read;

  const doc = await PaymentScreenshot.create({
    scope,
    data: read.buffer,
    contentType: read.contentType,
    bytes: read.bytes,
    originalName: typeof file.name === 'string' ? file.name.slice(0, 200) : '',
  });

  return { ok: true, id: doc._id };
}

/** Claim an uploaded screenshot for a registration, once that row exists. */
export async function attachScreenshot(id, registrationId) {
  if (!id) return;
  await PaymentScreenshot.updateOne({ _id: id }, { $set: { registrationId } });
}

/**
 * Delete a screenshot. Called when an admin verifies the payment — the image
 * has served its purpose and there is no reason to keep it — and whenever a
 * registration is removed, since mongoose has no cascade.
 */
export async function dropScreenshot(id) {
  if (!id) return;
  await PaymentScreenshot.deleteOne({ _id: id });
}

/**
 * Screenshots whose registration never got written, older than an hour.
 *
 * A submission can die between the upload and the insert — a validation error,
 * a duplicate transaction ID, a dropped connection. Without this, every one of
 * those leaves a few hundred KB behind forever.
 */
export async function purgeOrphans({ olderThanMs = 60 * 60 * 1000 } = {}) {
  const cutoff = new Date(Date.now() - olderThanMs);
  const result = await PaymentScreenshot.deleteMany({
    registrationId: null,
    createdAt: { $lt: cutoff },
  });

  return result.deletedCount || 0;
}
