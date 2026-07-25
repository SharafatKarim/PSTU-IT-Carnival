// ---------------------------------------------------------------------------
// Every URL on the site, in one place.
//
// Nothing outside this file should hard-code a path. Nav bars, cards, CTAs,
// the sitemap and the registration flows all build their hrefs from here, so
// adding a game to src/data/gaming.js gives it a page, a nav entry and a
// sitemap entry with no further edits.
//
// Import direction is one-way to keep the module graph acyclic:
//   data/gaming.js  ->  lib/routes.js  ->  data/content.js  ->  components
// ---------------------------------------------------------------------------

import { GAMES } from '../data/gaming';

export const ROUTES = {
  home: '/',
  register: '/register',
  gaming: '/gaming',
  game: (slug) => `/gaming/${slug}`,
  /* The registration form lives on the game page, so it is an anchor. */
  gameRegister: (slug) => `/gaming/${slug}#register`,
};

/* Sections of the landing page, in the order they appear. The nav and the
   in-page anchors are both generated from this. */
export const LANDING_SECTIONS = [
  { id: 'about', label: 'About' },
  { id: 'events', label: 'Events' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'format', label: 'Format' },
  { id: 'prizes', label: 'Prizes' },
  { id: 'faq', label: 'FAQ' },
];

/* Sections of a game detail page. */
export const GAME_SECTIONS = [
  { id: 'info', label: 'Info' },
  { id: 'rules', label: 'Rules' },
  { id: 'register', label: 'Register' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'Contact' },
];

/* Landing nav: same-page anchors, with the Gaming route slotted in after
   Events so the two "what's on" entries sit together. */
export const landingNav = LANDING_SECTIONS.flatMap((section) =>
  section.id === 'events'
    ? [
        { label: section.label, href: `#${section.id}` },
        { label: 'Gaming', href: ROUTES.gaming },
      ]
    : [{ label: section.label, href: `#${section.id}` }]
);

/* Same links, but reachable from any other route. */
export const homeNav = LANDING_SECTIONS.map((section) => ({
  label: section.label,
  href: `${ROUTES.home}#${section.id}`,
}));

export const gamingNav = [
  { label: 'Home', href: ROUTES.home },
  { label: 'Games', href: '#games' },
  ...GAMES.map((game) => ({ label: game.shortName, href: ROUTES.game(game.slug) })),
];

export const gameDetailNav = [
  { label: 'Home', href: ROUTES.home },
  { label: 'All Games', href: ROUTES.gaming },
  ...GAME_SECTIONS.filter((s) => s.id !== 'register').map((s) => ({
    label: s.label,
    href: `#${s.id}`,
  })),
];

export const registerNav = [
  { label: 'Home', href: ROUTES.home },
  ...homeNav.filter((link) => ['Events', 'Format', 'FAQ'].includes(link.label)),
  { label: 'Gaming', href: ROUTES.gaming },
];

/* Every crawlable page. Consumed by src/app/sitemap.js. */
export const siteUrls = () => [
  { path: ROUTES.home, priority: 1 },
  { path: ROUTES.register, priority: 0.9 },
  { path: ROUTES.gaming, priority: 0.9 },
  ...GAMES.map((game) => ({ path: ROUTES.game(game.slug), priority: 0.8 })),
];

/* True for links that change route (as opposed to same-page anchors), so
   components know when to reach for next/link. */
export const isRouteHref = (href) => href.startsWith('/');
