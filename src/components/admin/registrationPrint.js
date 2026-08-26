import { HACKATHON_ACCEPTED_TEAMS } from '@/data/events';

const dash = '—';

/* Drops the blanks before joining so an absent phone does not leave a stray
   separator or an empty line in the middle of a cell. */
const join = (parts, sep = ' · ') => parts.filter(Boolean).join(sep) || dash;
const lines = (parts) => parts.filter(Boolean).join('\n') || dash;

const memberLabel = (m, i, isLeader) =>
  `${i + 1}. ${m.name || 'Unnamed'}${isLeader ? ' (Leader)' : ''}`;

const paidSummary = (list, isPaid, doneLabel = 'approved') => {
  const done = list.filter(isPaid).length;
  return `${done} ${doneLabel} · ${list.length - done} pending`;
};

export const REGISTRATION_PRINT = {
  datathon: {
    title: 'Datathon Registrations',
    noun: { one: 'team', many: 'teams' },
    summary: (list) => paidSummary(list, (t) => t.paid),
    columns: [
      { header: 'Team Name', cls: 'name', value: (t) => t.teamName },
      { header: 'Reg ID', cls: 'mono', value: (t) => t.registrationId },
      { header: 'Transaction ID', cls: 'mono', value: (t) => t.transactionId },
      {
        header: 'Members',
        cls: 'wrap',
        value: (t) =>
          lines(
            (t.members || []).map((m, i) =>
              lines([
                memberLabel(m, i, m.isTeamLeader),
                `    ${join([m.universityName, m.universityId && `ID: ${m.universityId}`])}`,
                `    ${join([
                  m.kaggleUsername && `Kaggle: ${m.kaggleUsername}`,
                  m.kaggleEmail,
                  m.phone,
                ])}`,
              ])
            )
          ),
      },
      { header: 'Status', cls: 'num', value: (t) => (t.paid ? 'Approved' : 'Pending') },
    ],
  },

  iupc: {
    title: 'IUPC Pre-Registrations',
    noun: { one: 'team', many: 'teams' },
    /* Reach and money, in that order: how many universities are on the list,
       then how far through the entry fees the committee is. */
    summary: (list) => {
      const varsities = new Set(
        list.map((t) => String(t.varsityName || '').trim().toLowerCase()).filter(Boolean)
      ).size;
      const paid = list.filter((t) => t.registrationStatus === 'paid').length;
      const awaiting = list.filter(
        (t) => t.registrationStatus === 'payment-submitted'
      ).length;
      return `${varsities} ${varsities === 1 ? 'university' : 'universities'} · ${paid} paid · ${awaiting} awaiting check`;
    },
    columns: [
      { header: 'Team Name', cls: 'name', value: (t) => t.teamName },
      { header: 'Team ID', cls: 'mono', value: (t) => t.teamId || t.registrationId },
      { header: 'Varsity', cls: 'wrap', value: (t) => t.varsityName },
      {
        header: 'Payment',
        cls: 'wrap',
        value: (t) =>
          lines([
            t.payment?.transactionId,
            t.payment?.method,
            t.payment?.amount != null && `BDT ${t.payment.amount}`,
          ]),
      },
      {
        header: 'Status',
        cls: 'num',
        value: (t) =>
          t.registrationStatus === 'paid'
            ? 'Paid'
            : t.registrationStatus === 'payment-submitted'
              ? 'Awaiting check'
              : 'Pre-registered',
      },
      {
        header: 'Coach',
        cls: 'wrap',
        value: (t) => lines([t.coach?.name, t.coach?.email, t.coach?.phone]),
      },
      {
        header: 'Members',
        cls: 'wrap',
        /* Codeforces handles were dropped from this column — the printed sheet
           tracks the screen, and the handle is not what an organiser needs when
           looking a team up on paper. */
        value: (t) =>
          lines(
            (t.members || []).map((m, i) =>
              lines([memberLabel(m, i, m.isTeamLeader), `    ${join([m.phone])}`])
            )
          ),
      },
    ],
  },

  gaming: {
    title: 'Gaming Registrations',
    noun: { one: 'entry', many: 'entries' },
    summary: (list) =>
      paidSummary(list, (t) => t.registrationStatus === 'paid', 'verified'),
    columns: [
      { header: 'Game', cls: 'num', value: (t) => String(t.game || '').toUpperCase() },
      {
        header: 'Team / Entry',
        cls: 'wrap',
        value: (t) => lines([t.teamName || 'Solo Entrant', t.registrationId, t.entryType]),
      },
      {
        header: 'Payment',
        cls: 'wrap',
        /* A free tournament (PUBG from 30 July 2026) has no method, no
           transaction ID and an amount of 0 — printing "BDT 0" reads like an
           unpaid fee rather than no fee. */
        value: (t) =>
          t.payment?.amount === 0
            ? 'Free entry'
            : lines([
                t.payment?.transactionId,
                t.payment?.receiverNumber && `Recv: ${t.payment.receiverNumber}`,
                t.payment?.amount != null && `BDT ${t.payment.amount}`,
              ]),
      },
      {
        header: 'Contact',
        cls: 'wrap',
        value: (t) => lines([t.contact?.name, t.contact?.email, t.contact?.phone]),
      },
      {
        header: 'Players',
        cls: 'wrap',
        value: (t) =>
          lines(
            (t.players || []).map((p, i) =>
              lines([
                memberLabel(p, i, p.isLeader),
                `    ${join([
                  p.gameId && `ID: ${p.gameId}`,
                  p.device,
                  p.academicId && `Acad ID: ${p.academicId}`,
                  p.faculty && `Faculty: ${p.faculty}`,
                ])}`,
              ])
            )
          ),
      },
      {
        header: 'Status',
        cls: 'num',
        value: (t) => (t.registrationStatus === 'paid' ? 'Verified' : 'Pending'),
      },
    ],
  },

  'it-quiz': {
    title: 'IT Quiz Registrations',
    noun: { one: 'participant', many: 'participants' },
    summary: (list) => paidSummary(list, (e) => e.paid, 'verified'),
    columns: [
      { header: 'Name', cls: 'name', value: (e) => e.fullName },
      { header: 'Reg ID', cls: 'mono', value: (e) => e.registrationId },
      {
        header: 'Contact',
        cls: 'wrap',
        value: (e) => lines([e.whatsapp, e.email]),
      },
      {
        header: 'Academic Info',
        cls: 'wrap',
        value: (e) =>
          lines([
            e.universityName,
            e.academicId && `ID: ${e.academicId}`,
            join([
              e.faculty,
              e.semester && `Sem: ${e.semester}`,
              e.session && `Sess: ${e.session}`,
            ]),
          ]),
      },
      {
        header: 'Payment',
        cls: 'wrap',
        value: (e) =>
          lines([
            e.payment?.transactionId,
            e.payment?.receiverNumber && `Recv: ${e.payment.receiverNumber}`,
            e.payment?.amount != null && `BDT ${e.payment.amount}`,
          ]),
      },
      { header: 'Status', cls: 'num', value: (e) => (e.paid ? 'Verified' : 'Pending') },
    ],
  },

  'app-challenge': {
    title: 'App Challenge Registrations',
    noun: { one: 'entry', many: 'entries' },
    summary: (list) => `${list.length} registered`,
    columns: [
      { header: 'App Name', cls: 'name', value: (e) => e.appName },
      { header: 'Reg ID', cls: 'mono', value: (e) => e.registrationId },
      { header: 'Developer Name', cls: 'name', value: (e) => e.fullName },
      { header: 'Student ID', cls: 'mono', value: (e) => e.studentId },
      { header: 'Email', cls: 'wrap', value: (e) => e.email },
      { header: 'Short Abstract', cls: 'wrap', value: (e) => e.shortAbstract },
      { header: 'Status', cls: 'num', value: () => 'Verified' },
    ],
  },

  'project-showcase': {
    title: 'Project Showcasing Registrations',
    noun: { one: 'team', many: 'teams' },
    summary: (list) => paidSummary(list, (t) => t.paid),
    columns: [
      { header: 'Team Name', cls: 'name', value: (t) => t.teamName },
      { header: 'Reg ID', cls: 'mono', value: (t) => t.registrationId },
      { header: 'Transaction ID', cls: 'mono', value: (t) => t.transactionId },
      {
        header: 'Members',
        cls: 'wrap',
        value: (t) =>
          lines(
            (t.members || []).map((m, i) =>
              lines([
                memberLabel(m, i, m.isTeamLeader),
                `    ${join([m.universityName, m.universityId && `ID: ${m.universityId}`])}`,
                `    ${join([m.email, m.phone])}`,
              ])
            )
          ),
      },
      { header: 'Status', cls: 'num', value: (t) => (t.paid ? 'Approved' : 'Pending') },
    ],
  },

  hackathon: {
    title: 'Hackathon Registrations',
    noun: { one: 'team', many: 'teams' },
    summary: (list) => {
      const varsities = new Set(
        list.flatMap((t) => (t.members || []).map((m) => String(m.universityName || '').trim().toLowerCase())).filter(Boolean)
      ).size;
      const paid = list.filter((t) => t.status === 'paid' || t.finalRegistered).length;
      const awaiting = list.filter((t) => t.status === 'payment-submitted').length;
      return `${varsities} varsities · ${paid} paid · ${awaiting} awaiting check`;
    },
    columns: [
      { header: 'Team Name', cls: 'name', value: (t) => t.teamName },
      { header: 'Reg ID', cls: 'mono', value: (t) => t.registrationId },
      {
        header: 'Payment',
        cls: 'wrap',
        value: (t) =>
          t.status === 'paid' || t.status === 'payment-submitted'
            ? lines([
                t.payment?.transactionId,
                t.payment?.method,
                t.payment?.amount != null && `BDT ${t.payment.amount}`,
              ])
            : 'Unpaid',
      },
      {
        header: 'Status',
        cls: 'num',
        value: (t) =>
          t.status === 'paid'
            ? 'Paid'
            : t.status === 'payment-submitted'
              ? 'Awaiting check'
              : 'Pre-registered',
      },
      {
        header: 'Members',
        cls: 'wrap',
        value: (t) =>
          lines(
            (t.members || []).map((m, i) =>
              lines([
                `${i + 1}. ${m.fullName || 'Unnamed'}${m.isTeamLeader ? ' (Leader)' : ''}`,
                `    ${join([m.universityName, m.department && `Dept: ${m.department}`, `T-Shirt: ${m.tshirtSize}`])}`,
                `    ${join([m.email, m.whatsapp])}`,
              ])
            )
          ),
      },
      {
        header: 'Shortlisted',
        cls: 'num',
        value: (t) =>
          t.shortlisted || HACKATHON_ACCEPTED_TEAMS.includes(t.registrationId)
            ? 'Yes'
            : 'No',
      },
    ],
  },
};

