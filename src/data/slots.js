// ---------------------------------------------------------------------------
// University-wise slot allocation for IUPC.
//
// The university list itself is not repeated here — it comes from
// src/data/universities.js, the same list the registration form searches, so
// the two can never disagree.
//
// Nothing has been allocated yet, so this map is empty and every university
// shows "N/A". To publish an allocation, add an entry keyed by the university's
// `short` form:
//
//   export const SLOT_ALLOCATIONS = {
//     PSTU: 6,
//     KU: 4,
//   };
//
// A university left out of the map keeps showing N/A. Set 0 to say explicitly
// that a university received no slots.
// ---------------------------------------------------------------------------

export const SLOT_ALLOCATIONS = {};

/* null means "not decided yet" — rendered as N/A. 0 is a real allocation. */
export const slotsFor = (short) => {
  const value = SLOT_ALLOCATIONS[short];
  return typeof value === 'number' ? value : null;
};

export const totalAllocated = () =>
  Object.values(SLOT_ALLOCATIONS).reduce(
    (sum, n) => sum + (typeof n === 'number' ? n : 0),
    0
  );

/* True once any allocation exists — the page switches from "not published
   yet" messaging to a real total. */
export const hasAllocations = () => Object.keys(SLOT_ALLOCATIONS).length > 0;
