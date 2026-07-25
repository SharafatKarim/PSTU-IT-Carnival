// Landing-page content. Edit copy here without touching the UI.

export const EVENT = {
  university: 'Patuakhali Science and Technology University',
  title: 'PSTU IT Carnival 2026',
  tagline: "South Zone's Largest Tech Competition",
  intro:
    'Three days, eleven events, one stage — competitive programming, hackathons, data science, quizzes, project showcases and gaming at Patuakhali Science and Technology University.',
  date: '13–15 August 2026',
  venue: 'CSE–FBA Building, PSTU',
  format: 'Onsite · 3 Days',
  prizePool: '৳450K+',
  organizer: 'CSE Club, PSTU',
  website: 'pstuitcarnival2026.com',
  contactEmail: 'rajesh18@cse.pstu.ac.bd',
};

export const STATS = [
  { value: '৳450K+', label: 'Prize pool' },
  { value: '11', label: 'Events' },
  { value: '5', label: 'Tech competitions' },
  { value: '6', label: 'Gaming & fun' },
];

// One event is 'open' at a time (featured + routes to the form); the rest
// are 'coming-soon' (disabled cards).
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
  },
  {
    id: 'datathon',
    name: 'Datathon',
    scope: 'Open',
    category: 'tech',
    icon: 'chart',
    blurb:
      'Turn raw data into insight — a data-science and analytics showdown for the sharpest minds.',
    status: 'coming-soon',
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
  },
  {
    id: 'project-showcase',
    name: 'Project Showcasing',
    scope: 'Open',
    category: 'tech',
    icon: 'monitor',
    blurb:
      'Present your best software or hardware project to judges and the wider community.',
    status: 'coming-soon',
  },
  {
    id: 'pubg',
    name: 'PUBG',
    scope: 'Esports',
    category: 'gaming',
    icon: 'gamepad',
    blurb: 'Squad up for the battle royale. Last team standing takes the crown.',
    status: 'coming-soon',
  },
  {
    id: 'free-fire',
    name: 'Free Fire',
    scope: 'Esports',
    category: 'gaming',
    icon: 'flame',
    blurb: 'Fast, furious mobile battle royale. Drop in, gear up, survive.',
    status: 'coming-soon',
  },
  {
    id: 'chess',
    name: 'Chess',
    scope: 'Board',
    category: 'gaming',
    icon: 'crown',
    blurb: 'Classic strategy on 64 squares. Outthink your opponent, move by move.',
    status: 'coming-soon',
  },
  {
    id: 'ludo',
    name: 'Ludo',
    scope: 'Board',
    category: 'gaming',
    icon: 'dice',
    blurb: 'Roll the dice and race home in the ever-chaotic fan favourite.',
    status: 'coming-soon',
  },
  {
    id: 'pes',
    name: 'eFootball (PES)',
    scope: 'Esports',
    category: 'gaming',
    icon: 'ball',
    blurb: 'Virtual football glory — skill, tactics and last-minute winners.',
    status: 'coming-soon',
  },
  {
    id: 'rubiks',
    name: "Rubik's Cube",
    scope: 'Speed',
    category: 'gaming',
    icon: 'cube',
    blurb: 'Race the clock to solve the cube. Fastest fingers, sharpest mind.',
    status: 'coming-soon',
  },
];

export const ABOUT_POINTS = [
  {
    icon: 'spark',
    title: 'One Carnival, Eleven Arenas',
    text: 'From competitive programming to board games and esports, eleven events span every kind of talent under a single festival banner.',
  },
  {
    icon: 'code',
    title: 'Flagship IUPC · South Zone',
    text: "The centrepiece is our ICPC-style Inter-University Programming Contest, drawing the region's strongest teams to compete for the title.",
  },
  {
    icon: 'users',
    title: 'For Coders & Gamers Alike',
    text: 'Whether you live in an IDE, a chessboard, or a battle-royale lobby, there is an arena with your name on it.',
  },
  {
    icon: 'monitor',
    title: 'More Than a Competition',
    text: 'A full festival day — project showcases, networking, an event t-shirt, and a community that celebrates building and playing.',
  },
];

export const TIMELINE = [
  {
    phase: 'Registration Opens',
    date: 'June 2026',
    icon: 'calendar',
    text: 'IUPC pre-registration goes live. Lock in your team name early — names are first-come, first-served.',
  },
  {
    phase: 'Registration Deadline',
    date: 'July 2026',
    icon: 'clock',
    text: 'Final call to submit your team, coach, and member details. Late entries cannot be accepted.',
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
    perks: ['Certificate of excellence', 'Cash prize from the pool'],
  },
  {
    place: '1st Runner-Up',
    rank: 2,
    perks: ['Certificate of merit', 'Cash prize from the pool'],
  },
  {
    place: '2nd Runner-Up',
    rank: 3,
    perks: ['Certificate of merit', 'Cash prize from the pool'],
  },
];

export const FAQS = [
  {
    q: 'What events can I take part in?',
    a: "Eleven events across tech and gaming: IUPC (South Zone), Hackathon (National), Datathon, IT Quiz (Barishal Division), Project Showcasing, plus PUBG, Free Fire, Chess, Ludo, eFootball (PES) and Rubik's Cube.",
  },
  {
    q: 'Which events are open for registration right now?',
    a: 'IUPC (South Zone) pre-registration is live now. Registration for the remaining events opens soon — keep an eye on this page for updates.',
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
    a: 'No payment is collected through this portal. Any on-site logistics will be communicated by the organizing committee after registration.',
  },
  {
    q: 'How will I know my registration went through?',
    a: 'After submitting, you receive a unique registration ID (e.g. PSTU-PC-2026-0001). Save it — it is your reference for all future correspondence.',
  },
];
