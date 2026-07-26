// ---------------------------------------------------------------------------
// Minimal in-process rate limiter.
//
// The registration form is public, unauthenticated and has no CAPTCHA, so
// without this one script can fill the collection with junk entries faster
// than anyone can clear them. There are 45 slots and a published deadline —
// that is a cheap way to disrupt the contest.
//
// LIMITS OF THIS IMPLEMENTATION, deliberately kept simple:
//   - state is per process, so it resets on restart and does not coordinate
//     across replicas. The app runs as a single container today; if it is ever
//     scaled out, move this to Redis or the database.
//   - it keys on the client IP taken from proxy headers, which are only
//     trustworthy when a proxy you control sets them. Direct-to-container
//     traffic could spoof them.
// It raises the cost of abuse considerably; it is not a WAF.
// ---------------------------------------------------------------------------

const buckets = new Map();

/* Stop the map growing without bound on a long-running process. */
const sweep = (now, windowMs) => {
  for (const [key, hits] of buckets) {
    const live = hits.filter((t) => now - t < windowMs);
    if (live.length === 0) buckets.delete(key);
    else buckets.set(key, live);
  }
};

let lastSweep = 0;

export function rateLimit({ key, limit, windowMs }) {
  const now = Date.now();

  if (now - lastSweep > windowMs) {
    sweep(now, windowMs);
    lastSweep = now;
  }

  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);

  if (hits.length >= limit) {
    const retryAfter = Math.max(1, Math.ceil((windowMs - (now - hits[0])) / 1000));
    return { ok: false, retryAfter };
  }

  hits.push(now);
  buckets.set(key, hits);
  return { ok: true };
}

/* Best-effort client address. x-forwarded-for may carry a proxy chain; the
   left-most entry is the original client. */
export function clientKey(req) {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}
