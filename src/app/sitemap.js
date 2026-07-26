import { siteUrls } from '@/lib/routes';
import { EVENT } from '@/data/content';

/* Override with NEXT_PUBLIC_SITE_URL when deploying somewhere else. */
const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || `https://${EVENT.website}`).replace(
  /\/$/,
  ''
);

export default function sitemap() {
  return siteUrls().map(({ path, priority }) => ({
    url: `${BASE_URL}${path === '/' ? '' : path}`,
    changeFrequency: 'weekly',
    priority,
  }));
}
