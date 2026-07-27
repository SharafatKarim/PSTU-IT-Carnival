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
       than inferring from registrationOpen, which cannot tell "announced only"
       apart from "published but closed". */
    stage: 'open',
    /* Flip to false to close entries without deleting the form. */
    registrationOpen: true,
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
    /*name: 'Datathon',*/
    /*fullName: 'PSTU Online Datathon 2026',*/
    shortName: 'Datathon',
    /*icon: 'chart',*/
    accent: 'magenta',
    scope: 'National',
    mode: 'Solo or Team of 2',
    tagline:
        'Specially tailored for beginners in Data Science and Machine Learning.',
    blurb:
        'An online datathon featuring a beginner-friendly tabular dataset. Test your skills in Exploratory Data Analysis, feature engineering, and model validation.',
    heroNote: 'Max 2 members per team (solo participation is also allowed).',
    /* No cover art yet. The hero skips both the image and its scrim when this
       is absent — pointing at a missing file only made the page darker. */

    cover: '/events/datathon/datathon3.jpg',
    /* Prizes accounment: */
    prizeNote: 'Prize will be announced very soon',
    prizes: [
      {
        place: '1st Prize',
        rank: 1,
        amount: 'To be announced',
        perks: ['Prize details will be announced soon']
      },
      {
        place: '2nd Prize',
        rank: 2,
        amount: 'To be announced',
        perks: ['Prize details will be announced soon']
      },
      {
        place: '3rd Prize',
        rank: 3,
        amount: 'To be announced',
        perks: ['Prize details will be announced soon']
      },
      {
        place: 'PSTU Best Junior Team Prize',
        rank: 4,
        amount: 'To be announced',
        perks: ['Prize details will be announced soon']
      },
    ],

    tournament: {
      date: '8–12 August 2026',
      time: 'Starts Aug 8 (12:00 AM) — Ends Aug 12 (11:58 PM)',
      venue: 'Online (Code Submission via Google Form)',
      entryFee: '৳300 per team/participant',
      entryShort: '৳300',
      entryScope: 'per team',
      prizePool: 'To be announced',
      format:
          'Private Leaderboard evaluation + Jupyter Notebook Markdown review',
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

    stage: 'published',
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

   These carry only what is actually known — a name, what the event is, and who
   it is open to. No dates, fees, rules, slots or coordinators are invented:
   `stage: 'announced'` tells the UI to render the honest short page instead of
   a detail page full of placeholders.

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
    scope: 'National',
    tagline: '🚀 The Only National-Level Event of PSTU IT Carnival 2026',
    blurb:
        'Challenge yourself by solving real-world industry problems, collaborate with talented innovators, and compete for exciting prizes.',
    stage: 'published',
    registrationOpen: false,
    registration: {
      kind: 'none',
      cta: 'Registration Coming Soon',
      note: 'Registration is FREE for all teams (Phase 1)',
      process: [
        'Registration is completely FREE for all participating teams in Phase 1.',
        'Assemble a team of exactly 2 members.',
        'After registration closes, teams will receive an industry-inspired problem statement (Frontend, Backend, AI/ML, IoT, Cyber Security, Mobile App, or other software engineering domains).',
        'Top 50 teams from the selection round will move to the On-Site Grand Finale (Fee: BDT 2,000 per team).'
      ],
      checklist: [
        'Team Name',
        'Two team members with names, universities, emails, and phone numbers',
        'Domain preference (e.g. AI/ML, IoT, Web, Mobile App)'
      ]
    },
    tournament: {
      date: '15 August 2026',
      time: '8:00 AM — 5:00 PM (Grand Finale)',
      venue: 'Conference Room, TSC Building, Patuakhali Science and Technology University (PSTU)',
      entryFee: 'Phase 1: Free | Phase 3 (Selected Top 50): ৳2,000 per team',
      entryShort: 'Phase 1: Free',
      entryScope: 'per team',
      prizePool: '৳60,000+',
      format: '3 Phases: Open Registration (Free) → Selection Round → On-site Grand Finale (Top 50 teams, BDT 2,000/team fee)',
      teamSize: '2 members',
      teamSizeShort: '2 members',
      slots: 'Top 50 teams for Grand Finale',
      platform: 'On-site Development & Solution Building',
      deadline: 'To be announced',
    },
    rules: [
      {
        title: 'Phase 1: Open Registration',
        icon: 'users',
        items: [
          'Registration is FREE for all teams.',
          'Each team must consist of exactly 2 members.',
          'After registration closes, participating teams will receive an industry-inspired problem statement (covering domains like Frontend, Backend, AI/ML, IoT, Cyber Security, Mobile App, etc.).',
          'Teams must develop and submit their solution within the specified submission period.'
        ]
      },
      {
        title: 'Phase 2: Selection Round & Criteria',
        icon: 'trophy',
        items: [
          'All submitted projects will be evaluated by an expert judging panel.',
          'Evaluation Criteria: Innovation & Creativity, Technical Implementation, Scalability, User Experience, and Problem-Solving Approach.',
          'The Top 50 teams will be selected for the On-Site Grand Finale.'
        ]
      },
      {
        title: 'Phase 3: On-Site Grand Finale Schedule',
        icon: 'clock',
        items: [
          'Grand Finale Date: 15 August 2026. Venue: Conference Room, TSC Building, PSTU.',
          'Registration Fee: BDT 2,000 per Team (applicable only to the selected Top 50 teams).',
          '8:00 AM - Industry-level Final Problem Statement Released in the Participant Group.',
          '8:45 AM - All Selected Teams Must Be Present at the Conference Room.',
          '9:00 AM – 3:00 PM - Hackathon Development & Solution Building.',
          '11:00 AM - Mid Evaluation Round (Judges will visit each team\'s booth for progress evaluation).',
          '3:00 PM – 5:00 PM - Final Project Demonstration & Evaluation by the Jury.'
        ]
      },
      {
        title: 'Prizes & Rewards',
        icon: 'gift',
        items: [
          'Grand Prize Pool of BDT 60,000+.',
          'Cash Prizes for the winners.',
          'Exclusive Gifts and Certificates for participants.',
          'Recognition & Networking Opportunities with developers and industry leaders.'
        ]
      }
    ],
    faqs: [
      {
        q: 'Is physical presence required for Phase 1?',
        a: 'No. Phase 1 (Registration and initial solution submission) is fully online. Physical presence at PSTU is only required for the selected Top 50 teams that qualify for the On-site Grand Finale on August 15, 2026.'
      },
      {
        q: 'What is the team size requirement?',
        a: 'Each team must consist of exactly 2 members. Solo participation or teams of other sizes are not allowed.'
      },
      {
        q: 'What fields/domains will the problem statements cover?',
        a: 'Problem statements will cover real-world software engineering domains, including but not limited to: Frontend, Backend, AI/ML, IoT, Cyber Security, and Mobile App Development.'
      }
    ],
    coordinators: []
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
    registrationOpen: false,

    /* Still 'announced', and registrationOpen is false, because the date, the
       rules and — the blocker — the number the ৳50 is sent to have not been
       given to us. The form and its whole backend are built; set
       registrationOpen: true, fill in entry.receiverNumber and move `stage` to
       'open', and it is live in one edit.

       Nothing here is invented. Every value is either the fee the owner stated
       or the shape of the form they specified. */
    entry: {
      /* One entrant, not a team — the owner's field list has no team fields. */
      kind: 'solo',
      fee: 50,
      feeLabel: '৳50 per participant',
      /* PLACEHOLDER. The payment panel refuses to render while this is empty,
         rather than showing a number nobody should send money to. */
      receiverNumber: '',
      methods: ['bKash', 'Nagad'],
    },

    registration: {
      kind: 'form',
      cta: 'Register for IT Quiz',
      note: 'Individual entry · ৳50',
      process: [
        'Send ৳50 to the number published on this page and keep the confirmation.',
        'Fill in your details, then either type the transaction ID or attach a screenshot of the payment.',
        'Submit. You get a registration ID immediately, and a confirmation once the payment is checked.',
      ],
      checklist: [
        'Your full name, WhatsApp number and university',
        'Academic ID, faculty, semester and session',
        'The ৳50 transaction ID, or a screenshot of the payment',
      ],
    },
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
