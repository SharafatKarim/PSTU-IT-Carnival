// ---------------------------------------------------------------------------
// Detail pages for the tech events. Same object shape as src/data/gaming.js,
// so the TournamentInfo / RulesSection / CoordinatorContact components are
// shared between /events/[slug] and /gaming/[slug] with no changes.
//
// This file imports nothing, so src/lib/routes.js can read it without a cycle.
//
// >>> PLACEHOLDER VALUES <<<
// Times, entry fee, prize amounts, slot counts and coordinator contacts are
// stand-ins. Replace them with the confirmed figures before going live.
// ---------------------------------------------------------------------------

/* ---------------------------------------------------------------------------
   IUPC final-registration payment.

   A constant, like GAMING_PAYMENT in gaming.js: the pages are server-rendered
   from this file alone, so the number is baked into the build and there is no
   database round trip in the payment step. Changing it means editing this line
   and redeploying.

   The METHOD LIST is what the form offers AND what the server validates
   against, so the two cannot disagree.

   `total` is what a team sends: Send Money from a personal wallet costs the
   sender a cash-out charge, and the team covers it so the committee receives
   the whole fee. Computed rather than written out, so the figure on the form,
   the figure in the confirmation and the figure recorded against the payment
   are one number.
   ---------------------------------------------------------------------------
 */
/* THE deadline. Everything else about it is derived from this one string.

   An instant with an explicit +06:00, not a date: the contest is in Dhaka and
   the cutoff has to fall at the same moment for a team paying from Khulna and
   a coordinator checking from anywhere else. A bare '2026-08-06' would be
   parsed as UTC midnight and shut the window six hours early.

   23:59:59 rather than 23:59:00 so the whole of the final minute counts —
   "11:59 PM" reads as the last minute of the day, and it should behave that
   way. */
const IUPC_PAYMENT_DEADLINE = '2026-08-06T23:59:59+06:00';

const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000;
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/* The instant above, written the way the site writes dates: "6 August 2026,
   11:59 PM". Derived rather than typed beside it, because the two would
   eventually disagree and the one that loses is the human-readable half — the
   version on the poster, in the email and in the announcement, promising a
   date the button does not honour. Seconds are dropped; they are an
   implementation detail of "the end of that minute". */
const dhakaLabel = (iso) => {
  const shifted = new Date(new Date(iso).getTime() + DHAKA_OFFSET_MS);
  const hours = shifted.getUTCHours();
  const minutes = String(shifted.getUTCMinutes()).padStart(2, '0');
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return (
      `${shifted.getUTCDate()} ${MONTH_NAMES[shifted.getUTCMonth()]} ` +
      `${shifted.getUTCFullYear()}, ${hour12}:${minutes} ${
          hours < 12 ? 'AM' : 'PM'}`);
};

export const IUPC_PAYMENT = {
  number: '01790876259',
  accountType: 'Personal',
  methods: ['bKash', 'Nagad'],
  fee: 3000,
  cashOutCharge: 50,
  instructions:
      'Use “Send Money” (not Payment) from either wallet, then paste the transaction ID it gives you.',
  /* The machine-readable half — what the Pay button and the API compare
     against. Move the deadline by editing IUPC_PAYMENT_DEADLINE above; every
     page, email and check follows. */
  deadlineAt: IUPC_PAYMENT_DEADLINE,
  /* The human half. Announced on the event page, the landing panels, the slots
     page and the notification email, all of which read this rather than
     repeating the date. */
  deadline: dhakaLabel(IUPC_PAYMENT_DEADLINE),
};

/* Has the entry-fee window shut?
 *
 * Checked in BOTH places on purpose. The button reads it to stop offering a
 * form that cannot succeed; the API reads it because a disabled button is a
 * courtesy, not a control — the endpoint is public and a POST does not care
 * what the page rendered.
 *
 * `now` is injectable so the caller decides which clock: the browser passes
 * the client's (see useNow — these pages are prerendered, so build time is not
 * the current time), the server passes its own. */
export const iupcPaymentClosed = (now = new Date()) =>
    now.getTime() > new Date(IUPC_PAYMENT.deadlineAt).getTime();

export const iupcPaymentTotal = () =>
    IUPC_PAYMENT.fee + IUPC_PAYMENT.cashOutCharge;

