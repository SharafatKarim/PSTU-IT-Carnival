// Landing-page content. Edit copy here without touching the UI.
//
// Every event that is open carries an `href` built from src/lib/routes.js —
// no path is spelled out by hand, so a route rename only happens in one place.

import { ROUTES } from '@/lib/routes';
import { getEventDetail } from './events';
import { getGame } from './gaming';

/* Timeline dates come from the event's own data so the two can never drift. */
const IUPC = getEventDetail('iupc')?.tournament;
const DATATHON = getEventDetail('datathon')?.tournament;

export const EVENT = {
  university: 'Patuakhali Science and Technology University',
  title: 'PSTU IT Carnival 2026',
  tagline: 'South Zone’s Largest Tech Competition',
  intro:
    'Three days, twelve events, one stage — competitive programming, hackathons, data science, quizzes, project showcases and gaming at Patuakhali Science and Technology University.',
  date: '27–29 August 2026',
  venue: 'CSE–FBA Building, PSTU',
  format: 'Onsite · 3 Days',
  organizer: 'CSE Club, PSTU',
  website: 'itcarnival26.pstu.ac.bd',
  contactEmail: '',
};

/* Volunteer sign-ups sit outside the EVENTS list — own route, own form, own
   model — so they need their own switch. Flipping registrationOpen shuts the
   navbar CTA, the modal, the /volunteer page and the POST API together. The
   API check is the one that actually enforces it; the rest is just not
   offering a form nobody can submit. */
export const VOLUNTEER = {
  registrationOpen: false,
  closedHeading: 'Volunteer registration is closed',
  closedNote:
    'We have taken all the volunteer applications we need for PSTU IT Carnival 2026 — thank you to everyone who signed up. If you already registered, keep your registration ID safe; the organizing team will reach you before the carnival.',
};

