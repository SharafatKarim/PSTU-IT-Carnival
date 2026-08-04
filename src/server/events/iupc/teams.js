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

const PUBLIC_FIELDS = 'registrationId teamName varsityName registrationStatus members.name';

/* "PSTU-IUPC-2026-0007" -> 7. The serial people quote is the trailing counter,
   not the whole ID, so it is derived rather than stored twice. */
export const serialOf = (registrationId) => {
  const match = /(\d+)$/.exec(registrationId || '');
  return match ? Number(match[1]) : null;
};

const escapeRe = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/* One box searches what a person might have written down: the team name, the
   university, a member's name, or the serial number off their confirmation
   screen. */
const buildFilter = (search) => {
  if (!search) return {};

  /* A bare number is a serial lookup and nothing else — "3" means team 3,
     not "every team with a 3 somewhere in it". Matching it as a substring
     swept in unrelated teams via member names and the 2026 in every ID.
     Both "7" and "0007" find -0007. */
  if (/^\d+$/.test(search)) {
    return { registrationId: new RegExp(`-0*${search}$`) };
  }

  const rx = new RegExp(escapeRe(search), 'i');
  return {
    $or: [
      { teamName: rx },
      { varsityName: rx },
      /* The registration ID is deliberately NOT matched as text. Every one of
         them reads PSTU-IUPC-2026-nnnn, so "PSTU" returned all 49 teams and
         "IUPC" did too — the prefix is the same for a Khulna team as for a
         Patuakhali one, which makes the field worse than useless in a search
         box: it drowns the university it looks like it is answering.
         The serial branch above still finds a team by its number, which is the
         part of that ID anyone actually quotes. */
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
  serial: serialOf(doc.registrationId),
  registrationId: doc.registrationId,
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
