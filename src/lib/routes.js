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
export const EVENT_PAGE_SLUGS = [
  'iupc',
  'datathon',
  'hackathon',
  'it-quiz',
  'ctf',
  'project-showcase',
];

/* Games with a detail page at /events/gaming/<slug>. */
export const GAME_PAGE_SLUGS = [
  'efootball',
  'pubg-mobile',
  'free-fire',
  'chess',
  'ludo',
  'rubiks-cube',
];

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
  /* Public directory of registered teams. */
  eventTeams: (slug) => `${EVENTS_BASE}/${slug}/teams`,
  /* University-wise slot split, published after entries close. */
  eventSlots: (slug) => `${EVENTS_BASE}/${slug}/slots`,
  /* Gaming is an event like any other — it just has games nested below it. */
  gaming: GAMING_BASE,
  game: (slug) => `${GAMING_BASE}/${slug}`,
  /* Each game's form is its own page, matching how IUPC works. */
  gameRegister: (slug) => `${GAMING_BASE}/${slug}/register`,
  /* Public directory of who has entered. Squad tournaments list squads, a 1v1
     tournament lists players — see gameDirectory() below, which picks the
     right one so no caller has to know which kind a game is. */
  gameTeams: (slug) => `${GAMING_BASE}/${slug}/teams`,
  gamePlayers: (slug) => `${GAMING_BASE}/${slug}/players`,
  iupc: FORM_EVENT ? `${EVENTS_BASE}/${FORM_EVENT.slug}` : `${EVENTS_BASE}/iupc`,
  /* Site-wide "Register" CTA — resolves to /events/iupc/register today. */
  register: FORM_EVENT ? `${EVENTS_BASE}/${FORM_EVENT.slug}/register` : '/',
  /* Dedicated volunteer registration route */
  volunteer: '/volunteer',
};

/* Events whose form is built as a route. */
export const REGISTRABLE_EVENTS = EVENT_DETAILS.filter(
  (e) => e.registration?.kind === 'form'
);

/* A 1v1 tournament has no squads to list, so its directory is /players; the
   battle royales list squads at /teams. Resolved from the game's own config so
   a caller only needs the slug.

   Only tournaments taking entries have one — an announced game has nothing to
   show, and a link to an empty table reads as a bug. */
export const hasGameDirectory = (slug) => {
  const game = GAMES.find((g) => g.slug === slug);
  return Boolean(game?.registrationOpen && game.registration);
};

export const gameDirectoryLabel = (slug) =>
  GAMES.find((g) => g.slug === slug)?.registration?.kind === 'solo'
    ? 'Registered Players'
    : 'Registered Squads';

export const gameDirectory = (slug) =>
  GAMES.find((g) => g.slug === slug)?.registration?.kind === 'solo'
    ? ROUTES.gamePlayers(slug)
    : ROUTES.gameTeams(slug);

/* Sections of the landing page, in the order they appear. The nav and the
   in-page anchors are both generated from this.

   Four, not eight. The About / Format / Prizes sections were cut — Format
   duplicated the rules that live on /events/iupc and Prizes had no figures to
   show. What the md: breakpoint actually depends on is the RENDERED link count
   in landingNav below, not this array — see the measurement there. */
