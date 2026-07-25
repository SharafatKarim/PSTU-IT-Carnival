// ---------------------------------------------------------------------------
// Universities offered as suggestions on the registration form.
//
// `short` is what a team name must be prefixed with, e.g. PSTU_Array_Of_Hope.
// South Zone institutions are listed first since they are the likely entrants,
// but the field stays free-text — a university missing from this list can still
// be typed in, it just will not enforce a prefix.
//
// To add one: append { name, short }. Nothing else needs to change.
// ---------------------------------------------------------------------------

export const UNIVERSITIES = [
  // --- South Zone ---
  { name: 'Patuakhali Science and Technology University', short: 'PSTU' },
  { name: 'University of Barishal', short: 'BU' },
  { name: 'Barishal Engineering College', short: 'BEC' },
  { name: 'Sher-e-Bangla Medical College', short: 'SBMC' },
  { name: 'Barishal Government Polytechnic Institute', short: 'BGPI' },
  { name: 'Khulna University', short: 'KU' },
  { name: 'Khulna University of Engineering & Technology', short: 'KUET' },
  { name: 'Jashore University of Science and Technology', short: 'JUST' },
  { name: 'Gopalganj Science and Technology University', short: 'GSTU' },
  { name: 'Bangabandhu Sheikh Mujibur Rahman Maritime University', short: 'BSMRMU' },

  // --- Public, nationwide ---
  { name: 'Bangladesh University of Engineering and Technology', short: 'BUET' },
  { name: 'University of Dhaka', short: 'DU' },
  { name: 'Jahangirnagar University', short: 'JU' },
  { name: 'Shahjalal University of Science and Technology', short: 'SUST' },
  { name: 'Rajshahi University of Engineering & Technology', short: 'RUET' },
  { name: 'University of Rajshahi', short: 'RU' },
  { name: 'Chittagong University of Engineering & Technology', short: 'CUET' },
  { name: 'University of Chittagong', short: 'CU' },
  { name: 'Islamic University, Kushtia', short: 'IU' },
  { name: 'Comilla University', short: 'CoU' },
  { name: 'Noakhali Science and Technology University', short: 'NSTU' },
  { name: 'Hajee Mohammad Danesh Science & Technology University', short: 'HSTU' },
  { name: 'Mawlana Bhashani Science and Technology University', short: 'MBSTU' },
  { name: 'Pabna University of Science and Technology', short: 'PUST' },
  { name: 'Rangamati Science and Technology University', short: 'RMSTU' },
  { name: 'Bangladesh Agricultural University', short: 'BAU' },
  { name: 'Sher-e-Bangla Agricultural University', short: 'SAU' },
  { name: 'Chittagong Veterinary and Animal Sciences University', short: 'CVASU' },
  { name: 'Bangladesh Army University of Science and Technology', short: 'BAUST' },
  { name: 'Military Institute of Science and Technology', short: 'MIST' },

  // --- Private ---
  { name: 'Islamic University of Technology', short: 'IUT' },
  { name: 'North South University', short: 'NSU' },
  { name: 'BRAC University', short: 'BRACU' },
  { name: 'American International University-Bangladesh', short: 'AIUB' },
  { name: 'Ahsanullah University of Science and Technology', short: 'AUST' },
  { name: 'East West University', short: 'EWU' },
  { name: 'Independent University, Bangladesh', short: 'IUB' },
  { name: 'United International University', short: 'UIU' },
  { name: 'Daffodil International University', short: 'DIU' },
  { name: 'Bangladesh University of Business and Technology', short: 'BUBT' },
  { name: 'Green University of Bangladesh', short: 'GUB' },
  { name: 'Southeast University', short: 'SEU' },
];

/* Exact-name lookup — returns the short form, or undefined for a typed-in
   university that is not on the list. */
export const shortFormOf = (name) => {
  if (!name) return undefined;
  const needle = name.trim().toLowerCase();
  return UNIVERSITIES.find((u) => u.name.toLowerCase() === needle)?.short;
};

/* Ranked matches for a partial query: name prefix first, then short-form
   prefix, then anything containing the query. */
export const searchUniversities = (query, limit = 8) => {
  const q = query.trim().toLowerCase();
  if (!q) return UNIVERSITIES.slice(0, limit);

  const rank = (u) => {
    const name = u.name.toLowerCase();
    const short = u.short.toLowerCase();
    if (short === q) return 0;
    if (name.startsWith(q)) return 1;
    if (short.startsWith(q)) return 2;
    if (name.includes(q)) return 3;
    return 4;
  };

  return UNIVERSITIES.map((u) => ({ u, r: rank(u) }))
    .filter((x) => x.r < 4)
    .sort((a, b) => a.r - b.r)
    .slice(0, limit)
    .map((x) => x.u);
};
