// ---------------------------------------------------------------------------
// University-wise slot allocation for IUPC.
//
// The university list itself is not repeated here — it comes from
// src/data/universities.js, the same list the registration form searches, so
// the two can never disagree.
//
// This map is an OVERRIDE, not the source. Every pre-registered team has been
// selected, so a university's slots are the teams it entered, counted live —
// see SlotAllocations.jsx. An entry here wins for that one university, for the
// day the committee publishes a different split:
//
//   export const SLOT_ALLOCATIONS = {
//     PSTU: 6,
//     KU: 4,
//   };
//
// Keyed by the university's `short` form. A university left out keeps its live
// count. Set 0 to say a university that entered received no slots — the row
// stays, showing 0, because a university whose teams are in the directory
// should not vanish from the page that explains where they stand.
//
// Only universities that entered are listed either way; a university with no
// pre-registrations has nothing to allocate and no row.
// ---------------------------------------------------------------------------

export const SLOT_ALLOCATIONS = {};

/* null means "no override" — the caller falls back to the live count. 0 is a
   real allocation and wins. */
export const slotsFor = (short) => {
  const value = SLOT_ALLOCATIONS[short];
  return typeof value === 'number' ? value : null;
};
