/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

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
