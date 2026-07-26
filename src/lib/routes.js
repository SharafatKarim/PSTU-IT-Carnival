// ---------------------------------------------------------------------------
// Every URL on the site, in one place.
//
// Nothing outside this file should hard-code a path. Nav bars, cards, CTAs,
// the sitemap and the registration flows all build their hrefs from here.
//
// The site is one tree: every event lives under /events, and each event owns
// its own pages.
//
//   /events                          index of everything
//   /events/iupc                     event home
//   /events/iupc/register            event registration
//   /events/gaming                   the gaming hub
//   /events/gaming/efootball         game home
//   /events/gaming/efootball/register
//
// The API mirrors it exactly — /api/v1/events/iupc/registrations, and so on.
//
// Import direction is one-way to keep the module graph acyclic:
//   data/gaming.js  ->  lib/routes.js  ->  data/content.js  ->  components
// ---------------------------------------------------------------------------

import { GAMES } from '@/data/gaming';
import { EVENT_DETAILS } from '@/data/events';

/* ---------------------------------------------------------------------------
   Route registry.

   Each of these slugs is a real folder under src/app/events/. Routes are
   explicit rather than dynamic, so this list is the source of truth for what
   is actually reachable — and the assertion at the bottom of this file shouts
   in development if it ever falls out of step with the data.
   --------------------------------------------------------------------------- */

/* Events with a detail page at /events/<slug>. */
export const EVENT_PAGE_SLUGS = ['iupc'];

/* Games with a detail page at /events/gaming/<slug>. */
export const GAME_PAGE_SLUGS = ['efootball', 'pubg-mobile', 'free-fire'];

const EVENTS_BASE = '/events';
const GAMING_BASE = `${EVENTS_BASE}/gaming`;

/* The one event that owns a registration form. Everything that says
   "register" site-wide points at its nested route, so moving or renaming the
   event moves the form URL with it. */
const FORM_EVENT = EVENT_DETAILS.find((e) => e.registration?.kind === 'form');

export const ROUTES = {
  home: '/',
  /* Index of every carnival event. */
  events: EVENTS_BASE,
  /* Tech events get a detail page, with the form nested underneath it. */
  event: (slug) => `${EVENTS_BASE}/${slug}`,
  eventRegister: (slug) => `${EVENTS_BASE}/${slug}/register`,
  /* Gaming is an event like any other — it just has games nested below it. */
  gaming: GAMING_BASE,
  game: (slug) => `${GAMING_BASE}/${slug}`,
  /* Each game's form is its own page, matching how IUPC works. */
  gameRegister: (slug) => `${GAMING_BASE}/${slug}/register`,
  iupc: FORM_EVENT ? `${EVENTS_BASE}/${FORM_EVENT.slug}` : `${EVENTS_BASE}/iupc`,
  /* Site-wide "Register" CTA — resolves to /events/iupc/register today. */
  register: FORM_EVENT ? `${EVENTS_BASE}/${FORM_EVENT.slug}/register` : '/',
};

/* Events whose form is built as a route. */
export const REGISTRABLE_EVENTS = EVENT_DETAILS.filter(
  (e) => e.registration?.kind === 'form'
);

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

/* Sections of an event detail page. `register` is a hand-off panel pointing at
   the registration route, not the form itself. */
export const EVENT_SECTIONS = [
  { id: 'info', label: 'Info' },
  { id: 'rules', label: 'Rules' },
  { id: 'register', label: 'Register' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'Contact' },
];

/* Sections of a game detail page — same shape, same hand-off. */
export const GAME_SECTIONS = [
  { id: 'info', label: 'Info' },
  { id: 'rules', label: 'Rules' },
  { id: 'register', label: 'Register' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'Contact' },
];

/* Landing nav: same-page anchors, with the event routes slotted in after
   Events so the "what's on" entries sit together. */
export const landingNav = LANDING_SECTIONS.flatMap((section) =>
  section.id === 'events'
    ? [
        { label: section.label, href: `#${section.id}` },
        { label: 'IUPC', href: ROUTES.iupc },
        { label: 'Gaming', href: ROUTES.gaming },
      ]
    : [{ label: section.label, href: `#${section.id}` }]
);

