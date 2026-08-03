// ---------------------------------------------------------------------------
// Gaming Fest content — eFootball, PUBG Mobile, Free Fire.
//
// Everything a coordinator needs to change lives in this file: dates, times,
// venue, entry fees, prize money, slot counts, rules, FAQs and the registration
// form itself. The UI reads it all from here, so no component needs touching.
//
// Coordinator contacts are the one exception — they live in the database, not
// here, so a phone number can be corrected without a redeploy. See
// src/server/coordinators/ and scripts/seed-db.sh. GAMING_DESK below is only
// the fallback for when that lookup returns nothing.
//
// The payment number is NOT one of those: it is the constant GAMING_PAYMENT
// below, so the registration pages need no database at all.
//
// >>> STILL UNCONFIRMED <<<
//   · Free Fire and eFootball start times (date and venue are set)
//   · The PUBG Mobile prize split — only the pool figure is announced
//   · The PUBG Mobile squad count (25 is a full custom lobby)
// Everything else on this page is confirmed.
// ---------------------------------------------------------------------------

// patterns.js imports nothing, so this stays clear of the routes.js cycle.
import { BD_PHONE_RE, EMAIL_RE, PHONE_HINT } from "@/lib/patterns";

const PHONE_RULES = {
  pattern: { value: BD_PHONE_RE, message: PHONE_HINT },
};

const EMAIL_RULES = {
  pattern: { value: EMAIL_RE, message: "Please enter a valid email address" },
};

/* eFootball and Free Fire share a day and a room. PUBG Mobile moved to the 14th
   on 30 July 2026 and so carries its own date — GAMING_DAY is no longer "the
   gaming day", it is the day the other two run. */
const GAMING_DAY = "13 August 2026";
const PUBG_DAY = "14 August 2026";
const GAMING_VENUE = "Seminar Room, TSC (3rd Floor), PSTU";
const GAMING_DEADLINE = "5 August 2026";
const TIME_TBA = "To be announced";

/* Used only when the coordinator lookup in src/server/coordinators/ comes back
   empty — a database hiccup must not leave a live registration page with no
   way to reach anybody. The stored rows are authoritative; edit those. */
export const GAMING_DESK = [
  {
    name: "Gaming Fest Coordinator",
    role: "Gaming Fest · CSE Club, PSTU",
    phone: "01670244069",
    email: "ug2102067@cse.pstu.ac.bd",
  },
];

/* ---------------------------------------------------------------------------
   Payment.

   Both of these are constants, deliberately. The registration pages are
   server-rendered from this file alone, so there is no database round trip
   anywhere in the payment step — the number is baked into the build.

   Changing the number therefore means editing the line below and redeploying.
   That is the trade: no query per render, no admin panel.

   The METHOD LIST is what the select offers AND what the server validates
   against, so the two can never disagree.
   --------------------------------------------------------------------------- */

export const PAYMENT_METHODS = ["bKash", "Nagad"];

export const GAMING_PAYMENT = {
  number: "+8801670244069",
  accountType: "Personal",
  instructions:
    "Use “Send Money” (not Payment) from either wallet above, then enter the transaction ID it gives you.",
};

/* A squad pays for four; anyone else pays for one. Shared by the form (to show
   the amount due) and the server (to record what was owed) so the two figures
   are always the same number. */
export const playersRequired = (game, entryType) =>
  game?.registration?.kind === "squad" && entryType === "team" ? 4 : 1;

/* The tournament block is the normal home for the fee, but a game can have a
   published fee before it has a published date — Ludo does. Falling back to
   the top-level value means the form and the stored `payment.amount` are right
   in both cases, rather than silently recording ৳0. */
export const feeFor = (game, entryType) =>
  (game?.tournament?.feePerPlayer ?? game?.feePerPlayer ?? 0) *
  playersRequired(game, entryType);

/* A tournament with no per-player fee takes no payment at all: its form drops
   the Payment section, the pages stop promising a bKash transfer, and the
   server stops demanding a method. Derived from the fee rather than carried as
   a separate flag, so a fee of 0 and "free" can never disagree. */
export const isFreeEntry = (game) =>
  (game?.tournament?.feePerPlayer ?? game?.feePerPlayer ?? 0) <= 0;

/* ---------------------------------------------------------------------------
   Match format blocks.

   Rendered by src/components/gaming/FormatBoard.jsx above the rule cards. A
   game without one simply does not get the board.
   --------------------------------------------------------------------------- */

/* Both battle royales score identically. `firstLabel` is the only difference —
   PUBG calls it a chicken dinner, Free Fire calls it a Booyah. */
const brPoints = (firstLabel) => ({
  note: "Placement points and kill points are added together, then summed across every match played.",
  perKill: 1,
  rows: [
    { place: `${firstLabel} · 1st`, points: 10 },
    { place: "2nd", points: 6 },
    { place: "3rd", points: 5 },
    { place: "4th", points: 4 },
    { place: "5th", points: 3 },
    { place: "6th", points: 2 },
    { place: "7th and below", points: 1 },
  ],
});

/* ---------------------------------------------------------------------------
   Registration form config.

   The browser form and the server validator are both generated from these
   sections (see src/components/gaming/GameRegistrationForm.jsx and
   src/server/events/gaming/validation.js), so the two cannot drift.

   `when(values)` makes a section conditional. It runs on both sides — the form
   hides the section, and the validator skips it — so an individual entrant is
   never asked for a squad roster and never fails validation for not having one.

   Every game stores its people at `players.<n>.*`, whatever the entry type:
   players[0] is always the person we contact. That keeps one document shape in
   the database for solo entries, full squads and randomly-formed squads alike.
   --------------------------------------------------------------------------- */

const isTeamEntry = (values) => values?.entryType === "team";
const isIndividualEntry = (values) => values?.entryType === "individual";

const UID_RULES = {
  pattern: { value: /^\d{6,15}$/, message: "Game ID must be 6–15 digits" },
};

/* Name, WhatsApp, email and game ID for players[0] — the leader of a squad,
   or the entrant themselves. Identical field names in both cases, so switching
   entry type does not throw away what has already been typed. */
