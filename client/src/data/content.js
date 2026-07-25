/**
 * Central content file for the PSTU IT Carnival 2026 landing page.
 * Edit the copy here — venue, dates, prizes, FAQs — without touching the UI.
 * Anything marked as illustrative should be replaced with the official details
 * once they are confirmed by the organizing committee.
 */

export const EVENT = {
  university: 'Patuakhali Science and Technology University',
  shortName: 'PSTU IT Carnival 2026',
  title: 'PSTU IT Carnival 2026',
  tagline: 'Inter-University Programming Contest',
  intro:
    'Three coders. Five hours. One keyboard. Bring your team to the biggest competitive programming stage at Patuakhali Science and Technology University.',
  // Illustrative schedule details — confirm with the organizing committee.
  date: 'March 2026',
  venue: 'Central Auditorium, PSTU Campus, Dumki, Patuakhali',
  format: 'ICPC-style · Onsite',
  contactEmail: 'itcarnival@pstu.ac.bd',
};

export const STATS = [
  { value: '3', label: 'Coders per team' },
  { value: '5 hrs', label: 'Contest duration' },
  { value: '10+', label: 'Algorithmic problems' },
  { value: '1', label: 'Shared workstation' },
];

export const ABOUT_POINTS = [
  {
    icon: 'code',
    title: 'ICPC-style Format',
    text: 'Teams of three solve a shared problem set on a single workstation, ranked by problems solved and total penalty time — the classic ICPC scoring model.',
  },
  {
    icon: 'trophy',
    title: 'Compete Nationally',
    text: 'Go head-to-head with the sharpest teams from universities across Bangladesh and prove your team belongs at the top of the standings.',
  },
  {
    icon: 'users',
    title: 'Built for Teams',
    text: 'Every squad brings exactly three members and one coach. Strategy, role-splitting, and clean collaboration matter as much as raw speed.',
  },
  {
    icon: 'spark',
    title: 'More Than a Contest',
    text: 'A full IT Carnival day — networking, a swag t-shirt for every participant, and a community of problem-solvers who love the craft.',
  },
];

export const TIMELINE = [
  {
    phase: 'Registration Opens',
    date: 'January 2026',
    text: 'Team registration goes live. Lock in your team name early — names are first-come, first-served.',
  },
  {
    phase: 'Registration Deadline',
    date: 'February 2026',
    text: 'Final call to submit your team, coach, and member details. Late entries cannot be accepted.',
  },
  {
    phase: 'Practice Round',
    date: 'A day before the contest',
    text: 'Get familiar with the judge, the environment, and the workstation setup before it counts.',
  },
  {
    phase: 'Main Contest',
    date: 'March 2026',
    text: 'Five hours, one problem set, one keyboard. The onsite battle for the championship.',
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
    perks: ['Champion trophy', 'Winner medals', 'Certificate of excellence'],
  },
  {
    place: '1st Runner-Up',
    rank: 2,
    perks: ['Runner-up trophy', 'Silver medals', 'Certificate of merit'],
  },
  {
    place: '2nd Runner-Up',
    rank: 3,
    perks: ['Runner-up trophy', 'Bronze medals', 'Certificate of merit'],
  },
];

export const FAQS = [
  {
    q: 'How many members can a team have?',
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
    q: 'What do I need before registering?',
    a: 'A unique team name, your varsity name, coach details, and for each of the three members: name, email, phone, Codeforces handle, and t-shirt size.',
  },
  {
    q: 'How will I know my registration went through?',
    a: 'After submitting, you receive a unique registration ID (e.g. PSTU-PC-2026-0001). Save it — it is your reference for all future correspondence.',
  },
  {
    q: 'Can I edit my details after submitting?',
    a: 'Review your entries carefully on the summary screen before confirming. For changes after submission, reach out to the organizing committee directly.',
  },
];