/* Same links, but reachable from any other route. */
export const homeNav = LANDING_SECTIONS.map((section) => ({
  label: section.label,
  href: `${ROUTES.home}#${section.id}`,
}));

export const eventsIndexNav = [
  { label: 'Home', href: ROUTES.home },
  { label: 'IUPC', href: ROUTES.iupc },
  { label: 'Gaming', href: ROUTES.gaming },
  ...homeNav.filter((link) => ['Timeline', 'FAQ'].includes(link.label)),
];

export const gamingNav = [
  { label: 'Home', href: ROUTES.home },
  { label: 'All Events', href: ROUTES.events },
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

export const eventDetailNav = [
  { label: 'Home', href: ROUTES.home },
  { label: 'All Events', href: ROUTES.events },
  ...EVENT_SECTIONS.filter((s) => s.id !== 'register').map((s) => ({
    label: s.label,
    href: `#${s.id}`,
  })),
];

export const registerNav = [
  { label: 'Home', href: ROUTES.home },
  { label: 'Event Details', href: ROUTES.iupc },
  { label: 'All Events', href: ROUTES.events },
  ...homeNav.filter((link) => link.label === 'FAQ'),
  { label: 'Gaming', href: ROUTES.gaming },
];

/* Nav for a game's registration page — back out to the game, or sideways. */
export const gameRegisterNav = (slug) => [
  { label: 'Home', href: ROUTES.home },
  { label: 'Game Details', href: ROUTES.game(slug) },
  { label: 'All Games', href: ROUTES.gaming },
];

/* Every crawlable page. Consumed by src/app/sitemap.js. */
export const siteUrls = () => [
  { path: ROUTES.home, priority: 1 },
  { path: ROUTES.events, priority: 0.9 },
  ...EVENT_PAGE_SLUGS.map((slug) => ({ path: ROUTES.event(slug), priority: 0.9 })),
  ...REGISTRABLE_EVENTS.map((event) => ({
    path: ROUTES.eventRegister(event.slug),
    priority: 0.9,
  })),
  { path: ROUTES.gaming, priority: 0.9 },
  ...GAME_PAGE_SLUGS.flatMap((slug) => {
    const game = GAMES.find((g) => g.slug === slug);
    return [
      { path: ROUTES.game(slug), priority: 0.8 },
      /* A closed form is a thin "opens soon" page — not worth indexing. */
      ...(game?.registrationOpen
        ? [{ path: ROUTES.gameRegister(slug), priority: 0.7 }]
        : []),
    ];
  }),
];

/* True for links that change route (as opposed to same-page anchors), so
   components know when to reach for next/link. */
export const isRouteHref = (href) => href.startsWith('/');

/* ---------------------------------------------------------------------------
   Drift guard.

   Routes are explicit folders, so adding a game to src/data/gaming.js without
   adding src/app/events/gaming/<slug>/ would render a card linking to a 404.
   Catch it at dev time instead of in production.
   --------------------------------------------------------------------------- */
if (process.env.NODE_ENV !== 'production') {
  const report = (label, dataSlugs, routeSlugs, folder) => {
    const missing = dataSlugs.filter((s) => !routeSlugs.includes(s));
    const orphaned = routeSlugs.filter((s) => !dataSlugs.includes(s));

    if (missing.length > 0) {
      console.warn(
        `[routes] ${label} in the data with no page: ${missing.join(', ')}. ` +
          `Add ${folder}<slug>/page.js and list the slug in src/lib/routes.js, ` +
          `or those links will 404.`
      );
    }
    if (orphaned.length > 0) {
      console.warn(
        `[routes] ${label} routed but missing from the data: ${orphaned.join(', ')}. ` +
          `Remove the folder under ${folder} or restore the data entry.`
      );
    }
  };

  report(
    'Events',
    EVENT_DETAILS.map((e) => e.slug),
    EVENT_PAGE_SLUGS,
    'src/app/events/'
  );
  report(
    'Games',
    GAMES.map((g) => g.slug),
    GAME_PAGE_SLUGS,
    'src/app/events/gaming/'
  );
}