/* ---------------------------------------------------------------------------
   IUPC kit handover.

   Not a tab config — a second sheet printed from the IUPC toolbar, for the desk
   on contest day. It differs from the tab printout in three ways that all come
   from being a working document rather than a record:

   PAID TEAMS ONLY. A team that has not settled the fee is not collecting a kit,
   and printing it gives whoever is at the desk a decision to make that is not
   theirs to make. The filtering happens at the call site, which owns the list.

   T-SHIRT SIZE against each member, because that is the question actually being
   asked while handing a bag over. The tab printout carries phone numbers
   instead, which is the right column for chasing a team and the wrong one here.

   AN EMPTY COLUMN to tick. Which is why BLANK exists: printTable renders an
   empty or null cell as an em dash, and a column of em dashes reads as "no
   data" rather than "write here". Non-breaking spaces give a genuinely blank
   box, and the width keeps it wide enough for a pen.
   --------------------------------------------------------------------------- */
const BLANK = ' '.repeat(12);

export const IUPC_KIT_PRINT = {
  title: 'IUPC Kit Handover — Paid Teams',
  summary: (list) => {
    const shirts = list.reduce((n, t) => n + (t.members?.length || 0), 0);
    return `${list.length} paid ${list.length === 1 ? 'team' : 'teams'} · ${shirts} t-shirt${shirts === 1 ? '' : 's'} to hand out`;
  },
  columns: [
    { header: 'Team Name', cls: 'name', value: (t) => t.teamName },
    {
      header: 'Team ID / Location',
      cls: 'mono',
      value: (t) =>
        lines([
          `ID: ${t.teamId || t.registrationId || 'N/A'}`,
          `Room: ${t.room || 'TBD'}`,
          `Seat: ${t.seat || 'TBD'}`,
        ]),
    },
    { header: 'Varsity', cls: 'wrap', value: (t) => t.varsityName },
    {
      header: 'Members & T-Shirt',
      cls: 'wrap',
      value: (t) =>
        lines(
          (t.members || []).map(
            (m, i) =>
              `${memberLabel(m, i, m.isTeamLeader)}${m.phone ? ` (${m.phone})` : ''} — ${m.tshirtSize || 'size not set'}`
          )
        ),
    },
    {
      header: 'Coach',
      cls: 'wrap',
      value: (t) => lines([t.coach?.name, t.coach?.phone]),
    },
    { header: 'Kits Delivered', width: '110px', value: () => BLANK },
  ],
};