export const EVENT_DETAILS = [
  {
    slug: 'iupc',
    name: 'IUPC',
    fullName: 'Inter-University Programming Contest',
    shortName: 'IUPC',
    icon: 'code',
    accent: 'aqua',
    scope: 'South Zone',
    mode: 'Team of 3',
    tagline:
        'The flagship ICPC-style contest — three coders, one keyboard, five hours.',
    blurb:
        'Teams of three share a single workstation and race through an algorithmic problem set. Standings follow ICPC scoring: problems solved first, then penalty time.',
    heroNote: 'Team entry — exactly 3 members, plus one registered coach.',

    /* Hero cover art, layered behind the gradients. Drop a replacement at
       public/events/iupc/ and point this at it — any format works, and the
       hero falls back to the plain gradient if this is removed.
       Aim for ~1600x900 and under 300 KB; it loads on every visit. */
    cover: '/events/iupc/cover.jpg',

    tournament: {
      date: '15 August 2026',
      time: '9:00 AM — 3:00 PM',
      venue: 'CSE–FBA Building, PSTU',
      entryFee: '৳3,000 per team',
      entryShort: '৳3,000',
      entryScope: 'per team',
      format: 'ICPC-style · 4–5 hours · one workstation',
      teamSize: '3 members (+1 coach)',
      teamSizeShort: '3 + coach',
      slots: '45 teams',
      platform: 'Onsite — workstations provided',
      /* Extended from 31 July. Every countdown, timeline stop and
         "entries close" line on the site reads this one value, so they all
         move with it — only the meta description in layout.js and the
         confirmation email spell the date out separately. */
      deadline: '2 August 2026',
    },

    /* Non-monetary only. Prize money has not been announced; add an
       `amount` to an entry when a figure is confirmed and TournamentInfo
       prints it. The landing page reads this same array, so the two cannot
       disagree. */
    prizes: [
      {
        place: 'Champion',
        rank: 1,
        perks: ['Winner trophy', 'Certificate of excellence'],
      },
      {place: '1st Runner-Up', rank: 2, perks: ['Certificate of merit']},
      {place: '2nd Runner-Up', rank: 3, perks: ['Certificate of merit']},
    ],

    rules: [
      {
        title: 'Team Composition',
        icon: 'users',
        items: [
          'Each team must have exactly 3 members — no more, no fewer.',
          'Every team competes with one registered coach.',
          'Team names must be unique across all registrations.',
          'Each member needs a distinct email address and student ID.',
          'The first member is the team leader — all correspondence goes to them.',
        ],
      },
      {
        title: 'Contest Format',
        icon: 'flag',
        items: [
          'Members share a single workstation for the whole contest.',
          'Standings follow ICPC scoring: problems solved first, then penalty time.',
          'The contest runs 4–5 hours in a single onsite session.',
          'A practice round is held the day before so you can test the judge and setup.',
        ],
      },
      {
        title: 'Eligibility',
        icon: 'user',
        items: [
          'Open to currently enrolled undergraduate students with a valid ID card.',
          'A student may represent only one team.',
          'Teams from any university in the South Zone are welcome.',
          'Bring your student ID on contest day — it is checked at the door.',
        ],
      },
      {
        title: 'Conduct',
        icon: 'shield',
        items: [
          'No internet access beyond the judge during the contest.',
          'Printed reference material is allowed; electronic devices are not.',
          'Any communication with people outside your team means disqualification.',
          'The judges’ decision is final in all disputes.',
        ],
      },
    ],

    /* How far along this event is. The landing ledger groups by this rather
       than inferring from registrationOpen, which cannot tell "announced
       only" apart from "published but closed". */
    stage: 'published',
    /* Flip to false to close entries without deleting the form. */
    registrationOpen: false,
    /* ...and this says WHY it is false. Every other published event means
       "entries have not opened yet"; IUPC pre-registration ran and has now
       shut, so the pages must say closed rather than coming soon. Without
       it the site invites people to wait for a form that will not return. */
    registrationClosed: true,
    /* Overrides the generic "entries have shut" card on the event page.
       Closing is no longer the news — the slots are out and the fee is
       due, so the card a team lands on has to say that and give the date
       the money has to be in by. The deadline is interpolated from
       IUPC_PAYMENT rather than typed again, and no href is stored here
       because this file names no URLs: EventDetail resolves the event's
       own teams directory. Any event may set this; the ones that do not
       keep the generic text. */
    registrationClosedNotice: {
      eyebrow: 'Entry Fee Due',
      title: 'Final registration is open — pay to confirm your slot',
      body:
          'Pre-registration has closed and every pre-registered team has a place. Open the team directory, find your team and press Pay to submit the entry fee and its transaction ID.',
      deadline: `Payment closes ${IUPC_PAYMENT.deadline}`,
      ctaLabel: 'Open the team directory',
    },
    registration: {
      /* 'form' means this event owns /events/<slug>/register. */
      kind: 'form',
      cta: 'Start Pre-Registration',
      note:
          'Pre-registration is free · Instant registration ID · Event t-shirt for every participant',
      /* Rendered as a numbered "how it works" list on the event page. */
      process: [
        'Pre-register your team here. Nothing is paid at this stage.',
        'Confirmed slots are published university-wise once pre-registration closes.',
        'Final registration then opens for the listed teams, with the ৳3,000 entry fee.',
      ],
      checklist: [
        'Your team name — it must be unique, so pick a backup too',
        'Your varsity name',
        'Coach name, email and phone number',
        'For each of the three members: name, email, phone, student ID and t-shirt size',
        'Which member is the team leader — they receive every email about your registration',
      ],
    },

    faqs: [
      {
        q: 'How many members can an IUPC team have?',
        a: 'Exactly three. The registration form requires all three members before you can submit — teams of one, two or four are not eligible.',
      },
      {
        q: 'Do we need a coach?',
        a: 'Yes. Every team registers with one coach, and their name, email and phone are part of the form.',
      },
      {
        q: 'Is there an entry fee?',
        a: 'Yes — ৳3,000 per team, but not at this stage. Pre-registering on this page costs nothing; the fee applies at final registration, which opens for the teams on the confirmed slot list. Payment details are published with that list.',
      },
      {
        q: 'How are the 45 slots allocated?',
        a: 'Pre-registration comes first. Once it closes we publish the confirmed slots university-wise, and final registration then opens for the teams on that list.',
      },
      {
        q: 'What happens after I submit the form?',
        a: 'You get a registration ID on screen straight away. Save it — it is how the committee identifies your team.',
      },
      {
        q: 'Can we swap a team member later?',
        a: 'Yes. Members can be swapped up to final registration — message the coordinators below with the replacement’s details and they will update your team.',
      },
    ],

    coordinators: [
      {
        name: 'Rajesh Biswas',
        role: 'IUPC Coordinator · CSE Club, PSTU',
        phone: '01400234847',
        email: 'rajesh18@cse.pstu.ac.bd',
        facebook: 'https://www.facebook.com/rajesh.biswas.152420',
      },
    ],
  },
  {
    slug: 'datathon',
    name: 'Datathon',
    fullName: 'PSTU Online Datathon 2026',
    shortName: 'Datathon',
    icon: 'chart',
    accent: 'magenta',
    scope: 'National',
    mode: 'Solo or Team of 2',
    tagline:
        'Specially tailored for beginners in Data Science and Machine Learning.',
    blurb:
        'An online datathon featuring a beginner-friendly tabular dataset. Test your skills in Exploratory Data Analysis, feature engineering, and model validation.',
    heroNote: 'Max 2 members per team (solo participation is also allowed).',
    /* No cover art yet. The hero skips both the image and its scrim when
       this is absent — pointing at a missing file only made the page
       darker. */
    cover: '/events/datathon/datathon3.jpeg',
    sponsor: {
      title: 'Proudly sponsored by',
      description:
          'This datathon is powered by Poridi. Poridhi transforms traditional engineering education into hands-on,digital experiences making learning immersive, practical and future-ready.  ',
      website: 'https://poridhi.io/',
      cta: 'Visit Sponsor',
    },
    /* Prizes accounment: */
    /*prizeNote: "Let's Welcome Our Sponsor Poridi.",*/
    prizes: [
      {
        place: '1st Prize',
        rank: 1,
        amount: '10,000 BDT',
      },
      {
        place: '2nd Prize',
        rank: 2,
        amount: '6,000 BDT',
      },
      {
        place: '3rd Prize',
        rank: 3,
        amount: '4,000',
      },
      {
        place: 'PSTU Best Junior 2 Team Prize',
        rank: 4,
        amount: 'To be announced',
        perks: ['Prize details will be announced soon']
      },
    ],

    tournament: {
      /*date: '8–12 August 2026',*/
      /*time: 'Starts Aug 8 (12:00 AM) — Ends Aug 12 (11:58 PM)',*/
      /*venue: 'Online (Code Submission via Google Form)',*/
      entryFee: '৳300 per team/participant',
      entryShort: '৳300',
      entryScope: 'per team',
      /*prizePool: 'To be announced',*/
      format:
          'Private Leaderboard evaluation + Jupyter Notebook Markdown review',
      teamSize: 'Max 2 members',
      teamSizeShort: 'Max 2',
      slots: 'Open to all university students',
      platform: 'Online',
      deadline: '8 August 2026, 11:59 PM',
    },

    rules: [
      {
        title: 'Eligibility & Team Rules',
        icon: 'users',
        items: [
          'All participants must be currently enrolled university students (undergraduate or postgraduate). Verification of student ID will be conducted.',
          'Teams can consist of a maximum of 2 members (solo participation is allowed).',
          'Members of a team can be from different universities.',
          'Registration fee is BDT 300 per team or participant.',
          'All team members must be declared during the initial registration process. Altering teams on the platform differs from official registration and leads to disqualification.',
          'Unregistered individual submissions without prior team registration will face immediate disqualification.'
        ],
      },
      {
        title: 'Event Schedule',
        icon: 'calendar',
        items: [
          'Competition starts: August 8, 2026 (12:00 AM).',
          'Google Form released for code submission: August 11, 2026.',
          'Competition ends & code submission deadline: August 12, 2026 (11:59 PM).',
          'Winners announcement & award ceremony: August 15, 2026, during the Grand Closing Ceremony of IT Carnival 2026.',
          'Physical presence is NOT mandatory. All prize money, digital certificates, and rewards will be transferred/dispatched online.'
        ],
      },
      {
        title: 'Evaluation Criteria',
        icon: 'chart',
        items: [
          'Private Leaderboard Score (90%): Evaluated against the hidden private test set.',
          'Hidden Metric: The exact evaluation metric will remain hidden/undisclosed from participants.',
          'Code Quality, Documentation & Presentation (10%): Evaluated based on code cleanliness, reproducibility, and clear Markdown documentation. The very top of your Jupyter Notebook must feature a comprehensive summary detailing your problem-solving approach (e.g., EDA, feature engineering, model selection). Additionally, participants are required to submit an online video presentation explaining their solution.'
        ],
      },
      {
        title: 'Fair Play & APIs',
        icon: 'shield',
        items: [
          'External paid or proprietary API keys (e.g. OpenAI, Claude, Gemini) are strictly prohibited.',
          'Open-source libraries and open pre-trained models (e.g. Hugging Face, LightGBM, XGBoost, CatBoost, PyTorch) are fully allowed.',
          'Plagiarism, multiple accounts, and private code sharing outside your team are strictly forbidden.'
        ],
      },
    ],

    stage: 'open',
    registrationOpen: true,
    registration: {
      kind: 'form',
      cta: 'Start Registration',
      note: 'Online registration is open · BDT 300 Entry Fee',
      process: [
        'Send BDT 300 to +8801921067682 (bKash personal) and save the Transaction ID.',
        'Fill in the registration form with your team name and member details.',
        'Submit your registration. Once the admin approves your transaction, you will receive a confirmation email.'
      ],
      checklist: [
        'Team Name (unique, letters/numbers/underscores)',
        'For each member: Name, Varsity Name, Student ID, Phone Number',
        'Kaggle Email and Kaggle Username for contest participation',
        'bKash Transaction ID of BDT 300'
      ],
    },

    faqs: [
      {
        q: 'Is physical presence at PSTU mandatory?',
        a: 'No. Physical presence at the venue is NOT mandatory for participants. All prize money, digital certificates, and rewards will be transferred/dispatched online to the winners.',
      },
      {
        q: 'Can members of a team be from different universities?',
        a: 'Yes, cross-university teams are fully allowed.',
      },
      {
        q: 'What models and libraries are allowed?',
        a: 'You are fully allowed to use open-source frameworks, PyTorch/TensorFlow, and open pre-trained models (including Hugging Face Transformers, LightGBM, XGBoost, CatBoost, etc.). Proprietary API keys like OpenAI or Gemini are prohibited.',
      },
      {
        q: 'When do I need to submit my code?',
        a: 'An official Google Form link will be provided on August 11, 2026. All participants must submit their final code (Jupyter Notebook / GitHub repository link) by August 12, 2026, at 11:59 PM.',
      },
    ],

    coordinators: [
      {
        name: 'Technical Support',
        role: 'Datathon Tech Team · CSE Club, PSTU',
        phone: 'Contact via Support Emails',
        email: 'ug2102030@cse.pstu.ac.bd',
      },
      {
        name: 'Technical Support',
        role: 'Datathon Tech Team · CSE Club, PSTU',
        phone: 'Contact via Support Emails',
        email: 'ug2102024@cse.pstu.ac.bd',
      },
      {
        name: 'Technical Support',
        role: 'Datathon Tech Team · CSE Club, PSTU',
        phone: 'Contact via Support Emails',
        email: 'ug2102009@cse.pstu.ac.bd',
      },
    ],
  },

  /* -------------------------------------------------------------------------
     Announced events.

   These carry only what is actually known — a name, what the event is, and
   who it is open to. No dates, fees, rules, slots or coordinators are
   invented: `stage: 'announced'` tells the UI to render the honest short
   page instead of a detail page full of placeholders.

       To promote one: add a `tournament` block, `rules`, `registration`, `faqs`
       and `coordinators` in the shape IUPC uses above, then change stage to
       'published'. The page fills itself in — no component changes.
       ---------------------------------------------------------------------------
     */
  {
    slug: 'hackathon',
    name: 'Hackathon',
    fullName: 'PSTU IT Carnival 2026 Hackathon',
    shortName: 'Hackathon',
    icon: 'rocket',
    accent: 'magenta',
    registrationClosedNotice: {
      eyebrow: 'Registration Closed',
      title: 'Pre-registration has closed',
      body: 'Registration is closed. The preliminary round results will be published soon.',
      ctaLabel: 'View Registered Teams',
    },
    cover: '/events/hackathon/cover.jpg',
    scope: 'National',
    tagline: '🚀 The Only National-Level Event of PSTU IT Carnival 2026',
    blurb:
        'Challenge yourself by solving real-world industry problems, collaborate with talented innovators, and compete for exciting prizes.',
    stage: 'published',
    registrationOpen: false,

    /* Phase 1 costs nothing, so this form takes no payment details at all —
       no transaction ID, no screenshot. The ৳2,000 applies at final
       registration, which opens for the shortlisted teams in August and is
       a separate flow. */
    entry: {
      kind: 'team',
      fee: 0,
      feeLabel: 'Free to pre-register · ৳2,000 per team at final registration',
      minMembers: 1,
      maxMembers: 2,
    },

    registration: {
      kind: 'form',
      cta: 'Pre-Register Your Team',
      note:
          'Pre-registration is free · 1 or 2 members · closes 2 August (7:00 PM)',
      process: [
        'Pre-register your team here before 2 August 7:00 PM. It costs nothing.',
        'Two emails follow with the problem statement. Build your solution and submit it as a presentation or abstract.',
        'Shortlisted teams get a selection email, then final registration runs 9–11 August with the ৳2,000 team fee.',
        'The on-site finale is 15 August at the TSC Conference Hall.',
      ],
      checklist: [
        'Your team name',
        'For each member: full name, email, WhatsApp number, university, department and t-shirt size',
        'A photo of each member — it goes on their badge and certificate',
        'A second member is optional; a team of one is allowed',
      ],
    },
    tournament: {
      date: '15 August 2026',
      time: '9:00 AM — 5:00 PM (questions emailed at 8:00 AM)',
      venue: 'TSC Conference Hall, PSTU',
      entryFee: 'Free to pre-register · ৳2,000 per team at final registration',
      entryShort: 'Free',
      entryScope: 'to pre-register',
      prizePool: '৳80,000',
      format: 'Onsite 6-hour competition',
      teamSize: '1 or 2 members',
      teamSizeShort: '1–2 members',
      slots: '50 teams',
      platform: 'On-site development and solution building',
      deadline: '2 August 2026, 7:00 PM',
    },
    rules: [
      {
        title: 'Phase 1: Free pre-registration & Preliminary Round',
        icon: 'users',
        items: [
          'Pre-registration runs 29 July to 2 August 2026 and is free.',
          'A team is one or two members. Entering alone is allowed.',
          'The preliminary round will be conducted online after the registration deadline.',
          'Participating teams will receive an industry-inspired problem statement covering domains such as AI/ML, Web Development, Mobile Applications, Backend Development, IoT, Cyber Security, or other software engineering fields.',
          'Teams will have a specified submission period to develop and submit their solutions, which will be evaluated by our judging panel.',
        ]
      },
      {
        title: 'Phase 2: Selection & Theme',
        icon: 'trophy',
        items: [
          'This is an industry-driven software engineering hackathon. Instead of focusing on a single theme, teams work on real-world problem statements inspired by industry needs.',
          'All submitted projects are evaluated by an expert judging panel based on innovation, technical implementation, scalability, user experience, and problem-solving.',
          'Shortlisted teams receive a selection email. Final paid registration then runs 9 to 11 August 2026 at ৳2,000 per team.',
          'Exactly 50 finalist teams will be selected for the grand finale.',
        ]
      },
      {
        title: 'Phase 3: On-Site Grand Finale',
        icon: 'clock',
        items: [
          '15 August 2026, TSC Conference Hall, PSTU.',
          'The final on-site round will feature a new industry-level problem statement that teams must solve within the allocated time (9:00 AM to 3:00 PM).',
          '৳2,000 per team, paid at final registration by the shortlisted teams only.',
          '8:00 AM — the final problem statement is emailed to every selected team.',
          '8:45 AM — all teams must be present in the hall.',
          '11:00 AM — mid evaluation; judges visit each booth.',
          '3:00 PM to 5:00 PM — final demonstration and jury evaluation.',
        ]
      },
      {
        title: 'Prizes & Rewards',
        icon: 'gift',
        items: [
          'Prize pool of ৳80,000.', 'Cash Prizes for the winners.',
          'Exclusive Gifts and Certificates for participants.',
          'Recognition & Networking Opportunities with developers and industry leaders.'
        ]
      }
    ],
    faqs: [
      {
        q: 'Is physical presence required for Phase 1?',
        a: 'No. Pre-registration and the first submission are fully online. You only need to be at PSTU if your team is shortlisted for the on-site finale on 15 August 2026.'
      },
      {
        q: 'What is the team size?',
        a: 'One or two members. A second member is optional — entering alone is allowed, and a team can never be larger than two.'
      },
      {
        q: 'What fields/domains will the problem statements cover?',
        a: 'Problem statements will cover real-world software engineering domains, including but not limited to: Frontend, Backend, AI/ML, IoT, Cyber Security, and Mobile App Development.'
      }
    ],
    coordinators: [
      {
        name: 'Meheraj',
        role: 'Event Coordinator · CSE Club, PSTU',
        phone: '01825809073',
        email: 'ug2102057@cse.pstu.ac.bd',
      },
      {
        name: 'Tanmoy Kumar Das',
        role: 'Event Coordinator · CSE Club, PSTU',
        phone: '01782847103',
        email: 'ug2102079@cse.pstu.ac.bd',
      },
    ]
  },
  {
    slug: 'it-quiz',
    name: 'IT Quiz',
    fullName: 'IT Quiz — Barishal Division',
    shortName: 'IT Quiz',
    icon: 'lightbulb',
    accent: 'gold',
    scope: 'Division · Barishal',
    tagline: 'Computing, history and trivia, on the buzzer.',
    blurb:
        'A fast-paced buzzer quiz across computing, its history and the trivia in between.',
    heroNote: 'Individual participation — no team required.',

    tournament: {
      date: '14 August 2026',
      time: '10:00 AM',
      venue: 'TSC Conference Room',
      entryFee: '৳100 per participant',
      entryShort: '৳100',
      entryScope: 'per participant',
      feePerPlayer: 100,
      format: 'Onsite (Written preliminary round, then a buzzer final)',
      teamSize: 'Individual (Solo)',
      teamSizeShort: 'Individual',
      slots: '100 participants',
      platform: 'On-site',
      deadline: '10 August 2026',
    },

    prizes: [
      {
        place: 'Champion',
        rank: 1,
        amount: '৳2,500',
        perks: ['Certificate of merit'],
      },
      {
        place: '1st Runner-Up',
        rank: 2,
        amount: '৳2,000',
        perks: ['Certificate of merit'],
      },
      {
        place: '2nd Runner-Up',
        rank: 3,
        amount: '৳1,500',
        perks: ['Certificate of merit'],
      },
      {
        place: '3rd Runner-Up',
        rank: 4,
        amount: '৳1,000',
        perks: ['Certificate of merit'],
      },
      {
        place: '4th Runner-Up',
        rank: 5,
        amount: '৳500',
        perks: ['Certificate of merit'],
      },
    ],

    rules: [
      {
        title: 'Eligibility & Format',
        icon: 'users',
        items: [
          'Open to undergraduate students of any university in the Barishal division.',
          'Individual entry — there are no teams.',
          'A written preliminary round narrows the field; the shortlisted participants go through to a buzzer final.',
          'Questions cover computing, its history, and general technology trivia.',
        ],
      },
      {
        title: 'Conduct',
        icon: 'shield',
        items: [
          'Phones and smartwatches go in your bag, switched off, before the round starts.',
          'Any consultation with another participant during a round means disqualification.',
          'The quizmaster’s ruling on an answer is final.',
        ],
      },
      {
        title: 'Registration & Payment',
        icon: 'ticket',
        items: [
          'Send 100 BDT to +8801734322148 via bKash or Nagad (Personal).',
          'Keep your transaction ID and fill in the online registration form.',
          'Bring your student ID to the venue for the eligibility check.',
        ],
      },
    ],

    stage: 'open',
    registrationOpen: true,

    entry: {
      kind: 'solo',
      fee: 100,
      feeLabel: '৳100 per participant',
      receiverNumber: '+8801734322148',
      accountType: 'Personal',
      methods: ['bKash', 'Nagad'],
    },

    faqs: [
      {
        q: 'Do I need a team?',
        a: 'No. IT Quiz is an individual event — you register and compete on your own.',
      },
      {
        q: 'When is my registration confirmed?',
        a: 'You get a registration ID the moment you submit. It is confirmed once the committee has matched your ৳100 against the wallet statement.',
      },
    ],

    registration: {
      kind: 'form',
      cta: 'Register for IT Quiz',
      note: 'Individual entry · ৳100',
      process: [
        'Send ৳100 to +8801734322148 via bKash or Nagad (Personal) and keep the confirmation.',
        'Fill in your details and enter the transaction ID.',
        'Submit. You get a registration ID immediately, and a confirmation once the payment is checked.',
      ],
      checklist: [
        'Your full name, email address, WhatsApp number and university',
        'Academic ID, faculty, semester and session',
        'The ৳100 transaction ID',
      ],
    },
    coordinators: [
      {
        name: 'Sakib Hasan',
        role: 'IT Quiz Coordinator · CSE Club, PSTU',
        phone: '01575660665',
        email: 'ug2102052@cse.pstu.ac.bd',
      },
      {
        name: 'Ariful Islam',
        role: 'IT Quiz Coordinator · CSE Club, PSTU',
        phone: '01823139965',
        email: 'ug2102032@cse.pstu.ac.bd',
      },
      {
        name: 'Abdul Kaiyum',
        role: 'IT Quiz Coordinator · CSE Club, PSTU',
        phone: '01753132369',
        email: 'ug2102059@cse.pstu.ac.bd',
      },
    ],
  },
  {
    slug: 'project-showcase',
    name: 'Project Showcasing',
    fullName: 'Project Showcasing',
    shortName: 'Showcase',
    icon: 'monitor',
    accent: 'aqua',
    cover: '/events/project_showcasing/cover.webp',
    scope: 'South Zone',
    tagline: 'Step into the spotlight and showcase your engineering prowess!',
    blurb:
        'Whether it\'s an intelligent IoT system, an automated microcontroller-based circuit using Arduino or Raspberry Pi, or any innovative hardware prototype, this is your platform to bring your ideas to life.',
    stage: 'open',
    registrationOpen: true,

    tournament: {
      date: '13 August 2026',
      time: '2:00 PM onwards',
      venue: 'PME Lab',
      entryFee: 'Single: ৳100 · Duo: ৳200 · Trio: ৳300',
      entryShort: '৳100–300',
      entryScope: 'per team',
      feePerPlayer: 100,
      format: 'On-site Exhibition & Judging',
      teamSize: '1–3 members',
      teamSizeShort: '1–3 members',
      slots: 'Unlimited',
      platform: 'Hardware-based projects',
      deadline: '12 August 2026',
    },

    prizes: [
      {
        place: 'Champion',
        rank: 1,
        amount: 'Winner trophy',
        perks: ['Certificate of excellence'],
      },
      {
        place: '1st Runner-Up',
        rank: 2,
        amount: 'Certificate of merit',
        perks: [],
      },
      {
        place: '2nd Runner-Up',
        rank: 3,
        amount: 'Certificate of merit',
        perks: [],
      },
    ],

    rules: [
      {
        title: 'Project Eligibility',
        icon: 'shield',
        items: [
          'Only hardware-based projects are permitted, including IoT solutions, microcontroller implementations (Arduino, ESP32, etc.), single-board computers (Raspberry Pi), and custom electronic circuits.',
          'Softwares and 3D models can be built around the project but software-only projects will not be accepted.',
          'Offline presence is mandatory — at least one of the team members must present their project.',
          'AI generated codes are allowed as long as you understand what you are doing.',
        ],
      },
      {
        title: 'Conduct & Presentation',
        icon: 'users',
        items: [
          'Teams must bring their functional hardware project, laptops, required cables, and their own power strips or extension cords.',
          'Basic power supply outlets will be available at the PME Lab.',
          'Teams should be ready to present their logic, hardware connections, and explain the codebase if requested by the judges.',
        ],
      },
    ],

    entry: {
      kind: 'team',
      fee: 100,
      feeLabel: '৳100 (Single) / ৳200 (Duo) / ৳300 (Trio)',
      receiverNumber: '+8801953546089',
      accountType: 'Personal',
      methods: ['bKash'],
    },

    faqs: [
      {
        q: 'Who is eligible to participate in the Project Showcasing event?',
        a: 'The event is open to participants within the South zone. Teams can consist of 1 to 3 members.',
      },
      {
        q: 'What kind of projects are allowed?',
        a: 'We welcome all kinds of hardware-based projects, including IoT systems, microcontroller-based setups (such as Arduino and ESP32), single-board computer projects (such as Raspberry Pi), and custom electronic circuits. Software-only projects are not eligible.',
      },
      {
        q: 'How much is the registration fee?',
        a: 'The entry fee depends on your team size: Single: 100 BDT, Duo: 200 BDT, Trio: 300 BDT.',
      },
      {
        q: 'What is the deadline for registration?',
        a: 'The last date to register for the event is August 12, 2026.',
      },
      {
        q: 'What do we need to bring on the event day?',
        a: 'Teams must bring their functional hardware project, laptops, required cables, and their own power strips or extension cords. Basic power supply outlets will be available at the PME Lab.',
      },
      {
        q: 'When and where is the event taking place?',
        a: 'The event will be held on August 13, 2026, starting from 2:00 PM onwards at the PME Lab. Participants are expected to arrive early to set up their projects.',
      },
      {
        q: 'Is offline presence mandatory?',
        a: 'Yes, at least one of the team members must present their project.',
      },
      {
        q: 'Are AI generated codes allowed?',
        a: 'We are fine with AI as long as you understand what you\'re doing.',
      },
      {
        q: 'Do I have to explain codebase?',
        a: 'Not necessarily, it\'s up to you. But it\'s recommended to understand the logic behind the proposed system.',
      },
    ],

    registration: {
      kind: 'form',
      cta: 'Register for Project Showcasing',
      note: 'Team of 1–3 members · ৳100 / ৳200 / ৳300',
      process: [
        'Send the fee (৳100 for Single, ৳200 for Duo, ৳300 for Trio) to +8801953546089 via bKash Personal.',
        'Fill in your team and member details.',
        'Submit. You get a registration ID immediately, and a confirmation once the payment is checked.',
      ],
      checklist: [
        'Your team name and transaction ID',
        'Full name, email, phone, university, and student ID for each member (up to 3 members)',
      ],
    },

    coordinators: [
      {
        name: 'Maynul',
        role: 'Coordinator · CSE Club, PSTU',
        phone: '+8801853677643',
        email: 'maynul18@cse.pstu.ac.bd',
      },
      {
        name: 'Sharafat Karim',
        role: 'Coordinator · CSE Club, PSTU',
        phone: '+8801953546089',
        email: 'ug2102024@cse.pstu.ac.bd',
      },
      {
        name: 'Mahir',
        role: 'Coordinator · CSE Club, PSTU',
        phone: '+8801768363022',
        email: 'ug2102040@cse.pstu.ac.bd',
      },
    ],
  },
  {
    slug: 'ctf',
    name: 'CTF',
    fullName: 'Capture The Flag',
    shortName: 'CTF',
    icon: 'shield',
    accent: 'aqua',
    scope: 'Inter-University',
    tagline: 'Break it before someone else does.',
    blurb:
        'A jeopardy-style security contest — web, forensics, reverse engineering and cryptography challenges solved against the clock.',
    stage: 'announced',
  },
];

export const getEventDetail = (slug) =>
    EVENT_DETAILS.find((event) => event.slug === slug);

export const EVENT_DETAIL_SLUGS = EVENT_DETAILS.map((event) => event.slug);
