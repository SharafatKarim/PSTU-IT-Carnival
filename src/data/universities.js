// ---------------------------------------------------------------------------
// Universities south of the Padma — the IUPC South Zone catchment.
//
// Covers Barishal Division, Khulna Division, and the Dhaka-division districts
// that sit south or west of the river (Gopalganj, Shariatpur, Faridpur,
// Madaripur, Rajbari). Institutions north of the Padma are deliberately absent.
//
// `short` is what a team name must be prefixed with, e.g. PSTU_Array_Of_Hope,
// so it doubles as data and as a rule. `aliases` only widen the search — a
// team searching "BSMRSTU" still finds Gopalganj under its current name.
//
// The field stays free text, so an institution missing here can still be typed
// in; it simply will not have a prefix enforced.
//
// To add one: append { name, short, district } to the right block.
// ---------------------------------------------------------------------------

export const UNIVERSITIES = [
  // --- Barishal Division ---------------------------------------------------
  {
    name: 'Patuakhali Science and Technology University',
    short: 'PSTU',
    district: 'Patuakhali',
  },
  { name: 'University of Barishal', short: 'BU', district: 'Barishal' },
  { name: 'Barishal Engineering College', short: 'BEC', district: 'Barishal' },
  { name: 'Global University Bangladesh', short: 'GUB', district: 'Barishal' },
  { name: 'University of Global Village', short: 'UGV', district: 'Barishal' },
  { name: 'Trust University, Barishal', short: 'TUB', district: 'Barishal' },

  // --- Khulna Division -----------------------------------------------------
  { name: 'Khulna University', short: 'KU', district: 'Khulna' },
  {
    name: 'Khulna University of Engineering & Technology',
    short: 'KUET',
    district: 'Khulna',
  },
  {
    name: 'Jashore University of Science and Technology',
    short: 'JUST',
    district: 'Jashore',
    aliases: ['Jessore'],
  },
  {
    name: 'Islamic University, Bangladesh',
    short: 'IU',
    district: 'Kushtia',
    aliases: ['Islamic University Kushtia'],
  },
  {
    name: 'Khulna Agricultural University',
    short: 'KAU',
    district: 'Khulna',
  },
  {
    name: 'Satkhira University of Science and Technology',
    short: 'SSTU',
    district: 'Satkhira',
  },
  { name: 'Meherpur University', short: 'MU', district: 'Meherpur' },
  {
    name: 'Bangladesh Army University of Science & Technology, Khulna',
    short: 'BAUST',
    district: 'Khulna',
  },
  {
    name: 'North Western University, Bangladesh',
    short: 'NWU',
    district: 'Khulna',
  },
  {
    name: 'Northern University of Business and Technology, Khulna',
    short: 'NUBTK',
    district: 'Khulna',
  },
  {
    name: 'Khulna Khan Bahadur Ahsanullah University',
    short: 'KKBAU',
    district: 'Khulna',
  },
  { name: 'Rabindra Maitree University', short: 'RMU', district: 'Kushtia' },
  {
    name: 'Lalon University of Science & Arts',
    short: 'LUSA',
    district: 'Kushtia',
  },
  {
    name: 'First Capital University of Bangladesh',
    short: 'FCUB',
    district: 'Chuadanga',
  },

  // --- Dhaka Division, south of the Padma ----------------------------------
  {
    name: 'Gopalganj Science and Technology University',
    short: 'GSTU',
    district: 'Gopalganj',
    /* Renamed from BSMRSTU in January 2025 — teams still search the old name. */
    aliases: ['BSMRSTU', 'Bangabandhu Sheikh Mujibur Rahman Science and Technology University'],
  },
  {
    name: 'Shariatpur Agriculture University',
    short: 'SAU',
    district: 'Shariatpur',
  },
];

/* Exact-name lookup — returns the short form, or undefined for a typed-in
   institution that is not on the list. */
export const shortFormOf = (name) => {
  if (!name) return undefined;
  const needle = name.trim().toLowerCase();
  return UNIVERSITIES.find((u) => u.name.toLowerCase() === needle)?.short;
};

/* Ranked matches for a partial query: exact short form first, then name or
   district prefixes, then anything containing the query (aliases included). */
export const searchUniversities = (query, limit = 8) => {
  const q = query.trim().toLowerCase();
  if (!q) return UNIVERSITIES.slice(0, limit);

  const rank = (u) => {
    const name = u.name.toLowerCase();
    const short = u.short.toLowerCase();
    const district = (u.district || '').toLowerCase();
    const aliases = (u.aliases || []).map((a) => a.toLowerCase());

    if (short === q) return 0;
    if (name.startsWith(q)) return 1;
    if (short.startsWith(q)) return 2;
    if (aliases.some((a) => a.startsWith(q))) return 3;
    if (name.includes(q) || district.startsWith(q)) return 4;
    if (aliases.some((a) => a.includes(q))) return 5;
    return 6;
  };

  return UNIVERSITIES.map((u) => ({ u, r: rank(u) }))
    .filter((x) => x.r < 6)
    .sort((a, b) => a.r - b.r)
    .slice(0, limit)
    .map((x) => x.u);
};
