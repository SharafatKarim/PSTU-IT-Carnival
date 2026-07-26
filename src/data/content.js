// Landing-page content. Edit copy here without touching the UI.
//
// Every event that is open carries an `href` built from src/lib/routes.js —
// no path is spelled out by hand, so a route rename only happens in one place.

import { ROUTES } from '@/lib/routes';
import { getEventDetail } from './events';

/* Timeline dates come from the event's own data so the two can never drift. */
const IUPC = getEventDetail('iupc')?.tournament;

export const EVENT = {
  university: 'Patuakhali Science and Technology University',
  title: 'PSTU IT Carnival 2026',
  tagline: 'South Zone’s Largest Tech Competition',
  intro:
    'Three days, twelve events, one stage — competitive programming, hackathons, data science, quizzes, project showcases and gaming at Patuakhali Science and Technology University.',
  date: '13–15 August 2026',
  venue: 'CSE–FBA Building, PSTU',
  format: 'Onsite · 3 Days',
  /* Deadline drives the hero badge — the old "৳450K+ prize pool" claim went
     when IUPC stopped publishing prize figures. */
  registrationDeadline: '31 July 2026',
  organizer: 'CSE Club, PSTU',
  website: 'itcarnival26.pstu.ac.bd',
  contactEmail: '',
};

// `status: 'open'` is the one featured event; 'live' events get a linked card;
// everything else renders as a disabled 'coming-soon' card. Any event that is
// not 'coming-soon' must carry an `href`.
export const EVENTS = [
  {
    id: 'iupc',
    name: 'IUPC',
    scope: 'South Zone',
    category: 'tech',
    icon: 'code',
    blurb:
      'The flagship ICPC-style Inter-University Programming Contest. Teams of three, a 4–5 hour battle, one keyboard.',
    status: 'open',
    cta: 'Pre-Register',
    /* Resolves against src/data/events.js. The id 'iupc' happens to match its
       slug; the gaming ids do not, so every linked event states it. */
    slug: 'iupc',
    kind: 'event',
    href: ROUTES.iupc,
    registerHref: ROUTES.register,
  },
  {
    id: 'hackathon',
    name: 'Hackathon',
    scope: 'National',
    category: 'tech',
    icon: 'rocket',
    blurb:
      'Build a working product against the clock in a national-level innovation sprint for student teams.',
    status: 'coming-soon',
    slug: 'hackathon',
    kind: 'event',
    href: ROUTES.event('hackathon'),
  },
  {
    id: 'datathon',
    name: 'Datathon',
    scope: 'All Students',
    category: 'tech',
    icon: 'chart',
    blurb:
      'Turn raw data into insight — a data-science and analytics showdown for the sharpest minds.',
    status: 'live',
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
    status: 'coming-soon',
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
    scope: 'All Students',
    category: 'tech',
    icon: 'monitor',
    blurb:
      'Present your best software or hardware project to judges and the wider community.',
    status: 'coming-soon',
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
    status: 'live',
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
    status: 'live',
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
    status: 'coming-soon',
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
    status: 'coming-soon',
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
    status: 'live',
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
    status: 'coming-soon',
    slug: 'rubiks-cube',
    kind: 'game',
    href: ROUTES.game('rubiks-cube'),
  },
];

/* The four numbers the hero band shows. `Events` is read by name in
   EventsIndex.jsx — keep the label if you reorder these.

   Declared after EVENTS so the count can be counted. It was typed by hand and
   said 11 the day a twelfth event landed. */
export const STATS = [
  { value: '45', label: 'Team slots' },
  { value: 'Free', label: 'To pre-register' },
  { value: '31 Jul', label: 'Entries close' },
  { value: String(EVENTS.length), label: 'Events' },
];

export const ABOUT_POINTS = [
  {
    icon: 'spark',
    title: 'One Carnival, Twelve Arenas',
    text: 'From competitive programming to board games and esports, twelve events span every kind of talent under a single festival banner.',
  },
  {
    icon: 'code',
    title: 'Flagship IUPC · South Zone',
    text: "The centrepiece is our ICPC-style Inter-University Programming Contest, drawing the region’s strongest teams to compete for the title.",
  },
  {
    icon: 'users',
    title: 'For Coders & Gamers Alike',
    text: 'Whether you live in an IDE, a chessboard, or a battle-royale lobby, there is an arena with your name on it.',
  },
  {
    icon: 'monitor',
    title: 'More Than a Competition',
    text: 'A full three-day festival — project showcases, networking, an event t-shirt, and a community that celebrates building and playing.',
  },
];

export const TIMELINE = [
  {
    phase: 'Pre-Registration',
    date: `Closes ${IUPC?.deadline || '31 July 2026'}`,
    icon: 'calendar',
    text: 'Submit your team name, coach and all three members. Free — nothing is paid at this stage.',
  },
  {
    phase: 'Slots & Final Registration',
    date: 'Early August 2026',
    icon: 'clock',
    text: `Confirmed slots are published university-wise, then final registration opens for the listed teams with the ${IUPC?.entryShort || '৳3,000'} entry fee.`,
  },
  {
    phase: 'Practice Round',
    date: '12 August 2026',
    icon: 'code',
    text: 'Get familiar with the judge, the environment, and the workstation setup before it counts.',
  },
  {
    phase: 'Carnival Days',
    date: '13–15 August 2026',
    icon: 'flag',
    text: 'Three days of onsite battles across every arena — from the 4–5 hour IUPC to the gaming finals.',
  },
];

export const RULES = [
  'Each team must have exactly 3 members — no more, no fewer.',
  'Every team competes with one registered coach.',
  'Team names must be unique across all registrations.',
  'Each member needs a distinct email address and Codeforces handle.',
  'Members share a single workstation during the contest.',
  'Standings follow ICPC scoring: problems solved first, then penalty time.',
];

export const PRIZES = [
  {
    place: 'Champion',
    rank: 1,
    perks: ['Certificate of excellence', 'Winner trophy'],
  },
  {
    place: '1st Runner-Up',
    rank: 2,
    perks: ['Certificate of merit'],
  },
  {
    place: '2nd Runner-Up',
    rank: 3,
    perks: ['Certificate of merit'],
  },
];

export const FAQS = [
  {
    q: 'What events can I take part in?',
    a: "Twelve events across tech and gaming: IUPC (South Zone), Hackathon (National), Datathon, IT Quiz (Barishal Division), CTF, Project Showcasing, plus PUBG Mobile, Free Fire, eFootball, Chess, Ludo and Rubik’s Cube.",
  },
  {
    q: 'Which events are open for registration right now?',
    a: 'Only IUPC (South Zone), and only for pre-registration. The three gaming tournaments have their formats, rules and prizes published, but entries have not opened yet. The rest of the line-up follows later.',
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
    a: 'IUPC pre-registration is free. The ৳3,000 per-team entry fee applies at final registration, once confirmed slots are published university-wise. Gaming tournaments have their own entry fees, listed on each game page. No payment is ever collected through this website.',
  },
  {
    q: 'How will I know my registration went through?',
    a: 'After submitting, you receive a unique registration ID (e.g. PSTU-IUPC-2026-0001). Save it — it is your reference for all future correspondence.',
  },
];
