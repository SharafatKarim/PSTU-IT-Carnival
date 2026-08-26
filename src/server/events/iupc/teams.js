import Registration from './model';

// ---------------------------------------------------------------------------
// Read side of IUPC registrations — what the public team directory shows.
//
// PRIVACY: registrations hold coach and member emails, phone numbers and
// Codeforces handles. None of that leaves the server. PUBLIC_FIELDS below is
// the allow-list, and it is a projection at the database level rather than a
// delete-after-fetch, so a new field added to the model is invisible here
// until someone deliberately adds it.
//
// Deliberately absent: coach (entirely), members.email, members.phone,
// members.studentId.
// ---------------------------------------------------------------------------

const PUBLIC_FIELDS = 'registrationId teamId room seat teamName varsityName registrationStatus members.name';

/* "PSTU-IUPC-2026-0007" -> 7. The serial people quote is the trailing counter,
   not the whole ID, so it is derived rather than stored twice. */
export const serialOf = (teamId, registrationId) => {
  const customId = teamId || registrationId || '';
  const match = /(\d+)$/.exec(customId);
  return match ? Number(match[1]) : null;
};

const escapeRe = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/* One box searches what a person might have written down: the team name, the
   university, a member's name, or the serial number off their confirmation
   screen. */
const buildFilter = (search) => {
  const statusFilter = { registrationStatus: { $in: ['paid', 'approved'] } };
  if (!search) return statusFilter;

  /* A bare number is a serial lookup and nothing else — "3" means team 3,
     not "every team with a 3 somewhere in it". Matching it as a substring
     swept in unrelated teams via member names and the 2026 in every ID.
     Both "7" and "0007" find -0007. */
  if (/^\d+$/.test(search)) {
    return { ...statusFilter, registrationId: new RegExp(`-0*${search}$`) };
  }

  const rx = new RegExp(escapeRe(search), 'i');
  return {
    ...statusFilter,
    $or: [
      { teamName: rx },
      { varsityName: rx },
      { teamId: rx },
      { room: rx },
      { 'members.name': rx },
    ],
  };
};

/* Rows written before the status vocabulary changed still say 'pending' or
   'approved'. Map them so the directory never shows two words for one state.
   Drop this once the collection has been migrated. */
const LEGACY_STATUS = { pending: 'pre-registered', approved: 'paid' };

const normaliseStatus = (status) =>
  LEGACY_STATUS[status] || status || 'pre-registered';

const toPublicTeam = (doc) => ({
  serial: serialOf(doc.teamId, doc.registrationId),
  registrationId: doc.registrationId,
  teamId: doc.teamId || doc.registrationId,
  room: doc.room || '',
  seat: doc.seat || '',
  teamName: doc.teamName,
  varsityName: doc.varsityName,
  status: normaliseStatus(doc.registrationStatus),
  members: (doc.members || []).map((m) => m.name),
});

/* Teams per university, for the slot allocation page.
 *
 * Grouped on a normalised key because varsity names are typed by entrants —
 * 'PSTU', 'pstu ' and 'Pstu' are one university — while the label shown is the
 * spelling of the first row seen, so the page reads the way people wrote it.
 *
 * Aggregate only. No document leaves the database: the pipeline returns a name
 * and a count, so this cannot become a second, unfiltered team directory. */
export async function universityCounts() {
  const rows = await Registration.aggregate([
    {
      $match: { registrationStatus: { $in: ['paid', 'approved'] } },
    },
    {
      $group: {
        _id: { $toLower: { $trim: { input: '$varsityName' } } },
        name: { $first: { $trim: { input: '$varsityName' } } },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1, name: 1 } },
  ]);

  return rows
    .filter((row) => row._id)
    .map((row) => ({ key: row._id, name: row.name, count: row.count }));
}

export async function listTeams({ search = '', page = 1, limit = 20 } = {}) {
  const filter = buildFilter(String(search).trim());

  /* Registration IDs are zero-padded, so a plain string sort is the serial
     order — no extra field or aggregation needed. */
  const [total, docs] = await Promise.all([
    Registration.countDocuments(filter),
    Registration.find(filter)
      .select(PUBLIC_FIELDS)
      .sort({ registrationId: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  ]);

  return {
    teams: docs.map(toPublicTeam),
    total,
    page,
    limit,
    pages: Math.max(1, Math.ceil(total / limit)),
  };
}
