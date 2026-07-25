// ---------------------------------------------------------------------------
// Gaming Fest content — eFootball, PUBG Mobile, Free Fire.
//
// Everything a coordinator needs to change lives in this file: dates, times,
// venue, entry fees, prize money, slot counts, rules, FAQs and contacts.
// The UI reads it all from here, so no component needs to be touched.
//
// >>> PLACEHOLDER VALUES <<<
// Dates, times, fees, prize amounts, slot counts and coordinator contacts are
// stand-ins. Replace them with the confirmed figures before going live.
// ---------------------------------------------------------------------------

// Accepts the three ways people actually write a BD mobile number:
// 01712345678, 1712345678 and +8801712345678.
const BD_PHONE_RE = /^(?:\+?880|0)?1[3-9]\d{8}$/;
const EMAIL_RE = /^\S+@\S+\.\S+$/;

const PHONE_RULES = {
  pattern: { value: BD_PHONE_RE, message: 'Use 017XXXXXXXX or +88017XXXXXXXX' },
};

const EMAIL_RULES = {
  pattern: { value: EMAIL_RE, message: 'Please enter a valid email address' },
};

const INSTITUTIONS_HINT = 'University, college or school you are representing';

/* Shared "player row" fields used by the two squad games. `i` is the index in
   the players array; the 5th row (index 4) is the optional substitute. */
const squadPlayerSection = (i, { idLabel, idPlaceholder, substitute = false }) => ({
  key: substitute ? 'substitute' : `player-${i}`,
  title: substitute
    ? 'Substitute (Optional)'
    : i === 0
      ? 'Player 1 — In-Game Leader'
      : `Player ${i + 1}`,
  subtitle: substitute
    ? 'Register a reserve player now if you have one — they cannot be added on match day.'
    : i === 0
      ? 'The player who creates the lobby and speaks to the referee during matches.'
      : undefined,
  fields: [
    {
      name: `players.${i}.name`,
      label: 'Full Name',
      placeholder: 'e.g. Rahim Uddin',
      required: !substitute,
      autoComplete: 'off',
      rules: { maxLength: { value: 100, message: 'Name cannot exceed 100 characters' } },
    },
    {
      name: `players.${i}.ign`,
      label: 'In-Game Name (IGN)',
      placeholder: 'Exactly as it appears in game',
      required: !substitute,
      unique: true,
      rules: { maxLength: { value: 50, message: 'IGN cannot exceed 50 characters' } },
    },
    {
      name: `players.${i}.uid`,
      label: idLabel,
      placeholder: idPlaceholder,
      required: !substitute,
      unique: true,
      rules: {
        pattern: { value: /^\d{6,15}$/, message: 'UID must be 6–15 digits' },
      },
    },
  ],
});

const squadRegistrationSections = ({ idLabel, idPlaceholder, gameLabel }) => [
  {
    key: 'team',
    title: 'Team Information',
    subtitle: 'Your squad name is what appears on the bracket and the scoreboard.',
    fields: [
      {
        name: 'teamName',
        label: 'Team Name',
        placeholder: 'e.g. Coastal Raiders',
        required: true,
        autoComplete: 'off',
        rules: {
          minLength: { value: 3, message: 'Team name must be at least 3 characters' },
          maxLength: { value: 50, message: 'Team name cannot exceed 50 characters' },
        },
      },
      {
        name: 'institution',
        label: 'Institution',
        placeholder: 'e.g. Patuakhali Science and Technology University',
        hint: INSTITUTIONS_HINT,
        required: true,
        autoComplete: 'organization',
        rules: { maxLength: { value: 150, message: 'Cannot exceed 150 characters' } },
      },
    ],
  },
  {
    key: 'captain',
    title: 'Team Captain (Contact Person)',
    subtitle: `All ${gameLabel} announcements, room IDs and passwords go to this contact.`,
    fields: [
      {
        name: 'captain.name',
        label: 'Captain Name',
        placeholder: 'e.g. Rahim Uddin',
        required: true,
        autoComplete: 'name',
        rules: { maxLength: { value: 100, message: 'Name cannot exceed 100 characters' } },
      },
      {
        name: 'captain.email',
        label: 'Captain Email',
        type: 'email',
        placeholder: 'captain@example.com',
        required: true,
        autoComplete: 'email',
        rules: EMAIL_RULES,
      },
      {
        name: 'captain.phone',
        label: 'Captain Phone (WhatsApp preferred)',
        placeholder: '017XXXXXXXX or +88017XXXXXXXX',
        required: true,
        autoComplete: 'tel',
        rules: PHONE_RULES,
      },
    ],
  },
  ...[0, 1, 2, 3].map((i) => squadPlayerSection(i, { idLabel, idPlaceholder })),
  squadPlayerSection(4, { idLabel, idPlaceholder, substitute: true }),
];