const contactFields = ({ idLabel, idPlaceholder, idRules }) => [
  {
    name: "players.0.name",
    label: "Full Name",
    placeholder: "e.g. Rahim Uddin",
    required: true,
    autoComplete: "name",
    rules: {
      maxLength: { value: 100, message: "Name cannot exceed 100 characters" },
    },
  },
  {
    name: "players.0.phone",
    label: "WhatsApp Number",
    placeholder: "017XXXXXXXX or +88017XXXXXXXX",
    hint: "Room IDs and match times are sent here — make sure WhatsApp is active on it.",
    required: true,
    autoComplete: "tel",
    rules: PHONE_RULES,
  },
  {
    name: "players.0.email",
    label: "Email",
    type: "email",
    placeholder: "you@example.com",
    required: true,
    autoComplete: "email",
    rules: EMAIL_RULES,
  },
  {
    name: "players.0.gameId",
    label: idLabel,
    placeholder: idPlaceholder,
    required: true,
    unique: true,
    rules: idRules,
  },
];

/* The fee is paid before the form is submitted, not at the desk — the
   transaction ID is what proves it. `payment: true` tells the form to render
   the "send it here" panel above these fields, using the receiving number
   loaded from the database. */
const paymentSection = {
  key: "payment",
  title: "Payment",
  subtitle:
    "Send the entry fee first, then enter the transaction ID below. Your registration is confirmed once the committee matches the payment against it.",
  payment: true,
  fields: [
    {
      name: "payment.method",
      label: "Payment Method",
      type: "select",
      options: PAYMENT_METHODS,
      placeholder: "Which service did you pay with?",
      required: true,
    },
    {
      name: "payment.transactionId",
      label: "Transaction ID (TrxID)",
      placeholder: "e.g. 9F7A2B4C1D",
      hint: "The reference in the confirmation SMS. Each one can only be used for a single registration.",
      required: true,
      autoComplete: "off",
      rules: {
        pattern: {
          value: /^[A-Za-z0-9]{6,25}$/,
          message: "Transaction ID is 6–25 letters and digits, no spaces",
        },
      },
    },
  ],
};

const chessPaymentSection = {
  key: "payment",
  title: "Payment",
  subtitle:
    "Send the entry fee first to the designated bKash Personal number, then enter the transaction ID below.",
  payment: true,
  fields: [
    {
      name: "payment.method",
      label: "Payment Method",
      type: "select",
      options: ["bKash"],
      placeholder: "Select bKash",
      required: true,
    },
    {
      name: "payment.transactionId",
      label: "Transaction ID (TrxID)",
      placeholder: "e.g. 9F7A2B4C1D",
      hint: "The reference in the confirmation SMS.",
      required: true,
      autoComplete: "off",
      rules: {
        pattern: {
          value: /^[A-Za-z0-9]{6,25}$/,
          message: "Transaction ID is 6–25 letters and digits, no spaces",
        },
      },
    },
  ],
};

/* Ludo's confirmation wording is the owner's, and it differs from the one the
   esports tournaments use. Written as its own section rather than changing
   `agreementSection`, so nobody is retroactively held to a sentence they were
   never shown. */
const ludoAgreementSection = {
  key: "confirm",
  title: "Confirmation",
  subtitle: "Both are required.",
  fields: [
    {
      name: "agreeInfo",
      label: "I confirm that the information provided is correct.",
      type: "checkbox",
      required: true,
      full: true,
    },
    {
      name: "agreeRules",
      label:
        "I agree to follow all tournament rules and decisions made by the organizers.",
      type: "checkbox",
      required: true,
      full: true,
    },
  ],
};

/* `links` turns named substrings of a checkbox label into hyperlinks — asking
   someone to confirm they have read the rules while giving them no way to
   reach the rules is not a real confirmation.

   The label itself stays a plain string: the server validator quotes it back
   in error messages ("... must be accepted"), so it cannot hold markup. `to`
   is a token rather than a URL because routes.js imports this file, and
   building a real href here would close that cycle — GameRegistrationForm
   resolves it against the game being registered for. */
const agreementSection = {
  key: "confirm",
  title: "Confirmation",
  subtitle:
    "Both are required. The links open in a new tab, so nothing you have typed is lost.",
  fields: [
    {
      name: "agreeRules",
      label:
        "I have read the Rules & Regulations and accept them on behalf of everyone registered here.",
      type: "checkbox",
      required: true,
      full: true,
      links: [{ text: "Rules & Regulations", to: "rules" }],
    },
    {
      name: "agreeContact",
      label:
        "I agree to be contacted by the organizing committee about this tournament.",
      type: "checkbox",
      required: true,
      full: true,
      links: [{ text: "organizing committee", to: "contact" }],
    },
  ],
};

/* PUBG Mobile and Free Fire: squads of four, entered as a full team or as an
   individual who gets placed in one.

   `free` drops the Payment section for a tournament that charges nothing. Both
   battle royales share this builder, so the flag is the only way to make one of
   them free without dragging the other along. */
