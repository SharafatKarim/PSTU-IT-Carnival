import GamingRegistration from './model';

// ---------------------------------------------------------------------------
// Read side of gaming registrations — what the public directory shows.
//
// PRIVACY: a registration holds the entrant's email, WhatsApp number and their
// payment transaction ID. None of that leaves the server. PUBLIC_FIELDS is an
// allow-list applied as a database projection rather than a delete-after-fetch,
// so a field added to the model is invisible here until somebody deliberately
// adds it.
//
// Deliberately absent: contact.email, contact.phone, payment.transactionId,
// payment.receiverNumber, players[].device.
//
// Game IDs are also withheld. They are not secret, but publishing a list of
// every entrant's UID next to their real name is a free targeting list for
// in-game harassment, and the directory's job is only to let someone confirm
// their own entry landed.
// ---------------------------------------------------------------------------

const PUBLIC_FIELDS =
  'registrationId game entryType teamName contact.name registrationStatus payment.verified players.name';

/* "PSTU-PUBG-2026-0007" -> 7. The serial people quote is the trailing counter,
   not the whole ID, so it is derived rather than stored twice. */
export const serialOf = (registrationId) => {
  const match = /(\d+)$/.exec(registrationId || '');
  return match ? Number(match[1]) : null;
};

const escapeRe = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/* One box searches what a person might actually have written down: the squad
   name, their own name, the full registration ID, or just the serial off the
   confirmation screen. */
const buildFilter = (game, search) => {
  const base = { game };
  if (!search) return base;

  /* A bare number is a serial lookup and nothing else — "3" means entry 3, not
     "every entry with a 3 somewhere in it", which would sweep in the 2026 that
     is part of every ID. Both "7" and "0007" find -0007. */
  if (/^\d+$/.test(search)) {
    return { ...base, registrationId: new RegExp(`-0*${search}$`) };
  }

  const rx = new RegExp(escapeRe(search), 'i');
  return {
    ...base,
    $or: [{ teamName: rx }, { 'contact.name': rx }, { registrationId: rx }],
  };
};

/* An individual entrant has no squad yet — the committee forms one after
   entries close. Saying so is more useful than an empty cell. */
export const UNALLOCATED = 'To be Allocated';

const toPublicEntry = (doc) => ({
  serial: serialOf(doc.registrationId),
  registrationId: doc.registrationId,
  entryType: doc.entryType,
  /* Squads show their name; solo and individual entries show the person. */
  teamName: doc.entryType === 'team' ? doc.teamName : null,
  playerName: doc.contact?.name || '',
  playerCount: (doc.players || []).length,
  status: doc.registrationStatus || 'paid',
  paymentVerified: Boolean(doc.payment?.verified),
});

export async function listGameRegistrations(
  game,
  { search = '', page = 1, limit = 25 } = {}
) {
  const filter = buildFilter(game, String(search).trim());

  /* Registration IDs are zero-padded, so a plain string sort is the serial
     order — no extra field or aggregation needed. */
  const [total, docs] = await Promise.all([
    GamingRegistration.countDocuments(filter),
    GamingRegistration.find(filter)
      .select(PUBLIC_FIELDS)
      .sort({ registrationId: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  ]);

  /* Counted from the whole tournament, not the current page — a squad count
     that changed as you paged would be worse than none. */
  const [squads, solos] = await Promise.all([
    GamingRegistration.countDocuments({ game, entryType: 'team' }),
    GamingRegistration.countDocuments({ game, entryType: { $ne: 'team' } }),
  ]);

  return {
    entries: docs.map(toPublicEntry),
    total,
    page,
    limit,
    pages: Math.max(1, Math.ceil(total / limit)),
    counts: { squads, solos },
  };
}
