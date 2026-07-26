// ---------------------------------------------------------------------------
// Rate limiting for the public registration endpoints.
//
// The forms are public, unauthenticated and (unless Turnstile is configured)
// unchallenged, so without this one script can fill the collection with junk
// faster than anyone can clear it. There are 45 slots and a published
// deadline — cheap and effective disruption.
//
// Two layers, because they fail differently:
//
//   per-client  keyed on the forwarded client address. Stops the obvious
//               case, but the header is forgeable unless a proxy you control
//               sets it (TRUST_PROXY_HEADERS).
//   global      a ceiling on total writes in the window, regardless of who
//               claims to be sending them. This is what bounds the damage
//               when the per-client key is spoofed or the flood is
//               distributed. It sits far above real demand — the whole
//               contest is 45 teams — so legitimate users never meet it.
//
// KNOWN LIMITS: state is per process, so it resets on restart and does not
// coordinate across replicas. The app runs as a single container today; if it
// is ever scaled out, move this to Redis or the database. This raises the cost
// of abuse considerably; it is not a WAF.
// ---------------------------------------------------------------------------

const buckets = new Map();

const num = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const WINDOW_MS = num(process.env.RATE_LIMIT_WINDOW_MS, 10 * 60 * 1000);
export const PER_CLIENT_LIMIT = num(process.env.RATE_LIMIT_PER_CLIENT, 5);
export const GLOBAL_LIMIT = num(process.env.RATE_LIMIT_GLOBAL, 60);

/* Stop the map growing without bound on a long-running process. */
const sweep = (now, windowMs) => {
  for (const [key, hits] of buckets) {
    const live = hits.filter((t) => now - t < windowMs);
    if (live.length === 0) buckets.delete(key);
    else buckets.set(key, live);
  }
};

let lastSweep = 0;

export function rateLimit({ key, limit, windowMs = WINDOW_MS }) {
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

/* Best-effort client address.
   X-Forwarded-For is only meaningful when something you control writes it;
   reached directly, a caller can put anything there. TRUST_PROXY_HEADERS
   records which deployment this is, so the log tells you whether the
   per-client key can be believed. The global ceiling is what holds either
   way. */
const TRUSTS_PROXY = process.env.TRUST_PROXY_HEADERS === 'true';

export function clientKey(req) {
  const forwarded = req.headers.get('x-forwarded-for');
  const address = forwarded
    ? forwarded.split(',')[0].trim()
    : req.headers.get('x-real-ip') || 'unknown';

  /* Namespacing by trust level keeps a spoofed header from colliding with a
     genuine one recorded under a trusted proxy. */
  return TRUSTS_PROXY ? `t:${address}` : `u:${address}`;
}

/* Both layers, in the order that matters: a single noisy client is rejected
   without spending any of the global budget. */
export function checkWriteLimits(req, scope) {
  const perClient = rateLimit({
    key: `${scope}:client:${clientKey(req)}`,
    limit: PER_CLIENT_LIMIT,
  });
  if (!perClient.ok) return { ...perClient, layer: 'client' };

  const global = rateLimit({ key: `${scope}:global`, limit: GLOBAL_LIMIT });
  if (!global.ok) {
    console.warn(
      `[rateLimit] global ceiling hit for ${scope} — ${GLOBAL_LIMIT} writes in ${WINDOW_MS}ms. Possible flood.`
    );
    return { ...global, layer: 'global' };
  }

  return { ok: true };
}