const battleRoyaleSections = ({
  idLabel,
  idPlaceholder,
  gameLabel,
  free = false,
}) => [
  {
    key: "entry",
    title: "How are you entering?",
    subtitle:
      "Bring a full squad of four, or enter on your own — solo entrants are grouped into squads by the committee.",
    fields: [
      {
        name: "entryType",
        label: "Entry Type",
        type: "choice",
        required: true,
        full: true,
        /* Pre-selected rather than blank: most entrants arrive with a squad,
           and an unanswered question would leave the section below titled
           "Team Leader" before anyone has said there is a team. */
        defaultValue: "team",
        options: [
          {
            value: "team",
            label: "Team",
            hint: "You already have all four players",
          },
          {
            value: "individual",
            label: "Individual",
            hint: "A random squad is formed for you",
          },
        ],
      },
    ],
  },
  {
    key: "solo-notice",
    when: isIndividualEntry,
    notice: {
      title: "A random squad will be formed for you",
      text: `You are entering ${gameLabel} on your own. The committee groups solo entrants into squads of four and announces your teammates in the official group before the first match — you cannot choose who you are placed with.${
        free ? '' : ' The entry fee is still per player.'
      }`,
    },
    fields: [],
  },
  {
    key: "team",
    when: isTeamEntry,
    title: "Team Information",
    subtitle:
      "Your squad name is what appears on the bracket and the scoreboard.",
    fields: [
      {
        name: "teamName",
        label: "Team Name",
        placeholder: "e.g. Coastal Raiders",
        required: true,
        autoComplete: "off",
        rules: {
          minLength: {
            value: 3,
            message: "Team name must be at least 3 characters",
          },
          maxLength: {
            value: 50,
            message: "Team name cannot exceed 50 characters",
          },
        },
      },
    ],
  },
  {
    key: "contact",
    /* Titles take the current values so one section can serve both entry
       types — the fields are the same either way, only who they describe
       changes. */
    title: (values) =>
      isIndividualEntry(values) ? "Your Details" : "Team Leader",
    subtitle: (values) =>
      isIndividualEntry(values)
        ? "How we reach you about your squad, room IDs and match times."
        : `Every ${gameLabel} announcement, room ID and password goes to this person.`,
    fields: contactFields({ idLabel, idPlaceholder, idRules: UID_RULES }),
  },
  {
    key: "roster",
    when: isTeamEntry,
    title: "Squad Roster",
    subtitle:
      "Only the in-game ID is needed for players 2, 3 and 4 — the leader above is player 1.",
    fields: [1, 2, 3].map((i) => ({
      name: `players.${i}.gameId`,
      label: `Player ${i + 1} — ${idLabel}`,
      placeholder: idPlaceholder,
      required: true,
      unique: true,
      rules: UID_RULES,
    })),
  },
  ...(free ? [] : [paymentSection]),
  agreementSection,
];

