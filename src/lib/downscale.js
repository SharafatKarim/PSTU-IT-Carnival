'use client';

// ---------------------------------------------------------------------------
// Shrink a screenshot before it is uploaded.
//
// The audience is on mobile data on mid-range Android phones. A camera photo
// is 2–5 MB and a bKash screenshot only needs to be readable, so sending the
// original wastes a minute of someone's connection and 5 MB of their data for
// no gain. Canvas re-encoding is built into the browser — no dependency.
//
// It also solves iPhone HEIC quietly: decoding into a canvas and re-encoding
// as JPEG produces a format the server accepts, so most iPhone users never see
// the "convert it" error at all.
//
// Every failure path returns the ORIGINAL file. A screenshot that is too large
// is the server's problem to report; a screenshot that never uploads because
// canvas threw is a registration lost.
// ---------------------------------------------------------------------------

const MAX_EDGE = 1600;
const QUALITY = 0.82;

/* Below this, re-encoding usually makes the file bigger, not smaller. */
const SKIP_BELOW_BYTES = 400 * 1024;

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('decode failed'));
    };
    img.src = url;
  });

/**
 * @param {File} file
 * @returns {Promise<File>} the shrunk file, or the original if shrinking it
 *                          failed or would not help.
 */
export async function downscaleImage(file) {
  if (typeof document === 'undefined' || !file) return file;
  if (file.size <= SKIP_BELOW_BYTES && file.type !== 'image/heic') return file;

  try {
    const img = await loadImage(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);

    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', QUALITY)
    );
    if (!blob) return file;

    /* A screenshot of a phone UI is flat colour and can re-encode LARGER as
       JPEG than it was as PNG. Keep whichever is smaller. */
    if (blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, '') || 'screenshot';
    return new File([blob], `${name}.jpg`, {
      type: 'image/jpeg',
      lastModified: file.lastModified,
    });
  } catch {
    return file;
  }
}