export const HACKATHON_KIT_PRINT = {
  title: 'Hackathon Kit Handover — Paid Teams',
  summary: (list) => {
    const shirts = list.reduce((n, t) => n + (t.members?.length || 0), 0);
    return `${list.length} paid ${list.length === 1 ? 'team' : 'teams'} · ${shirts} t-shirt${shirts === 1 ? '' : 's'} to hand out`;
  },
  columns: [
    { header: 'Team Name', cls: 'name', value: (t) => t.teamName },
    { header: 'Reg ID', cls: 'mono', value: (t) => t.registrationId },
    {
      header: 'Members & T-Shirt',
      cls: 'wrap',
      value: (t) =>
        lines(
          (t.members || []).map(
            (m, i) =>
              `${i + 1}. ${m.fullName || 'Unnamed'}${m.isTeamLeader ? ' (Leader)' : ''} — ${m.tshirtSize || 'size not set'}`
          )
        ),
    },
    {
      header: 'Contact',
      cls: 'wrap',
      value: (t) => {
        const leader = (t.members || []).find((m) => m.isTeamLeader) || t.members?.[0];
        return lines([leader?.fullName && `Leader: ${leader.fullName}`, leader?.email, leader?.whatsapp]);
      },
    },
    { header: 'Kits Delivered', width: '110px', value: () => BLANK },
  ],
};