export const LANDING_SECTIONS = [
  { id: 'events', label: 'Events' },
  { id: 'register', label: 'How to enter' },
  { id: 'timeline', label: 'Schedule' },
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

/* Landing nav: same-page anchors, plus the one cross-route entry with no other
   home in the header.

   Five links, and the count is load-bearing. At six this measured 734px inside
   a 736px container at the md: breakpoint — and the scrollbar declared in
   globals.css is 12px wide, so the real box is 724px and the header wrapped
   between 768px and ~778px. That is the same bug the gamingNav comment below
   describes. At five it measures 677px, in line with every other nav here.

   IUPC is deliberately absent: the gold CTA already resolves to
   ROUTES.eventRegister('iupc') and the "How to enter" section links to
   ROUTES.iupc, while /events/gaming has six events behind it and no other
   route link in the header. */
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

/* The catalogue's own two groups come first — they are the page's structure,
   and a nav that skips straight past it to Schedule and FAQ was navigating
   around the content rather than through it. Five links, the same ceiling
   landingNav sits under. */
export const eventsIndexNav = [
  { label: 'Home', href: ROUTES.home },
  { label: 'Tech', href: '#tech' },
  { label: 'Gaming Arenas', href: '#gaming' },
  { label: 'Gaming Fest', href: ROUTES.gaming },
  ...homeNav.filter((link) => link.label === 'FAQ'),
];

/* Fixed anchors, not one link per game. Spreading GAMES worked at three games
   and overflowed the 768px navbar at six — and it would break again on the
   seventh. The two family sections are the stable way in. */
export const gamingNav = [
  { label: 'Home', href: ROUTES.home },
  { label: 'All Events', href: ROUTES.events },
  { label: 'Esports', href: '#esports' },
  { label: 'Board & Puzzle', href: '#board' },
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

/* Nav for an event's directory pages. Each links to its sibling so the two
   are reachable from one another without going back to the event page. */
export const eventTeamsNav = (slug) => {
  const nav = [
    { label: 'Home', href: ROUTES.home },
    { label: 'Event Details', href: ROUTES.event(slug) },
  ];
  if (slug === 'iupc') {
    nav.push({ label: 'Slot Allocations', href: ROUTES.eventSlots(slug) });
  }
  nav.push({ label: 'All Events', href: ROUTES.events });
  return nav;
};

export const eventSlotsNav = (slug) => [
  { label: 'Home', href: ROUTES.home },
  { label: 'Event Details', href: ROUTES.event(slug) },
  { label: 'Registered Teams', href: ROUTES.eventTeams(slug) },
  { label: 'All Events', href: ROUTES.events },
];

/* Nav for a game's registration page — back out to the game, or sideways. */
export const gameRegisterNav = (slug) => [
  { label: 'Home', href: ROUTES.home },
  { label: 'Game Details', href: ROUTES.game(slug) },
  { label: 'All Games', href: ROUTES.gaming },
  ...(hasGameDirectory(slug)
    ? [{ label: gameDirectoryLabel(slug), href: gameDirectory(slug) }]
    : []),
];

/* Nav for a game's public directory. No "Register" entry — the gold CTA in the
   header already resolves there, and listing it twice made the two read as
   different destinations. */
export const gameDirectoryNav = (slug) => [
  { label: 'Home', href: ROUTES.home },
  { label: 'Game Details', href: ROUTES.game(slug) },
  { label: 'Rules', href: `${ROUTES.game(slug)}#rules` },
  { label: 'All Games', href: ROUTES.gaming },
];

/* Every crawlable page. Consumed by src/app/sitemap.js. */
export const siteUrls = () => [
  { path: ROUTES.home, priority: 1 },
  { path: ROUTES.events, priority: 0.9 },
  ...EVENT_PAGE_SLUGS.map((slug) => ({
    path: ROUTES.event(slug),
    /* An announced page carries a paragraph; a published one carries the
       whole event. Rank them accordingly. */
    priority:
      EVENT_DETAILS.find((e) => e.slug === slug)?.stage === 'announced'
        ? 0.5
        : 0.9,
  })),
  ...REGISTRABLE_EVENTS.flatMap((event) => [
    { path: ROUTES.eventRegister(event.slug), priority: 0.9 },
    { path: ROUTES.eventTeams(event.slug), priority: 0.6 },
    { path: ROUTES.eventSlots(event.slug), priority: 0.6 },
  ]),
  { path: ROUTES.gaming, priority: 0.9 },
  ...GAME_PAGE_SLUGS.flatMap((slug) => {
    const game = GAMES.find((g) => g.slug === slug);
    return [
      { path: ROUTES.game(slug), priority: game?.stage === 'announced' ? 0.5 : 0.8 },
      /* A closed form is a thin "opens soon" page — not worth indexing. */
      ...(game?.registrationOpen
        ? [
            { path: ROUTES.gameRegister(slug), priority: 0.7 },
            { path: gameDirectory(slug), priority: 0.6 },
          ]
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

  /* content.js hand-writes a `status` per event, but whether registration is
     actually open lives in events.js / gaming.js. The landing ledger derives
     the tier from the real flag; this catches the label going stale. */
  import('@/data/content')
    .then(({ EVENTS }) => {
      EVENTS.filter((e) => e.slug).forEach((e) => {
        const detail =
          e.kind === 'game'
            ? GAMES.find((g) => g.slug === e.slug)
            : EVENT_DETAILS.find((d) => d.slug === e.slug);

        if (!detail) {
          console.warn(
            `[routes] EVENTS entry "${e.id}" points at slug "${e.slug}", which ` +
              `is not in ${e.kind === 'game' ? 'gaming.js' : 'events.js'}.`
          );
          return;
        }
        const expected = { open: 'open', published: 'live', announced: 'coming-soon' }[
          detail.stage
        ];
        if (!expected) {
          console.warn(
            `[routes] "${e.slug}" has stage "${detail.stage}". Expected one of ` +
              `open | published | announced.`
          );
        } else if (e.status !== expected) {
          console.warn(
            `[routes] EVENTS entry "${e.id}" has status "${e.status}" but ` +
              `${e.slug} has stage "${detail.stage}". Set status to ` +
              `"${expected}" in src/data/content.js, or the landing page will ` +
              `advertise the wrong state.`
          );
        }
      });
    })
    .catch(() => {});
}
