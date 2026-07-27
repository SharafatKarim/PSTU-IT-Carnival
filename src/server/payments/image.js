// ---------------------------------------------------------------------------
// Payment screenshot validation.
//
// Nothing in this project uploaded a file before this, so there is no library
// to lean on and none is being added. That is fine: deciding whether some bytes
// are a JPEG is a handful of byte comparisons.
//
// The browser's declared `type` is not trusted. It comes from the file
// extension on most platforms, so renaming payload.exe to payload.jpg is enough
// to make it claim image/jpeg. The first bytes of the file cannot be renamed.
// ---------------------------------------------------------------------------

import { ACCEPTED_LABEL, MAX_SCREENSHOT_BYTES } from '@/lib/upload';

const startsWith = (bytes, signature) =>
  signature.every((byte, i) => bytes[i] === byte);

/**
 * The real content type of `bytes`, by signature, or null if it is not one of
 * the three formats accepted.
 */
export function sniffImageType(bytes) {
  if (!bytes || bytes.length < 12) return null;

  /* JPEG: FF D8 FF */
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return 'image/jpeg';

  /* PNG: 89 50 4E 47 0D 0A 1A 0A */
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return 'image/png';
  }

  /* WebP: "RIFF" .... "WEBP" — the size field sits between the two. */
  if (
    startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    startsWith(bytes.subarray(8), [0x57, 0x45, 0x42, 0x50])
  ) {
    return 'image/webp';
  }

  return null;
}

/* Named so the error can say "convert it to JPEG" instead of the useless
   "unsupported file type" — HEIC is what an iPhone saves by default. */
const isHeic = (bytes) =>
  bytes.length >= 12 &&
  startsWith(bytes.subarray(4), [0x66, 0x74, 0x79, 0x70]) &&
  ['heic', 'heix', 'hevc', 'mif1', 'msf1'].includes(
    Buffer.from(bytes.subarray(8, 12)).toString('latin1')
  );

/**
 * Validate an uploaded screenshot.
 *
 * @param {File|null} file  the entry from FormData
 * @returns {Promise<{ ok: true, buffer: Buffer, contentType: string, bytes: number }
 *                  | { ok: false, message: string }>}
 */
export async function readScreenshot(file) {
  if (!file || typeof file.arrayBuffer !== 'function') {
    return { ok: false, message: 'No file was received.' };
  }

  if (file.size > MAX_SCREENSHOT_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return {
      ok: false,
      message: `That screenshot is ${mb} MB. The limit is 5 MB — take a screenshot rather than a photo of the screen, or crop it.`,
    };
  }

  if (file.size === 0) {
    return { ok: false, message: 'That file is empty.' };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType = sniffImageType(buffer);

  if (!contentType) {
    return {
      ok: false,
      message: isHeic(buffer)
        ? 'iPhone HEIC photos cannot be shown in a browser. Open it and share as JPEG, or take a screenshot instead.'
        : `That file is not an image we can read. Send a ${ACCEPTED_LABEL}.`,
    };
  }

  return { ok: true, buffer, contentType, bytes: buffer.length };
}