// `status: 'open'` means entries are being taken right now; 'live' events have
// their rules published but no form yet and get a plain linked card; everything
// else renders as a disabled 'coming-soon' card. Any event that is not
// 'coming-soon' must carry an `href`.
//
// These must agree with `stage` in events.js / gaming.js — open ↔ 'open',
// live ↔ 'published', coming-soon ↔ 'announced'. The drift guard at the bottom
// of src/lib/routes.js warns in development when they do not.
export const EVENTS = [
  {
    id: 'iupc',
    name: 'IUPC',
    scope: 'South Zone',
    category: 'tech',
    icon: 'code',
    blurb:
      'The flagship ICPC-style Inter-University Programming Contest. Teams of three, a 4–5 hour battle, one keyboard.',
    /* Pre-registration closed 2 August 2026 and REOPENED when the carnival
       moved to 27–29 August; it closes again 20 August. `status` must track
       `stage` in events.js — the drift guard at the bottom of
       src/lib/routes.js warns in development when it does not, and
       scripts/check-data.mjs fails the build over it, which is how this line
       was caught rather than shipped. */
    status: 'open',
    cta: 'Pre-Register',
    registerHref: '/events/iupc/register',
    /* Resolves against src/data/events.js. The id 'iupc' happens to match its
       slug; the gaming ids do not, so every linked event states it. */
    slug: 'iupc',
    kind: 'event',
    href: ROUTES.iupc,
  },
  {
    id: 'hackathon',
    name: 'Hackathon',
    scope: 'National',
    category: 'tech',
    icon: 'rocket',
    blurb:
      'Build a working product against the clock in a national-level innovation sprint for student teams.',
    status: 'open',
    cta: 'Final Registration',
    registerHref: ROUTES.eventTeams('hackathon'),
    slug: 'hackathon',
    kind: 'event',
    href: ROUTES.event('hackathon'),
  },
  {
    id: 'datathon',
    name: 'Datathon',
    scope: 'National',
    category: 'tech',
    icon: 'chart',
    blurb:
      'Turn raw data into insight — a data-science and analytics showdown for the sharpest minds.',
    status: 'open',
    slug: 'datathon',
    kind: 'event',
    href: ROUTES.event('datathon'),
  },
  {
    id: 'it-quiz',
    name: 'IT Quiz',
    scope: 'Division · Barishal',
    category: 'tech',
    icon: 'lightbulb',
    blurb:
      'Test your tech knowledge across computing, history and trivia in a fast-paced buzzer quiz.',
    status: 'open',
    cta: 'Register',
    registerHref: ROUTES.eventRegister('it-quiz'),
    slug: 'it-quiz',
    kind: 'event',
    href: ROUTES.event('it-quiz'),
  },
  {
    id: 'ctf',
    name: 'CTF',
    scope: 'Inter-University',
    category: 'tech',
    icon: 'shield',
    blurb:
      'A jeopardy-style security contest — web, forensics, reverse engineering and cryptography challenges solved against the clock.',
    status: 'coming-soon',
    slug: 'ctf',
    kind: 'event',
    href: ROUTES.event('ctf'),
  },
  {
    id: 'project-showcase',
    name: 'Project Showcasing',
    scope: 'South Zone',
    category: 'tech',
    icon: 'monitor',
    blurb:
      "Whether it's an intelligent IoT system, an automated microcontroller-based circuit using Arduino or Raspberry Pi, or any innovative hardware prototype, this is your platform to bring your ideas to life.",
    status: 'open',
    cta: 'Register',
    registerHref: ROUTES.eventRegister('project-showcase'),
    slug: 'project-showcase',
    kind: 'event',
    href: ROUTES.event('project-showcase'),
  },
  {
    id: 'pubg',
    name: 'PUBG Mobile',
    scope: 'Esports · Squad',
    category: 'gaming',
    icon: 'gamepad',
    blurb: 'Squad up for the battle royale. Last team standing takes the crown.',
    status: 'open',
    slug: 'pubg-mobile',
    kind: 'game',
    href: ROUTES.game('pubg-mobile'),
  },
  {
    id: 'free-fire',
    name: 'Free Fire',
    scope: 'Esports · Squad',
    category: 'gaming',
    icon: 'flame',
    blurb: 'Fast, furious mobile battle royale. Drop in, gear up, survive.',
    status: 'open',
    slug: 'free-fire',
    kind: 'game',
    href: ROUTES.game('free-fire'),
  },
  {
    id: 'chess',
    name: 'Chess',
    scope: 'Board',
    category: 'gaming',
    icon: 'crown',
    blurb: 'Classic strategy on 64 squares. Outthink your opponent, move by move.',
    status: 'open',
    slug: 'chess',
    kind: 'game',
    href: ROUTES.game('chess'),
  },
  {
    id: 'ludo',
    name: 'Ludo',
    scope: 'Board',
    category: 'gaming',
    icon: 'dice',
    blurb: 'Roll the dice and race home in the ever-chaotic fan favourite.',
    status: 'open',
    cta: 'Register',
    registerHref: ROUTES.gameRegister('ludo'),
    slug: 'ludo',
    kind: 'game',
    href: ROUTES.game('ludo'),
  },
  {
    id: 'pes',
    name: 'eFootball',
    scope: 'Esports · 1v1',
    category: 'gaming',
    icon: 'ball',
    blurb: 'Virtual football glory — skill, tactics and last-minute winners.',
    status: 'open',
    slug: 'efootball',
    kind: 'game',
    href: ROUTES.game('efootball'),
  },
  {
    id: 'rubiks',
    name: 'Rubik’s Cube',
    scope: 'Speed',
    category: 'gaming',
    icon: 'cube',
    blurb: 'Race the clock to solve the cube. Fastest fingers, sharpest mind.',
    status: 'open',
    slug: 'rubiks-cube',
    kind: 'game',
    href: ROUTES.game('rubiks-cube'),
  },
];

/* ---------------------------------------------------------------------------
   Everything below is counted, not typed.

   The hand-written version said eleven the day a twelfth event landed, and left
   the line-up lede claiming "Three" published after the datathon became the
   fourth. Both numbers now come from the same `stage` field the ledger groups
   on, so the sentence and the list it introduces cannot disagree.

   This lives here rather than in Lineup.jsx because that component is
   'use client' and data logic does not belong there. The import is acyclic —
   gaming.js pulls only @/lib/patterns, events.js pulls nothing.
   --------------------------------------------------------------------------- */
const detailFor = (event) =>
  !event.slug
    ? null
    : event.kind === 'game'
      ? getGame(event.slug)
      : getEventDetail(event.slug);

export const tierOf = (event) => detailFor(event)?.stage || 'announced';

