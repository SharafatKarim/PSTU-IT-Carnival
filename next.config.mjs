/* Content-Security-Policy.
   'unsafe-inline' stays in script-src because Next's hydration bootstrap is
   inlined and this app has no middleware issuing a per-request nonce. So this
   policy does NOT stop inline XSS — what it does stop is a successful
   injection loading external code or phoning data out, since script-src,
   connect-src and img-src are pinned to this origin. Tightening it further
   means adding nonce middleware. */
/* Turnstile needs to load a script, open a frame and call home. Those origins
   are only allow-listed when a site key was supplied at build time, so a
   deployment without the challenge keeps the tighter policy. */
const TURNSTILE = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  ? 'https://challenges.cloudflare.com'
  : '';

const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${TURNSTILE}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' ${TURNSTILE}`,
  `frame-src ${TURNSTILE || "'none'"}`,
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
]
  .map((directive) => directive.trim().replace(/\s+/g, ' '))
  .join('; ');

const SECURITY_HEADERS = [
  { key: 'Content-Security-Policy', value: CSP },
  /* Clickjacking: frame-ancestors covers modern browsers, this covers the rest. */
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  /* Only meaningful once served over HTTPS; harmless before then. */
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  /* Registrations are personal data — keep them out of shared caches. */
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  /* Next echoes its version in a response header by default; there is no
     reason to tell a scanner which release to look up. */
  poweredByHeader: false,

  async headers() {
    return [
      { source: '/:path*', headers: SECURITY_HEADERS },
      /* API responses must never be stored by a proxy or the browser. */
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
          { key: 'X-Robots-Tag', value: 'noindex' },
        ],
      },
    ];
  },

  /* Everything now lives under /events (see src/lib/routes.js). These are the
     URLs that were public before the move — posters, Facebook posts and chat
     messages already carry them, and pre-registration closes 31 July 2026, so
     they redirect rather than 404.
     Safe to delete once the carnival is over. */
  async redirects() {
    return [
      { source: '/gaming', destination: '/events/gaming', permanent: true },
      { source: '/gaming/:slug', destination: '/events/gaming/:slug', permanent: true },
      { source: '/register', destination: '/events/iupc/register', permanent: true },
    ];
  },
};

export default nextConfig;
