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
      deadline: '31 July 2026',
    },

    /* Non-monetary only. Prize money has not been announced; add an `amount`
       to an entry when a figure is confirmed and TournamentInfo prints it.
       The landing page reads this same array, so the two cannot disagree. */
    prizes: [
      {
        place: 'Champion',
        rank: 1,
        perks: ['Winner trophy', 'Certificate of excellence'],
      },
      { place: '1st Runner-Up', rank: 2, perks: ['Certificate of merit'] },
      { place: '2nd Runner-Up', rank: 3, perks: ['Certificate of merit'] },
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
       than inferring from registrationOpen, which cannot tell "announced only"
       apart from "published but closed". */
    stage: 'open',
    /* Flip to false to close entries without deleting the form. */
    registrationOpen: true,
    registration: {
      /* 'form' means this event owns /events/<slug>/register. */
      kind: 'form',
      cta: 'Start Pre-Registration',
      note: 'Pre-registration is free · Instant registration ID · Event t-shirt for every participant',
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
        a: 'Yes — ৳3,000 per team. It is paid at final registration, not now: pre-registering on this page costs nothing, and no payment is taken through this website.',
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
    tagline: 'Specially tailored for beginners in Data Science and Machine Learning.',
    blurb: 'An online datathon featuring a beginner-friendly tabular dataset. Test your skills in Exploratory Data Analysis, feature engineering, and model validation.',
    heroNote: 'Max 2 members per team (solo participation is also allowed).',
    /* No cover art yet. The hero skips both the image and its scrim when this
       is absent — pointing at a missing file only made the page darker. */

    tournament: {
      date: '8–12 August 2026',
      time: 'Starts Aug 8 (12:00 AM) — Ends Aug 12 (11:58 PM)',
      venue: 'Online (Code Submission via Google Form)',
      entryFee: '৳300 per team/participant',
      entryShort: '৳300',
      entryScope: 'per team',
      format: 'Private Leaderboard evaluation + Jupyter Notebook Markdown review',
      teamSize: 'Max 2 members',
      teamSizeShort: 'Max 2',
      slots: 'Open to all university students',
      platform: 'Online',
      deadline: '12 August 2026, 11:58 PM',
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
          'Code Quality & Markdown Documentation (10%): Evaluated based on code cleanliness, reproducibility, and clear explanations in Markdown cells.'
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

    stage: 'published',
    registrationOpen: false,
    registration: {
      kind: 'none',
      cta: 'Registration Closed',
      note: 'Online registration opens soon',
      process: [
        'Registration remains open until 1 minute before the contest ends.',
        'Ensure all team members are declared during registration to avoid disqualification.',
        'Submit BDT 300 entry fee online.'
      ],
      checklist: [
        'Team Name',
        'Varsity name for all members',
        'Verification document (e.g., student ID card)',
        'For each member: name, email, phone, and t-shirt size'
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

   These carry only what is actually known — a name, what the event is, and who
   it is open to. No dates, fees, rules, slots or coordinators are invented:
   `stage: 'announced'` tells the UI to render the honest short page instead of
   a detail page full of placeholders.

   To promote one: add a `tournament` block, `rules`, `registration`, `faqs`
   and `coordinators` in the shape IUPC uses above, then change stage to
   'published'. The page fills itself in — no component changes.
   --------------------------------------------------------------------------- */
  {
    slug: 'hackathon',
    name: 'Hackathon',
    fullName: 'National Hackathon',
    shortName: 'Hackathon',
    icon: 'rocket',
    accent: 'magenta',
    scope: 'National',
    tagline: 'Build a working product against the clock.',
    blurb:
      'A national-level innovation sprint for student teams — ship something that runs, not a slide deck.',
    stage: 'announced',
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
    stage: 'announced',
  },
  {
    slug: 'project-showcase',
    name: 'Project Showcasing',
    fullName: 'Project Showcasing',
    shortName: 'Showcase',
    icon: 'monitor',
    accent: 'aqua',
    scope: 'All Students',
    tagline: 'Put your best build in front of judges.',
    blurb:
      'Present your best software or hardware project to judges and the wider community.',
    stage: 'announced',
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