export const TSHIRT_DISTRIBUTION_PRINT = {
  columns: [
    { header: 'T-Shirt Size', cls: 'name', value: (r) => r.size },
    { header: 'Count / Quantity', cls: 'num', value: (r) => String(r.count) },
  ],
};

export const tshirtDistributionPrintConfig = (teams, eventTitle) => {
  const { rows, total } = tshirtCounts(teams);
  return {
    title: `${eventTitle} T-Shirt Size Distribution — Paid Teams`,
    summary: `${teams.length} paid ${teams.length === 1 ? 'team' : 'teams'} · ${total} total t-shirt${total === 1 ? '' : 's'}`,
    columns: TSHIRT_DISTRIBUTION_PRINT.columns,
    rows,
  };
};

/* T-shirt counts for the paid teams, in garment order rather than alphabetical
   — nobody orders shirts L, M, S, XL, XXL.
 *
 * A member whose size is missing gets its own bucket instead of being dropped.
 * The schema requires the field, so this should always be zero; if it is not,
 * the total still reconciles with three shirts per team, and a silent shortfall
 * at the printer is worse than an ugly line on a report. */
const SHIRT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const NO_SIZE = '(size not set)';

export const tshirtCounts = (teams) => {
  const counts = new Map(SHIRT_SIZES.map((size) => [size, 0]));

  for (const team of teams) {
    for (const member of team.members || []) {
      const size = String(member.tshirtSize || '').trim().toUpperCase();
      const key = counts.has(size) ? size : NO_SIZE;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }

  /* Drop the unset bucket when it is empty so the normal report is five lines. */
  if (!counts.get(NO_SIZE)) counts.delete(NO_SIZE);

  const rows = [...counts.entries()].map(([size, count]) => ({ size, count }));
  return { rows, total: rows.reduce((n, r) => n + r.count, 0) };
};

