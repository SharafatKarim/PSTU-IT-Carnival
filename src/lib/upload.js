// ---------------------------------------------------------------------------
// Upload limits, shared by both sides of the network boundary.
//
// Same reasoning as src/lib/patterns.js: the file input needs the accept list
// and the error copy needs the size, and the server enforces both. Two copies
// would drift, and a client that offers a format the server rejects is a form
// that fails after the upload rather than before it.
//
// No imports, no Node globals — safe in a 'use client' component.
// ---------------------------------------------------------------------------

/** 5 MB. A phone photo is 2–5 MB before the browser shrinks it; this is the
    ceiling for someone who bypasses the client and posts the original. */
export const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024;

export const ACCEPTED_LABEL = 'JPG, PNG or WebP, up to 5 MB';

/* Deliberately narrower than image/* — an iPhone's default HEIC cannot be
   rendered by most browsers, and the client converts to JPEG before submitting
   anyway. */
export const ACCEPT_ATTR = 'image/jpeg,image/png,image/webp';
