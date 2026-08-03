/* What each admin tab puts on paper.
 *
 * One entry per tab, mirroring the columns already on screen so a printout and
 * the dashboard read the same — minus the Action column, which means nothing
 * once printed. Cell text may contain newlines; printTable.js escapes first and
 * only then turns those into line breaks.
 *
 * `cls` picks a style from the print stylesheet: num (centred, no wrap), mono
 * (tabular IDs), name (bold), wrap (breaks long words). */

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
      { header: 'Reg ID', cls: 'mono', value: (t) => t.registrationId },
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
                `    ${join([p.gameId && `ID: ${p.gameId}`, p.device])}`,
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
    title: 'Hackathon Pre-Registrations',
    noun: { one: 'team', many: 'teams' },
    summary: (list) => {
      const varsities = new Set(
        list.flatMap((t) => (t.members || []).map((m) => String(m.universityName || '').trim().toLowerCase())).filter(Boolean)
      ).size;
      return `${varsities} ${varsities === 1 ? 'university' : 'universities'} represented`;
    },
    columns: [
      { header: 'Team Name', cls: 'name', value: (t) => t.teamName },
      { header: 'Reg ID', cls: 'mono', value: (t) => t.registrationId },
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
      { header: 'Shortlisted', cls: 'num', value: (t) => (t.shortlisted ? 'Yes' : 'No') },
    ],
  },
};