export const GAMES = [
  // -------------------------------------------------------------------------
  // eFootball (PES) — solo 1v1 knockout
  // -------------------------------------------------------------------------
  {
    slug: "efootball",
    name: "eFootball",
    shortName: "eFootball",
    family: "esports",
    icon: "ball",
    accent: "aqua",
    association: {
      text: "In association with PSTU Esports Club",
      logo: "/events/gaming/pstu esports club.png",
    },
    scope: "Esports · 1v1",
    mode: "Solo",
    tagline: "Virtual football glory — skill, tactics and last-minute winners.",
    blurb:
      "Sixty-four players, one bracket, no second chances. Read the game, time your through-balls, and outplay the person across the table.",
    heroNote: "Individual entry — no team required.",

    tournament: {
      date: GAMING_DAY,
      time: TIME_TBA,
      venue: GAMING_VENUE,
      entryFee: "৳100 per player",
      entryShort: "৳100",
      entryScope: "per player",
      /* The number, for arithmetic — entryFee above is the sentence. */
      feePerPlayer: 100,
      prizePool: "৳3,000",
      format: "Single-elimination knockout · 8-minute matches",
      teamSize: "Solo (1 player)",
      teamSizeShort: "Solo",
      slots: "64 players",
      platform: "Mobile — bring your own device",
      deadline: GAMING_DEADLINE,
    },

    matchFormat: {
      title: "The bracket",
      subtitle:
        "Sixty-four entrants, six rounds, one loss and you are out. Match times are announced in advance.",
      stages: [
        { label: "Round of 64", value: "32 matches" },
        { label: "Round of 32", value: "16 matches" },
        { label: "Round of 16", value: "8 matches" },
        { label: "Quarter-finals", value: "4 matches" },
        { label: "Semi-finals", value: "2 matches" },
        { label: "Final", value: "1 match" },
      ],
    },

    prizes: [
      {
        place: "Champion",
        rank: 1,
        amount: "৳2,000",
        perks: ["Winner trophy", "Certificate of excellence"],
      },
      {
        place: "Runner-Up",
        rank: 2,
        amount: "৳1,000",
        perks: ["Certificate of merit"],
      },
    ],

    rules: [
      {
        title: "Eligibility & Registration",
        icon: "user",
        items: [
          "Open to PSTU students only — campus affiliation is verified at the registration desk.",
          "All participants must be legal residents of Bangladesh.",
          "Each player needs an eFootball account in good standing, and may enter only once.",
          "Register through this website. Late registration is at the organizers’ discretion.",
          "Entry fee is ৳100 per player, paid with the registration form — no cash is taken at the venue.",
          "Your user ID and the device you will play on must be provided before your round starts.",
        ],
      },
      {
        title: "Match Format",
        icon: "flag",
        items: [
          "Sixty-four players in a single-elimination bracket: RO64, RO32, RO16, quarter-finals, semi-finals, final.",
          "Eight minutes per match.",
          "A maximum of 8 special cards may be used in your squad — Double Booster, Single Booster, Iconic, Legendary, Epic, Big Time and Show Time all count toward the limit.",
          "More than 3000 Team Strength will not be allowed.",
          "Game mode is Standard / Competitive, on the latest patch version.",
          "Match times are announced in advance. Check in before your match — late check-in can mean a forfeit.",
        ],
      },
      {
        title: "Technical Issues & Pauses",
        icon: "monitor",
        items: [
          "Each player may pause three times per match. Abusing pauses is sanctioned.",
          "If the game lags or slows, record it, pause, then exit. The restart is played for the remaining game clock — 93 minutes minus the minutes already played.",
          "Goals conceded during lag still count, as does a 1v1 with the keeper at the moment of a disconnect.",
          "A red card followed by a disconnect gives the opponent a two-goal lead as a penalty.",
          "An admin may restart a match where necessary.",
        ],
      },
      {
        title: "Reporting & Disputes",
        icon: "alert",
        items: [
          "The winning player submits a screen recording showing the result screen, room ID, user ID and device.",
          "Protests must be raised within 2 minutes of the match ending, with screenshots, video and timestamps.",
          "Late reports may be penalised. Appeals are accepted for 24 hours, and only serious, well-evidenced cases are reviewed.",
          "The organizers’ decision on results, rules and sanctions is final.",
        ],
      },
      {
        title: "Fair Play & Conduct",
        icon: "shield",
        items: [
          "No hacks, scripts or exploits. No account sharing or impersonation.",
          "No stream sniping or ghosting. No collusion, match-fixing or leaking of match information.",
          "No toxicity or discrimination — sanctions run from a warning through match forfeiture to a ban.",
          "Organizers may stream or broadcast any match. Players may not stream without permission.",
          "Organizers are not liable for participant-side device or network failures. Participants accept that risk.",
        ],
      },
    ],

    stage: "open",
    /* Flip to false to close entries without deleting the form. */
    registrationOpen: true,
    registration: {
      kind: "solo",
      /* No entry-type question — every eFootball entry is a solo one. The
         database still records it, so all three tournaments share a shape. */
      entryType: "solo",
      idPrefix: "PSTU-EFB-2026",
      prep: [
        "Your eFootball / Konami user ID, exactly as it appears in game",
        "The device you will play on — the rules require it before your round starts",
        "A valid student ID for eligibility checks",
        "৳100 sent via bKash or Nagad, and the transaction ID it gives you",
      ],
      sections: [
        {
          key: "player",
          title: "Player Information",
          subtitle:
            "This is how your name appears on the bracket and on your certificate.",
          fields: contactFields({
            idLabel: "eFootball / Konami User ID",
            idPlaceholder: "e.g. 1234-5678-9012",
            idRules: {
              maxLength: {
                value: 40,
                message: "ID cannot exceed 40 characters",
              },
            },
          }),
        },
        {
          key: "device",
          title: "Device",
          subtitle:
            "The rules require your user ID and your device before your round starts, so we collect it now rather than at the desk.",
          fields: [
            {
              name: "players.0.device",
              label: "Device you will play on",
              placeholder: "e.g. Redmi Note 12, iPhone 13",
              required: true,
              full: true,
              rules: {
                maxLength: {
                  value: 80,
                  message: "Cannot exceed 80 characters",
                },
              },
            },
          ],
        },
        paymentSection,
        agreementSection,
      ],
    },

    faqs: [
      {
        q: "Do I need a team for eFootball?",
        a: "No. eFootball is a solo 1v1 knockout — you register as an individual and play your own bracket.",
      },
      {
        q: "How many special cards can I use?",
        a: "Eight at most. Double Booster, Single Booster, Iconic, Legendary, Epic, Big Time and Show Time cards all count toward that limit.",
      },
      {
        q: "What happens if my game lags or I disconnect?",
        a: "Record it, pause, then exit — the restart is played for the remaining game clock, 93 minutes minus what was already played. Goals conceded during lag still count, and so does a 1v1 with the keeper at the moment you dropped.",
      },
      {
        q: "How do I report my result?",
        a: "The winner submits a screen recording showing the result screen, room ID, user ID and device. Disputes need that evidence, and must be raised within 2 minutes of the match ending.",
      },
      {
        q: "How and when do I pay the entry fee?",
        a: "When you register. Send ৳100 per player to the number shown on the form using Send Money, then enter the transaction ID to complete your entry. Nothing is collected at the venue.",
      },
    ],
  },

  // -------------------------------------------------------------------------
  // PUBG Mobile — squad of 4, four matches
  // -------------------------------------------------------------------------
  {
    slug: "pubg-mobile",
    name: "PUBG Mobile",
    shortName: "PUBG",
    family: "esports",
    icon: "gamepad",
    /* Not gold: gold is reserved for actions site-wide, and PUBG's identity
       tile would otherwise be indistinguishable from a status pill. */
    accent: "grape",
    association: {
      text: "In association with PSTU Esports Club",
      logo: "/events/gaming/pstu esports club.png",
    },
    scope: "South Zone · Squad",
    mode: "Squad of 4",
    tagline:
      "Squad up for the battle royale. Last team standing takes the crown.",
    blurb:
      "Four players, four matches, and a shrinking circle. Rotate smart, hold your compound, and survive to the final blue.",
    heroNote:
      "Enter as a squad of four, or on your own — we will place you in one.",

    tournament: {
      date: PUBG_DAY,
      time: "4:00 PM — 6:00 PM",
      venue: GAMING_VENUE,
      /* Free from 30 July 2026. feePerPlayer 0 is what isFreeEntry() reads, and
         it drives the form, the server and every fee line on the site — the two
         strings below are only what those lines print. */
      entryFee: "Free entry",
      entryShort: "Free",
      feePerPlayer: 0,
      prizePool: "৳10,000+",
      format: "Battle Royale — 4 matches, points aggregated",
      teamSize: "4 players",
      teamSizeShort: "Squad of 4",
      slots: "25 squads",
      platform: "Mobile & tablet only",
      deadline: "14 August 2026",
    },

    matchFormat: {
      title: "Map rotation",
      subtitle:
        "Four matches in one session. Every squad plays all four, and the standings are the sum of them.",
      stages: [
        { label: "Match 1", value: "Erangel" },
        { label: "Match 2", value: "Erangel" },
        { label: "Match 3", value: "Miramar" },
        { label: "Match 4", value: "Rondo" },
      ],
      points: brPoints("Chicken Dinner"),
    },

    /* The pool is announced; the split is not. TournamentInfo prints a line
       saying so rather than rendering three trophies that look like they pay
       nothing — add an `amount` to each entry when the figures are confirmed. */
    prizes: [
      {
        place: "Champion",
        rank: 1,
        perks: ["Winner trophy", "Certificate of excellence"],
      },
      { place: "1st Runner-Up", rank: 2, perks: ["Certificate of merit"] },
      { place: "2nd Runner-Up", rank: 3, perks: ["Certificate of merit"] },
    ],

    rules: [
      {
        title: "Team & Eligibility",
        icon: "users",
        items: [
          "A squad is exactly 4 players. Enter as a full squad, or enter alone and be placed in a randomly formed one.",
          "Open to all students from the South zone (academic ID or verification is checked at the desk).",
          "A player may represent only one squad for the whole tournament.",
          "Entry is free — there is no fee to pay, on the form or at the venue.",
          "Team name and player game IDs are locked once registration closes on 5 August. Check them carefully.",
        ],
      },
      {
        title: "Match Format",
        icon: "flag",
        items: [
          "Four matches: Erangel twice, then Miramar, then Rondo.",
          "Final standing = placement points + kill points, summed across all four matches.",
          "Room ID and password are posted to the official group 10 minutes before each match.",
          "Squads must be in the lobby 5 minutes before start time; late squads forfeit that match.",
        ],
      },
      {
        title: "Device & Fair Play",
        icon: "shield",
        items: [
          "Mobile phones and tablets only — emulators, physical triggers and gamepads are banned.",
          "Any hack, mod APK or third-party tool permanently disqualifies the whole squad.",
          "Teaming with other squads, or deliberately throwing a match, is prohibited.",
          "Officials may ask for a screen recording of any match at any time.",
        ],
      },
      {
        title: "Conduct",
        icon: "alert",
        items: [
          "Abusive language or harassment in voice or text chat costs points, or the tournament.",
          "Personal network or device failure is not grounds for a rematch — come prepared.",
          "Bring your own charged device, headset and power bank.",
          "The organizing committee has the final word on every dispute.",
        ],
      },
    ],

    stage: "open",
    registrationOpen: true,
    registration: {
      kind: "squad",
      idPrefix: "PSTU-PUBG-2026",
      prep: [
        "Either a full squad of four, or nothing — solo entrants are placed in a random squad",
        "Every player’s PUBG Mobile UID (the 6–15 digit number in your profile)",
        "A team leader who can receive room IDs and passwords on WhatsApp",
        "A valid student ID from the South zone for each player, checked at the desk",
      ],
      sections: battleRoyaleSections({
        idLabel: "PUBG Mobile UID",
        idPlaceholder: "e.g. 5123456789",
        gameLabel: "PUBG Mobile",
        free: true,
      }),
    },

    faqs: [
      {
        q: "I do not have a full squad. Can I still enter?",
        a: 'Yes. Choose "Individual" on the registration form and the committee will place you in a squad with other solo entrants. Your teammates are announced in the official group before the first match — you cannot choose who you are grouped with.',
      },
      {
        q: "What does it cost?",
        a: "Nothing. PUBG Mobile is free to enter — there is no fee on the form and nothing is collected at the venue. Just fill in your squad, submit, and you are in.",
      },
      {
        q: "Are emulators or triggers allowed?",
        a: "No. Mobile phones and tablets only. Emulators, physical triggers and gamepads are all banned, and using one disqualifies the entire squad.",
      },
      {
        q: "How is the winner decided?",
        a: "Placement points and kill points are added up across all four matches — a chicken dinner is 10 points, second is 6, down to 1 point for seventh and below, plus 1 point per kill. The highest total wins; there is no single-elimination final.",
      },
      {
        q: "Where do we get the room ID and password?",
        a: "They are posted in the official tournament group 10 minutes before each match. The WhatsApp number on this form is how we add you to that group.",
      },
      {
        q: "What if a player disconnects mid-match?",
        a: "The match continues. Personal network or device problems are not grounds for a rematch, so bring a charged device and a stable connection.",
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Free Fire — squad of 4, group stage into a final
  // -------------------------------------------------------------------------
  {
    slug: "free-fire",
    name: "Free Fire",
    shortName: "Free Fire",
    family: "esports",
    icon: "flame",
    accent: "magenta",
    association: {
      text: "In association with PSTU Esports Club",
      logo: "/events/gaming/pstu esports club.png",
    },
    scope: "Esports · Squad",
    mode: "Squad of 4",
    tagline: "Fast, furious mobile battle royale. Drop in, gear up, survive.",
    blurb:
      "Twenty-four squads in two groups, one Bermuda match to survive, then three maps to decide it. No room to breathe.",
    heroNote:
      "Enter as a squad of four, or on your own — we will place you in one.",

    tournament: {
      date: GAMING_DAY,
      time: TIME_TBA,
      venue: GAMING_VENUE,
      entryFee: "Free",
      entryShort: "Free",
      entryScope: "per player",
      feePerPlayer: 0,
      prizePool: "৳10,000",
      format: "Two groups of 12 · Top 6 from each reach the final",
      teamSize: "4 players",
      teamSizeShort: "Squad of 4",
      slots: "24 squads (2 groups of 12)",
      platform: "Mobile & tablet only",
      deadline: GAMING_DEADLINE,
    },

    matchFormat: {
      title: "Group stage into the final",
      subtitle:
        "Twenty-four squads split into two groups of twelve. One Bermuda match decides who advances; the top six from each group play a three-map final.",
      stages: [
        { label: "Group A", value: "Bermuda" },
        { label: "Group B", value: "Bermuda" },
        { label: "Final · Match 1", value: "Purgatory" },
        { label: "Final · Match 2", value: "Kalahari" },
        { label: "Final · Match 3", value: "Nexterra" },
      ],
      points: brPoints("Booyah"),
    },

    prizes: [
      {
        place: "Champion",
        rank: 1,
        amount: "৳6,000",
        perks: ["Winner trophy", "Certificate of excellence"],
      },
      {
        place: "Runner-Up",
        rank: 2,
        amount: "৳3,000",
        perks: ["Certificate of merit"],
      },
      {
        place: "MVP",
        rank: 4,
        amount: "৳1,000",
        perks: ["Most kills across the final"],
      },
    ],

    rules: [
      {
        title: "Team & Eligibility",
        icon: "users",
        items: [
          "A squad is exactly 4 players. Enter as a full squad, or enter alone and be placed in a randomly formed one.",
          "Every player must be a currently enrolled PSTU student with a valid ID card, checked at the desk.",
          "A player may represent only one squad for the whole tournament.",
          "Entry is free — no payment required.",
          "Twenty-four squads are accepted, split into two groups of twelve. Team name and player game IDs are locked once registration closes on 5 August.",
        ],
      },
      {
        title: "Match Format",
        icon: "flag",
        items: [
          "Group stage: two groups of 12 squads, one match each on Bermuda.",
          "The top 6 squads from each group advance — twelve squads reach the final.",
          "Final: three matches, on Purgatory, Kalahari and Nexterra.",
          "The final starts from zero. Group points decide who qualifies, not the final standing.",
          "Custom room ID and password are shared in the official group before each match.",
          "Squads must join the lobby 5 minutes before start time; late squads forfeit that match.",
        ],
      },
      {
        title: "Official Esports Settings",
        icon: "monitor",
        items: [
          "No gun skin allowed.",
          "Character skill allowed.",
          "Revival all allowed.",
          "High tier loot zone disabled.",
        ],
      },
      {
        title: "Device & Fair Play",
        icon: "shield",
        items: [
          "Mobile phones and tablets only — emulators and external controllers are banned.",
          "Hacks, mod APKs or any third-party tool permanently disqualify the entire squad.",
          "Teaming with other squads, or deliberately throwing a match, is prohibited.",
          "Officials may ask for a screen recording of any match at any time.",
        ],
      },
      {
        title: "Conduct",
        icon: "alert",
        items: [
          "Abusive language or harassment in voice or text chat costs points, or the tournament.",
          "Personal network or device failure is not grounds for a rematch — come prepared.",
          "Bring your own charged device, headset and power bank.",
          "The organizing committee has the final word on every dispute.",
        ],
      },
    ],

    stage: "open",
    registrationOpen: true,
    registration: {
      kind: "squad",
      idPrefix: "PSTU-FF-2026",
      prep: [
        "Either a full squad of four, or nothing — solo entrants are placed in a random squad",
        "Every player’s Free Fire UID (the number under your in-game name)",
        "A team leader who can receive room IDs and passwords on WhatsApp",
        "No entry fee required",
      ],
      sections: battleRoyaleSections({
        idLabel: "Free Fire UID",
        idPlaceholder: "e.g. 123456789",
        gameLabel: "Free Fire",
        free: true,
      }),
    },

    faqs: [
      {
        q: "I do not have a full squad. Can I still enter?",
        a: 'Yes. Choose "Individual" on the registration form and the committee will place you in a squad with other solo entrants. Your teammates are announced in the official group before the first match.',
      },
      {
        q: "How do we qualify for the final?",
        a: "Twenty-four squads are split into two groups of twelve, and each group plays one match on Bermuda. The top six squads from each group advance, so twelve squads reach the three-map final.",
      },
      {
        q: "Do group-stage points carry into the final?",
        a: "No. The final starts from zero — the group match decides who qualifies, not where they finish.",
      },
      {
        q: "What does it cost?",
        a: "৳25 per player, so ৳100 for a full squad of four. You pay when you register: send it to the number shown on the form using Send Money, then enter the transaction ID. Nothing is collected at the venue.",
      },
      {
        q: "Are emulators allowed?",
        a: "No. Mobile phones and tablets only. Emulators and external controllers are banned, and using one disqualifies the entire squad.",
      },
      {
        q: "Can a player be in two squads?",
        a: "No. Each player may represent only one squad, and game IDs are checked against every other registration for this tournament.",
      },
    ],
  },

  /* -------------------------------------------------------------------------
     Board and puzzle events.

     Announced only — no dates, entry fees, prizes, rules or coordinators are
     invented here. `stage: 'announced'` renders the honest short page; fill in
     a `tournament` block and the rest in the shape above to promote one.
     ------------------------------------------------------------------------- */
  {
    slug: "chess",
    name: "Chess (Rapid)",
    shortName: "Chess",
    family: "board",
    icon: "crown",
    accent: "aqua",
    scope: "Board · 1v1",
    mode: "Solo",
    tagline: "Classic strategy on 64 squares.",
    blurb: "Outthink your opponent, move by move.",
    heroNote: "Individual participation — no team required.",

    tournament: {
      date: "14 August 2026",
      time: "4:00 PM (Reporting: 3:30 PM)",
      venue: "Agriculture Conference Room",
      entryFee: "৳100 per player",
      entryShort: "৳100",
      entryScope: "per player",
      feePerPlayer: 100,
      prizePool: "৳2,200",
      format: "Single Elimination Knockout Round",
      teamSize: "Solo (1 player)",
      teamSizeShort: "Solo",
      slots: "32 players",
      platform: "On-site Board Game",
      deadline: "5 August 2026",
    },

    prizes: [
      {
        place: "Champion",
        rank: 1,
        amount: "৳1,500",
        perks: ["Winner certificate", "Gold medal"],
      },
      {
        place: "1st Runner-Up",
        rank: 2,
        amount: "৳700",
        perks: ["Runner-up certificate"],
      },
    ],

    rules: [
      {
        title: "Gameplay & Time Control",
        icon: "clock",
        items: [
          "Format: The tournament will follow a strict Single Knockout format. If you lose a match, you are eliminated.",
          "Time Control: This is a Rapid Chess event. Each player will have a fixed time limit per game (10 minutes, subject to final adjustments by the arbiter at the venue).",
          "No Scorekeeping Required: Players do not need to write down their moves on a scoresheet.",
        ],
      },
      {
        title: "Strict Regulations & Infractions",
        icon: "alert",
        items: [
          "Illegal Moves: If a player completes an illegal move and presses the clock, the opponent will be awarded extra time. A second illegal move in the same game results in an immediate loss/forfeiture.",
          "Clock Rules: If your time runs out (flag falls), you lose the game immediately, provided your opponent has enough pieces left to theoretically checkmate you.",
          "Disputes: In case of any dispute or rule confusion during a game, pause the chess clock immediately and raise your hand to call the arbiter. Do not argue with your opponent.",
        ],
      },
      {
        title: "Etiquette & Fair Play",
        icon: "shield",
        items: [
          "Electronic Devices: All mobile phones, smartwatches, and electronic devices must be turned off completely or put on silent mode and stored in your bag before the match starts. Having a ringing phone or using a device during play results in immediate disqualification.",
          "Silence: Absolute silence must be maintained in the Agriculture Conference Room during play.",
          "Draw Offers: Draw offers must be made verbally on your own turn, right after making your move and before pressing the clock.",
        ],
      },
    ],

    stage: "open",
    registrationOpen: true,
    payment: {
      number: "01824090676",
      accountType: "Personal",
      methods: ["bKash"],
      instructions:
        "Send the entry fee to the bKash Personal number above, then enter your Transaction ID (TrxID) below.",
    },
    registration: {
      kind: "solo",
      entryType: "solo",
      idPrefix: "PSTU-CHS-2026",
      prep: [
        "A valid student ID for eligibility checks",
        "৳100 sent via bKash, and the transaction ID it gives you",
      ],
      sections: [
        {
          key: "player",
          title: "Player Information",
          subtitle:
            "This is how your name appears on the bracket and on your certificate.",
          fields: contactFields({
            idLabel: "Student ID",
            idPlaceholder: "e.g. 2102021",
            idRules: {
              maxLength: {
                value: 20,
                message: "Student ID cannot exceed 20 characters",
              },
            },
          }),
        },
        chessPaymentSection,
        agreementSection,
      ],
    },

    faqs: [
      {
        q: "Do I need to bring my own chess board?",
        a: "No. Boards, pieces, and clocks will be provided at the Agriculture Conference Room by the organizing committee.",
      },
      {
        q: "What is the time control for each game?",
        a: "It is a Rapid Chess event. Each player has a fixed 10-minute time control per game.",
      },
      {
        q: "Is there a limit on participation slots?",
        a: "Yes, the tournament is capped at a maximum of 32 players on a first-come, first-served basis.",
      },
    ],
    coordinators: [
      {
        name: "Sadman Hafiz Shuvo",
        role: "IUPC Coordinator · CSE Club, PSTU",
        phone: "01521721630",
        email: "ug2102021@cse.pstu.ac.bd",
      },
    ],
  },
  {
    slug: 'ludo',
    name: 'Ludo',
    shortName: 'Ludo',
    family: 'board',
    icon: 'dice',
    accent: 'magenta',
    scope: 'Board · 1v1',
    mode: 'Solo',
    tagline: 'Roll the dice and race home.',
    blurb: 'The ever-chaotic fan favourite.',
    heroNote: 'Individual participation — no team required.',

    /* ---------------------------------------------------------------------
       PROVISIONAL — five values here still need a yes from the committee.

       They gave us the ৳100 fee and the form fields, nothing else. Date, time,
       venue, deadline and slots are set to match Chess, the other board event,
       so the page is structurally right and the two boards agree with each
       other. Change them here and every surface follows.
       --------------------------------------------------------------------- */
    tournament: {
      date: '14 August 2026',
      time: '2:00 PM (Reporting: 1:30 PM)',
      venue: 'Agriculture Conference Room',
      entryFee: '৳100 per player',
      entryShort: '৳100',
      entryScope: 'per player',
      feePerPlayer: 100,
      format: 'Single Elimination Knockout Round',
      teamSize: 'Solo (1 player)',
      teamSizeShort: 'Solo',
      slots: '32 players',
      platform: 'On-site Board Game',
      deadline: '5 August 2026',
    },

    /* The datathon's pattern for a fee that is settled before the prize is. */
    prizeNote: 'Prize will be announced very soon',
    prizes: [
      {
        place: 'Champion',
        rank: 1,
        amount: 'To be announced',
        perks: ['Winner certificate'],
      },
      {
        place: '1st Runner-Up',
        rank: 2,
        amount: 'To be announced',
        perks: ['Runner-up certificate'],
      },
    ],

    rules: [
      {
        title: 'Format & Gameplay',
        icon: 'dice',
        items: [
          'Single elimination knockout — lose a match and you are out.',
          'Matches are played on the boards provided at the venue.',
          'A player not at their board within five minutes of being called forfeits the match.',
        ],
      },
      {
        title: 'Fair Play',
        icon: 'shield',
        items: [
          'Phones stay in your bag, on silent, for the duration of a match.',
          'Pause and call the referee for any dispute — do not argue with your opponent.',
          'The referee’s decision on a contested move is final.',
        ],
      },
    ],

    stage: 'open',
    registrationOpen: true,

    /* PROVISIONAL — the carnival's gaming-wing bKash, already published on
       this site for PUBG, Free Fire and eFootball, so money sent there reaches
       the committee. Chess uses its own coordinator's number instead; if Ludo
       should have a separate one, this is the single line to change. */
    payment: {
      number: GAMING_PAYMENT.number,
      accountType: GAMING_PAYMENT.accountType,
      methods: PAYMENT_METHODS,
      instructions:
        'Send the entry fee to the number above, then enter the transaction ID and attach a screenshot of the confirmation.',
    },

    registration: {
      /* One entrant per registration — the owner's field list has no team
         fields, and the mode is Solo. */
      kind: "solo",
      entryType: "solo",
      idPrefix: "PSTU-LUDO-2026",
      prep: [
        "Your full name, WhatsApp number and email",
        "Your academic ID and faculty",
        "The ৳100 entry fee, and the transaction ID plus a screenshot of it",
      ],
      sections: [
        {
          key: "player",
          title: "Personal Information",
          subtitle:
            "This is how your name appears on the bracket and on your certificate.",
          /* Not contactFields() — that helper ends with a required in-game ID,
             which a board game does not have. These are the owner's five
             fields, in their order. */
          fields: [
            {
              name: "players.0.name",
              label: "Full Name",
              placeholder: "e.g. Rahim Uddin",
              required: true,
              autoComplete: "name",
              rules: {
                maxLength: {
                  value: 100,
                  message: "Name cannot exceed 100 characters",
                },
              },
            },
            {
              name: "players.0.email",
              label: "Email Address",
              type: "email",
              placeholder: "you@example.com",
              required: true,
              autoComplete: "email",
              rules: EMAIL_RULES,
            },
            {
              name: "players.0.phone",
              label: "WhatsApp Number",
              placeholder: "017XXXXXXXX or +88017XXXXXXXX",
              hint: "Match times are sent here — make sure WhatsApp is active on it.",
              required: true,
              autoComplete: "tel",
              rules: PHONE_RULES,
            },
            {
              name: "players.0.academicId",
              label: "Academic ID",
              placeholder: "Your student ID",
              required: true,
              unique: true,
              rules: {
                maxLength: {
                  value: 40,
                  message: "Academic ID cannot exceed 40 characters",
                },
              },
            },
            {
              name: "players.0.faculty",
              label: "Faculty",
              placeholder: "e.g. Computer Science and Engineering",
              required: true,
              rules: {
                maxLength: {
                  value: 100,
                  message: "Faculty cannot exceed 100 characters",
                },
              },
            },
          ],
        },
        paymentSection,
        ludoAgreementSection,
      ],
    },

    faqs: [
      {
        q: 'Do I need to bring a board?',
        a: 'No. Boards and dice are provided at the venue.',
      },
      {
        q: 'Is there a limit on slots?',
        a: 'Yes, 32 players on a first-come, first-served basis.',
      },
    ],
  },
  {
    slug: 'rubiks-cube',
    name: "Rubik's Cube Speedcubing",
    shortName: "Rubik's",
    family: "board",
    icon: "cube",
    accent: "gold",
    scope: "Speed · Solo",
    mode: "Solo",
    tagline: "Race the clock to solve the cube.",
    blurb: "Fastest fingers, sharpest mind.",
    heroNote: "Individual participation — no team required.",

    tournament: {
      date: "14 August 2026",
      time: "5:00 PM (Reporting: 4:30 PM)",
      venue: "Agriculture Conference Room",
      entryFee: "৳100 per player",
      entryShort: "৳100",
      entryScope: "per player",
      feePerPlayer: 100,
      prizePool: "৳2,200",
      format: "Best of Three Knockout Round",
      teamSize: "Solo (1 player)",
      teamSizeShort: "Solo",
      slots: "32 players",
      platform: "On-site Speedcubing",
      deadline: "5 August 2026",
    },

    prizes: [
      {
        place: "Champion",
        rank: 1,
        amount: "৳1,500",
        perks: ["Winner certificate", "Gold medal"],
      },
      {
        place: "1st Runner-Up",
        rank: 2,
        amount: "৳700",
        perks: ["Runner-up certificate"],
      },
    ],

    rules: [
      {
        title: "Gameplay & Cube Scrambling",
        icon: "clock",
        items: [
          'Format: The tournament follows a "Best of Three" knockout format. Each player gets 3 attempts per round. The single fastest solving time among the 3 attempts will be recorded.',
          "Scrambling: All cubes will be scrambled by official event marshals using a standard computer-generated random sequence right before the attempt.",
          "Inspection Time: Players have a maximum of 15 seconds to inspect the cube. Touching or turning faces during inspection is strictly prohibited.",
        ],
      },
      {
        title: "Strict Regulations & Infractions",
        icon: "alert",
        items: [
          "Timer Rules: Standard Stackmat timer or digital stopwatch will be used. Players must start and stop the timer with both hands flat on the mat. Incorrect use may result in a +2 seconds penalty.",
          "DNF (Did Not Finish): If a cube pops (pieces come apart) during a solve, the player can attempt to fix it and continue within the time, or accept a DNF for that specific run.",
          "Disputes: In case of any dispute or rule confusion, do not reset the timer. Raise your hand immediately to call the judge.",
        ],
      },
      {
        title: "Etiquette & Fair Play",
        icon: "shield",
        items: [
          "Cube Integrity: Participants must bring their own standard 3x3x3 Rubik's Cube. The cube must be fully functional and cannot have any special markings, logos, or textures.",
          "Electronic Devices: No smart devices, phones, or headphones are allowed while sitting at the solving station.",
          "Silence: Absolute silence must be maintained in the Agriculture Conference Room to avoid distracting competing cubers.",
        ],
      },
    ],

    stage: "open",
    registrationOpen: true,
    payment: {
      number: "01790876259",
      accountType: "Personal",
      methods: ["bKash", "Nagad"],
      instructions:
        "Send the 100 BDT entry fee via bKash or Nagad Personal Send Money to the number above, then enter the transaction ID below.",
    },
    registration: {
      kind: "solo",
      entryType: "solo",
      idPrefix: "PSTU-CUB-2026",
      prep: [
        "A valid student ID for eligibility checks",
        "৳100 sent via bKash or Nagad, and the transaction ID it gives you",
      ],
      sections: [
        {
          key: "player",
          title: "Player Information",
          subtitle:
            "This is how your name appears on the bracket and on your certificate.",
          fields: contactFields({
            idLabel: "Student ID",
            idPlaceholder: "Your student ID",
            idRules: {
              maxLength: {
                value: 20,
                message: "Student ID cannot exceed 20 characters",
              },
            },
          }),
        },
        paymentSection,
        agreementSection,
      ],
    },

    faqs: [
      {
        q: "Do I need to bring my own cube?",
        a: "Yes. All participants must bring their own standard 3x3x3 Rubik's Cube.",
      },
      {
        q: "Can I use a magnetic cube?",
        a: "Yes, standard magnetic cubes are allowed, but no special markings, textures, or logos that could aid tile recognition are permitted.",
      },
      {
        q: "How many attempts do I get?",
        a: "You get 3 attempts per round, and your fastest single time among those 3 attempts counts as your score.",
      },
    ],
    coordinators: [
      {
        name: "MH Nazmul",
        role: "Event Coordinator · CSE Club, PSTU",
        phone: "01790876259",
        email: "ug2102013@cse.pstu.ac.bd",
      },
    ],
  },
];

export const GAMING = {
  eyebrow: "Gaming Fest",
  title: "Six arenas. One Booyah.",
  intro:
    "The gaming wing of PSTU IT Carnival 2026 runs three esports tournaments — one solo, two squad-based — alongside three board and puzzle events. eFootball and Free Fire run on 13 August, PUBG Mobile on 14 August, and entries are open now; the board events follow later.",
  note: "Entry fees are paid online while you register — send the amount via bKash or Nagad Send Money, then enter the transaction ID on the form. Your entry is confirmed once a coordinator verifies it.",
  /* Shown wherever a closed tournament would otherwise offer a form. */
  closedHeading: "Registration opens soon",
  closedNote:
    "Entries are not open for this tournament yet. The format, rules and prize breakdown on this page are final, so you can get ready now — the form goes live here once entries open.",
};

/* Registration is per-tournament, so one game can open before the others. */
export const isGameRegistrationOpen = (game) => Boolean(game?.registrationOpen);

export const OPEN_GAMES = () => GAMES.filter(isGameRegistrationOpen);

export const getGame = (slug) => GAMES.find((g) => g.slug === slug);

export const GAME_SLUGS = GAMES.map((g) => g.slug);

/* The sections that apply to a given set of answers. A section with no `when`
   always applies; one with a `when` applies only when it returns true.

   Both the form and the server validator call this, so an individual entrant
   is never shown a squad roster and never fails validation for not filling one
   in. Values may be partially filled — `when` must tolerate undefined. */
export const visibleSections = (game, values) =>
  (game?.registration?.sections || []).filter(
    (section) =>
      typeof section.when !== "function" || section.when(values || {}),
  );

/* Entry type as stored: the answer for a game that asks, the fixed value for
   one that does not. */
export const entryTypeOf = (game, values) =>
  game?.registration?.entryType || values?.entryType || null;