export const EVENT_TIERS = EVENTS.reduce(
  (acc, event) => {
    acc[tierOf(event)].push(event);
    return acc;
  },
  { open: [], published: [], announced: [] }
);

/* The page spells its numbers as words everywhere else, so these match. */
const WORDS = [
  'No',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
];
export const word = (n) => WORDS[n] || String(n);

/* The four numbers the hero band shows. Exactly four — HeadlineStrip slices to
   four and its per-cell border maths assumes it.

   These used to be 45 team slots / Free / 31 Jul, all three of which the hero's
   own panel prints 200px above, and two of which were hand-typed copies of
   events.js. The band now says what only the band can say: what the carnival
   contains. `Events` is read BY NAME in EventsIndex.jsx — keep that label. */
const countTier = (tier) => EVENT_TIERS[tier].length;
const countCategory = (category) =>
  EVENTS.filter((event) => event.category === category).length;

export const STATS = [
  { value: String(EVENTS.length), label: 'Events' },
  { value: String(countCategory('tech')), label: 'Tech contests' },
  { value: String(countCategory('gaming')), label: 'Gaming arenas' },
  {
    value: String(countTier('open') + countTier('published')),
    label: 'With full rules',
  },
];


/* Four stops, chronological — currentStop() requires the order, and
   sm:grid-cols-2 lg:grid-cols-4 on the landing page requires the count.

   Every stop names whose deadline it is. The old list was IUPC, IUPC, IUPC,
   carnival under a section titled "The road to carnival day", which read as the
   whole festival's schedule. The dropped practice round is still stated on
   /events/iupc, the page that owns it. */
export const TIMELINE = [
  {
    phase: 'IUPC pre-registration',
    date: `Closes ${IUPC?.deadline || '31 July 2026'}`,
    icon: 'calendar',
    text: 'Submit your team name, coach and all three members. Free — nothing is paid at this stage.',
  },
  {
    phase: 'IUPC final registration',
    date: 'Early August 2026',
    icon: 'clock',
    text: `Confirmed slots are published university-wise, then final registration opens for the listed teams with the ${IUPC?.entryShort || '৳3,000'} entry fee.`,
  },
  {
    phase: 'Datathon window',
    date: DATATHON?.date || 'August 2026',
    icon: 'chart',
    /* No submission time printed — events.js disagrees with itself on whether
       it is 11:58 or 11:59 PM. And no call to action: the datathon has
       registrationOpen: false, so inviting entries here would be a dead end. */
    text: 'The one contest that finishes before anyone reaches Patuakhali — days of work online, submitted from wherever you are. Entries have not opened yet.',
  },
  {
    phase: 'Carnival days',
    date: EVENT.date,
    icon: 'flag',
    text: 'Three days onsite across every arena — the IUPC, the gaming finals, and the closing ceremony.',
  },
];



export const FAQS = [
  {
    q: 'Which events are open for registration right now?',
    a: 'All three esports tournaments — eFootball, PUBG Mobile and Free Fire. IUPC (South Zone) pre-registration has now closed; confirmed slots are published university-wise, and final registration then opens for the listed teams. The datathon has its format, rules and prizes published but entries have not opened yet, and the rest of the line-up follows later.',
  },
  {
    q: 'How many members can an IUPC team have?',
    a: 'Exactly three. The registration form requires all three members before you can submit — teams of one, two, or four are not eligible.',
  },
  {
    q: 'Who can participate?',
    a: 'Undergraduate students competing under their university, each with a valid email address and Codeforces handle. Your coach registers alongside the team.',
  },
  {
    q: 'Is there a registration or participation fee?',
    a: 'It depends on the event. IUPC pre-registration is free — the ৳3,000 per-team entry fee applies at final registration, once confirmed slots are published university-wise. PUBG Mobile is free to enter. The other esports tournaments are paid when you register: ৳25 per player for Free Fire (৳100 for a full squad of four) and ৳100 per player for eFootball, sent by bKash or Nagad Send Money, with the transaction ID entered on the form. The Datathon works the same way at BDT 300 per team. Nothing is collected in cash at the venue.',
  },
  {
    q: 'How will I know my registration went through?',
    a: 'After submitting, you receive a unique registration ID (e.g. PSTU-IUPC-2026-0001). Save it — it is your reference for all future correspondence.',
  },
];
