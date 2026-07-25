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

    tournament: {
      date: '13 August 2026',
      time: '9:00 AM — 3:00 PM',
      venue: 'CSE–FBA Building, PSTU',
      entryFee: 'Free',
      prizePool: '৳120,000',
      format: 'ICPC-style · 4–5 hours · one workstation',
      teamSize: '3 members (+1 coach)',
      slots: '60 teams',
      platform: 'Onsite — workstations provided',
      deadline: '31 July 2026',
    },

    prizes: [
      {
        place: 'Champion',
        rank: 1,
        amount: '৳60,000',
        perks: ['Certificate of excellence', 'Winner trophy'],
      },
      {
        place: '1st Runner-Up',
        rank: 2,
        amount: '৳35,000',
        perks: ['Certificate of merit'],
      },
      {
        place: '2nd Runner-Up',
        rank: 3,
        amount: '৳25,000',
        perks: ['Certificate of merit'],
      },
    ],

    rules: [
      {
        title: 'Team Composition',
        icon: 'users',
        items: [
          'Each team must have exactly 3 members — no more, no fewer.',
          'Every team competes with one registered coach.',
          'Team names must be unique across all registrations.',
          'Each member needs a distinct email address and Codeforces handle.',
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

    /* Flip to false to close entries without deleting the form. */
    registrationOpen: true,
    registration: {
      /* 'form' means this event owns /events/<slug>/register. */
      kind: 'form',
      cta: 'Start Pre-Registration',
      note: 'No payment required · Instant registration ID',
      checklist: [
        'Your team name — it must be unique, so pick a backup too',
        'Your varsity name',
        'Coach name, email and phone number',
        'For each of the three members: name, email, phone, Codeforces handle and t-shirt size',
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
        a: 'No. IUPC pre-registration is free and no payment is taken through this website.',
      },
      {
        q: 'What happens after I submit the form?',
        a: 'You get a registration ID on screen straight away. Save it — it is how the committee identifies your team.',
      },
      {
        q: 'Can we change our team members later?',
        a: 'Contact the coordinators below before the registration deadline. Changes after the deadline cannot be accepted.',
      },
    ],

    coordinators: [
      {
        name: 'IUPC Coordinator',
        role: 'Contest operations · CSE Club, PSTU',
        phone: '+8801700000010',
        email: 'iupc@pstuitcarnival2026.com',
      },
      {
        name: 'Deputy Coordinator',
        role: 'Team registration & verification',
        phone: '+8801700000011',
        email: 'contest@pstuitcarnival2026.com',
      },
    ],
  },
];

export const getEventDetail = (slug) =>
  EVENT_DETAILS.find((event) => event.slug === slug);

export const EVENT_DETAIL_SLUGS = EVENT_DETAILS.map((event) => event.slug);