const agreementSection = {
  key: 'confirm',
  title: 'Confirmation',
  fields: [
    {
      name: 'agreeRules',
      label: 'I have read the Rules & Regulations above and accept them on behalf of everyone registered here.',
      type: 'checkbox',
      required: true,
      full: true,
    },
    {
      name: 'agreeContact',
      label: 'I agree to be contacted by the organizing committee about this tournament.',
      type: 'checkbox',
      required: true,
      full: true,
    },
  ],
};

export const GAMES = [
  // -------------------------------------------------------------------------
  // eFootball — solo 1v1
  // -------------------------------------------------------------------------
  {
    slug: 'efootball',
    name: 'eFootball',
    shortName: 'eFootball',
    icon: 'ball',
    accent: 'aqua',
    scope: 'Esports · 1v1',
    mode: 'Solo',
    tagline: 'Virtual football glory — skill, tactics and last-minute winners.',
    blurb:
      'A one-on-one knockout on the pitch. Read the game, time your through-balls, and outplay the player across the table.',
    heroNote: 'Individual entry — no team required.',

    tournament: {
      date: '14 August 2026',
      time: '10:00 AM — 6:00 PM',
      venue: 'Gaming Arena, CSE–FBA Building, PSTU',
      entryFee: '৳150 per player',
      entryShort: '৳150',
      entryScope: 'per player',
      prizePool: '৳15,000',
      format: 'Single-elimination knockout, 1v1',
      teamSize: 'Solo (1 player)',
      teamSizeShort: 'Solo',
      slots: '64 players',
      platform: 'Mobile & PC stations provided',
      deadline: '5 August 2026',
    },

    prizes: [
      { place: 'Champion', rank: 1, amount: '৳8,000', perks: ['Certificate of excellence', 'Winner trophy'] },
      { place: '1st Runner-Up', rank: 2, amount: '৳4,500', perks: ['Certificate of merit'] },
      { place: '2nd Runner-Up', rank: 3, amount: '৳2,500', perks: ['Certificate of merit'] },
    ],

    rules: [
      {
        title: 'Eligibility & Registration',
        icon: 'user',
        items: [
          'Open to all students with a valid, current student ID card.',
          'One entry per player — duplicate Konami/eFootball IDs will be removed.',
          'The entry fee is collected on-site and must be paid before your first match.',
          'Registration closes on the deadline or when all slots are filled, whichever comes first.',
        ],
      },
      {
        title: 'Match Format',
        icon: 'flag',
        items: [
          'Single-elimination bracket — one loss and you are out.',
          'Group matches: 6 minutes per half. Quarter-finals onward: 8 minutes per half.',
          'A draw in the knockout stage goes to extra time, then a penalty shootout.',
          'Only standard in-game squads are allowed — boosted or purchased squads are not permitted.',
        ],
      },
      {
        title: 'Fair Play',
        icon: 'shield',
        items: [
          'Report 15 minutes before your scheduled slot; 10 minutes late is a walkover.',
          'Emulators, account sharing and any third-party tool mean instant disqualification.',
          'Deliberately disconnecting counts as a loss unless the referee rules otherwise.',
          'The referee decides all in-match disputes, and that decision is final.',
        ],
      },
      {
        title: 'Equipment',
        icon: 'monitor',
        items: [
          'Match stations and controllers are provided by the organizers.',
          'You may use your own controller if a referee approves it before the match.',
          'Bring your own account credentials — the committee will not recover logins on match day.',
        ],
      },
    ],

    // Flip to true to put this tournament's form live.
    registrationOpen: false,
    registration: {
      kind: 'solo',
      idPrefix: 'PSTU-EFB-2026',
      sections: [
        {
          key: 'player',
          title: 'Player Information',
          subtitle: 'This is how your name appears on the bracket and the certificate.',
          fields: [
            {
              name: 'player.name',
              label: 'Full Name',
              placeholder: 'e.g. Rahim Uddin',
              required: true,
              autoComplete: 'name',
              rules: { maxLength: { value: 100, message: 'Name cannot exceed 100 characters' } },
            },
            {
              name: 'player.email',
              label: 'Email',
              type: 'email',
              placeholder: 'player@example.com',
              required: true,
              autoComplete: 'email',
              rules: EMAIL_RULES,
            },
            {
              name: 'player.phone',
              label: 'Phone (WhatsApp preferred)',
              placeholder: '017XXXXXXXX or +88017XXXXXXXX',
              required: true,
              autoComplete: 'tel',
              rules: PHONE_RULES,
            },
            {
              name: 'player.institution',
              label: 'Institution',
              placeholder: 'e.g. Patuakhali Science and Technology University',
              hint: INSTITUTIONS_HINT,
              required: true,
              autoComplete: 'organization',
              rules: { maxLength: { value: 150, message: 'Cannot exceed 150 characters' } },
            },
            {
              name: 'player.studentId',
              label: 'Student ID',
              placeholder: 'e.g. 1902020',
              required: false,
              hint: 'Optional — helps us verify eligibility faster on match day.',
            },
          ],
        },
        {
          key: 'profile',
          title: 'Game Profile',
          subtitle: 'Make sure these match your account exactly — we use them to seed the bracket.',
          fields: [
            {
              name: 'profile.ign',
              label: 'In-Game Name (IGN)',
              placeholder: 'Exactly as it appears in eFootball',
              required: true,
              rules: { maxLength: { value: 50, message: 'IGN cannot exceed 50 characters' } },
            },
            {
              name: 'profile.konamiId',
              label: 'Konami / eFootball ID',
              placeholder: 'e.g. 1234-5678-9012',
              required: true,
              rules: { maxLength: { value: 40, message: 'ID cannot exceed 40 characters' } },
            },
            {
              name: 'profile.platform',
              label: 'Preferred Platform',
              type: 'select',
              options: ['Mobile', 'PC (Steam)', 'PlayStation', 'Xbox'],
              placeholder: 'Select your platform',
              required: true,
            },
            {
              name: 'profile.experience',
              label: 'Experience Level',
              type: 'select',
              options: ['Casual', 'Intermediate', 'Competitive'],
              placeholder: 'Select your level',
              required: false,
              hint: 'Optional — used only for seeding, never for exclusion.',
            },
          ],
        },
        agreementSection,
      ],
    },

    faqs: [
      {
        q: 'Do I need a team for eFootball?',
        a: 'No. eFootball is a solo 1v1 tournament — you register as an individual player and play your own bracket.',
      },
      {
        q: 'Which platform will the matches be played on?',
        a: 'Match stations (mobile and PC) are set up at the venue. Pick your preferred platform during registration and we will seed you accordingly.',
      },
      {
        q: 'Can I use my own squad or purchased players?',
        a: 'No. Only standard in-game squads are allowed so that every match starts on equal footing.',
      },
      {
        q: 'How and when do I pay the entry fee?',
        a: 'On-site, at the registration desk, before your first match. Slots with unpaid fees are released to the waiting list.',
      },
      {
        q: 'What happens if I arrive late for a match?',
        a: 'You get a 10-minute grace period from your scheduled slot. After that the match is awarded to your opponent as a walkover.',
      },
    ],

    coordinators: [
      {
        name: 'eFootball Coordinator',
        role: 'Gaming Fest · CSE Club, PSTU',
        phone: '+8801700000001',
        email: 'efootball@pstuitcarnival2026.com',
      },
      {
        name: 'Deputy Coordinator',
        role: 'Match scheduling & brackets',
        phone: '+8801700000002',
        email: 'gaming@pstuitcarnival2026.com',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // PUBG Mobile — squad of 4 (+1 substitute)
  // -------------------------------------------------------------------------
  {
    slug: 'pubg-mobile',
    name: 'PUBG Mobile',
    shortName: 'PUBG',
    icon: 'gamepad',
    accent: 'gold',
    scope: 'Esports · Squad',
    mode: 'Squad of 4',
    tagline: 'Squad up for the battle royale. Last team standing takes the crown.',
    blurb:
      'Four players, one drop zone, and a shrinking circle. Rotate smart, hold your compound, and survive to the final blue.',
    heroNote: 'Team entry — 4 players, plus an optional substitute.',

    tournament: {
      date: '15 August 2026',
      time: '11:00 AM — 7:00 PM',
      venue: 'Gaming Arena, CSE–FBA Building, PSTU',
      entryFee: '৳500 per team',
      entryShort: '৳500',
      entryScope: 'per team',
      prizePool: '৳40,000',
      format: 'Battle Royale — 4 rounds, points aggregated',
      teamSize: '4 players (+1 substitute)',
      teamSizeShort: '4 + 1 sub',
      slots: '25 squads',
      platform: 'Mobile & tablet only',
      deadline: '5 August 2026',
    },

    prizes: [
      { place: 'Champion', rank: 1, amount: '৳20,000', perks: ['Certificate of excellence', 'Winner trophy'] },
      { place: '1st Runner-Up', rank: 2, amount: '৳12,000', perks: ['Certificate of merit'] },
      { place: '2nd Runner-Up', rank: 3, amount: '৳6,000', perks: ['Certificate of merit'] },
      { place: 'MVP', rank: 4, amount: '৳2,000', perks: ['Most kills across all rounds'] },
    ],

    rules: [
      {
        title: 'Team & Eligibility',
        icon: 'users',
        items: [
          'A squad is exactly 4 players. One substitute may be registered, but not added later.',
          'Every player must be a currently enrolled student with a valid ID card.',
          'A player may represent only one squad for the whole tournament.',
          'Team name and player UIDs are locked once registration closes — check them carefully.',
        ],
      },
      {
        title: 'Match Format',
        icon: 'flag',
        items: [
          'Four Battle Royale rounds across a map rotation (Erangel, Miramar, Sanhok).',
          'Final standing = placement points + kill points, summed across all four rounds.',
          'Room ID and password are posted to the official group 10 minutes before each round.',
          'Squads must be in the lobby 5 minutes before start time; late squads forfeit that round.',
        ],
      },
      {
        title: 'Device & Fair Play',
        icon: 'shield',
        items: [
          'Mobile phones and tablets only — emulators, triggers and gamepads are banned.',
          'Any hack, mod APK, or third-party tool means permanent disqualification of the whole squad.',
          'Teaming with other squads or intentionally throwing a round is prohibited.',
          'Officials may ask for a screen recording of any round at any time.',
        ],
      },
      {
        title: 'Conduct',
        icon: 'alert',
        items: [
          'Abusive language or harassment in voice or text chat leads to point deduction or removal.',
          'Personal network or device failure is not grounds for a rematch — come prepared.',
          'Bring your own charged devices, headsets and a power bank.',
          'The organizing committee has the final word on every dispute.',
        ],
      },
    ],

    // Flip to true to put this tournament's form live.
    registrationOpen: false,
    registration: {
      kind: 'squad',
      idPrefix: 'PSTU-PUBG-2026',
      sections: [
        ...squadRegistrationSections({
          idLabel: 'PUBG Mobile UID',
          idPlaceholder: 'e.g. 5123456789',
          gameLabel: 'PUBG Mobile',
        }),
        agreementSection,
      ],
    },

    faqs: [
      {
        q: 'How many players can I register?',
        a: 'Four main players plus one optional substitute. The substitute must be registered now — players cannot be swapped in on match day.',
      },
      {
        q: 'Are emulators or triggers allowed?',
        a: 'No. Mobile phones and tablets only. Emulators, physical triggers and gamepads are all banned, and using one disqualifies the entire squad.',
      },
      {
        q: 'Where do we get the room ID and password?',
        a: 'They are posted in the official tournament group 10 minutes before each round. The captain’s phone number from this form is how we add you to that group.',
      },
      {
        q: 'How is the winner decided?',
        a: 'Placement points and kill points are added up across all four rounds. The squad with the highest total wins — there is no single elimination final.',
      },
      {
        q: 'What if a player disconnects mid-match?',
        a: 'The round continues. Personal network or device problems are not grounds for a rematch, so bring charged devices and a stable connection.',
      },
    ],

    coordinators: [
      {
        name: 'PUBG Mobile Coordinator',
        role: 'Gaming Fest · CSE Club, PSTU',
        phone: '+8801700000003',
        email: 'pubg@pstuitcarnival2026.com',
      },
      {
        name: 'Deputy Coordinator',
        role: 'Lobby & room management',
        phone: '+8801700000004',
        email: 'gaming@pstuitcarnival2026.com',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Free Fire — squad of 4 (+1 substitute)
  // -------------------------------------------------------------------------
  {
    slug: 'free-fire',
    name: 'Free Fire',
    shortName: 'Free Fire',
    icon: 'flame',
    accent: 'magenta',
    scope: 'Esports · Squad',
    mode: 'Squad of 4',
    tagline: 'Fast, furious mobile battle royale. Drop in, gear up, survive.',
    blurb:
      'Ten-minute matches with no room to breathe. Pick your character, land first, and fight your way to Booyah.',
    heroNote: 'Team entry — 4 players, plus an optional substitute.',

    tournament: {
      date: '15 August 2026',
      time: '10:00 AM — 5:00 PM',
      venue: 'Gaming Arena, CSE–FBA Building, PSTU',
      entryFee: '৳400 per team',
      entryShort: '৳400',
      entryScope: 'per team',
      prizePool: '৳30,000',
      format: 'Battle Royale — 4 rounds, points aggregated',
      teamSize: '4 players (+1 substitute)',
      teamSizeShort: '4 + 1 sub',
      slots: '24 squads',
      platform: 'Mobile & tablet only',
      deadline: '5 August 2026',
    },

    prizes: [
      { place: 'Champion', rank: 1, amount: '৳15,000', perks: ['Certificate of excellence', 'Winner trophy'] },
      { place: '1st Runner-Up', rank: 2, amount: '৳9,000', perks: ['Certificate of merit'] },
      { place: '2nd Runner-Up', rank: 3, amount: '৳4,500', perks: ['Certificate of merit'] },
      { place: 'MVP', rank: 4, amount: '৳1,500', perks: ['Most kills across all rounds'] },
    ],

    rules: [
      {
        title: 'Team & Eligibility',
        icon: 'users',
        items: [
          'A squad is exactly 4 players. One substitute may be registered, but not added later.',
          'Every player must be a currently enrolled student with a valid ID card.',
          'A player may represent only one squad for the whole tournament.',
          'Team name and player UIDs are locked once registration closes — check them carefully.',
        ],
      },
      {
        title: 'Match Format',
        icon: 'flag',
        items: [
          'Four Battle Royale rounds across a map rotation (Bermuda, Purgatory, Kalahari).',
          'Final standing = placement points + kill points, summed across all four rounds.',
          'Custom room ID and password are shared in the official group before each round.',
          'Squads must join the lobby 5 minutes before start time; late squads forfeit that round.',
        ],
      },
      {
        title: 'Device & Fair Play',
        icon: 'shield',
        items: [
          'Mobile phones and tablets only — emulators and external controllers are banned.',
          'Hacks, mod APKs, or any third-party tool disqualify the entire squad permanently.',
          'Teaming with other squads or intentionally throwing a round is prohibited.',
          'Officials may ask for a screen recording of any round at any time.',
        ],
      },
      {
        title: 'Conduct',
        icon: 'alert',
        items: [
          'Abusive language or harassment in voice or text chat leads to point deduction or removal.',
          'Personal network or device failure is not grounds for a rematch — come prepared.',
          'Bring your own charged devices, headsets and a power bank.',
          'The organizing committee has the final word on every dispute.',
        ],
      },
    ],

    // Flip to true to put this tournament's form live.
    registrationOpen: false,
    registration: {
      kind: 'squad',
      idPrefix: 'PSTU-FF-2026',
      sections: [
        ...squadRegistrationSections({
          idLabel: 'Free Fire UID',
          idPlaceholder: 'e.g. 123456789',
          gameLabel: 'Free Fire',
        }),
        agreementSection,
      ],
    },

    faqs: [
      {
        q: 'How many players can I register?',
        a: 'Four main players plus one optional substitute. The substitute must be registered now — players cannot be swapped in on match day.',
      },
      {
        q: 'Are emulators allowed?',
        a: 'No. Mobile phones and tablets only. Emulators and external controllers are banned, and using one disqualifies the entire squad.',
      },
      {
        q: 'Where do we get the custom room details?',
        a: 'They are shared in the official tournament group before each round. The captain’s phone number from this form is how we add you to that group.',
      },
      {
        q: 'How is the winner decided?',
        a: 'Placement points and kill points are added up across all four rounds. The squad with the highest total wins.',
      },
      {
        q: 'Can a player be in two squads?',
        a: 'No. Each player may represent only one squad for the whole tournament, and UIDs are checked against every other registration.',
      },
    ],

    coordinators: [
      {
        name: 'Free Fire Coordinator',
        role: 'Gaming Fest · CSE Club, PSTU',
        phone: '+8801700000005',
        email: 'freefire@pstuitcarnival2026.com',
      },
      {
        name: 'Deputy Coordinator',
        role: 'Lobby & room management',
        phone: '+8801700000006',
        email: 'gaming@pstuitcarnival2026.com',
      },
    ],
  },
];

export const GAMING = {
  eyebrow: 'Gaming Fest',
  title: 'Three arenas. One Booyah.',
  intro:
    'The gaming wing of PSTU IT Carnival 2026 runs three competitive tournaments — one solo, two squad-based. Formats, rules and prizes are below; registration opens soon.',
  note: 'Entry fees are collected on-site at the registration desk. No payment is taken through this website.',
  /* Shown wherever a closed tournament would otherwise offer a form. */
  closedHeading: 'Registration opens soon',
  closedNote:
    'Gaming registration is not open yet. The format, rules and prize breakdown on this page are final, so you can get your squad ready now — the form goes live here once entries open.',
};

/* Registration is per-tournament, so one game can open before the others. */
export const isGameRegistrationOpen = (game) => Boolean(game?.registrationOpen);

export const OPEN_GAMES = () => GAMES.filter(isGameRegistrationOpen);

export const getGame = (slug) => GAMES.find((g) => g.slug === slug);

export const GAME_SLUGS = GAMES.map((g) => g.slug);
