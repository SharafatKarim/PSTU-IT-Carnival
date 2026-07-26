// ---------------------------------------------------------------------------
// Deadline arithmetic, in one place.
//
// Every countdown on the site reads its date out of src/data/ — nothing here
// hard-codes one. The dates are still placeholders, so the point of routing it
// all through this file is that correcting a date in the data corrects every
// countdown, badge and label that depends on it.
//
// Two rules make this safe to render:
//
//   1. Compare whole days, never timestamps. "3 days left" must not become
//      "2 days left" because the page was opened in the evening.
//   2. Anchor to Asia/Dhaka. The carnival is in Bangladesh; a visitor abroad
//      should see the same number of days as the coordinators do.
//
// Components render `label` on the server and recompute in an effect, so the
// static HTML is never wrong — it is simply computed at build time.
// ---------------------------------------------------------------------------

const DHAKA_OFFSET_MINUTES = 6 * 60; // UTC+06:00, no DST

/* Midnight in Dhaka, expressed as a UTC timestamp. */
const dhakaMidnight = (date) => {
  const shifted = new Date(date.getTime() + DHAKA_OFFSET_MINUTES * 60_000);
  return Date.UTC(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate()
  );
};

const MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

/* A day number, an optional range, a month name, a year. Deliberately strict:
   `new Date('Early August 2026')` happily returns 1 August, which would turn an
   approximate label into a confident countdown. Anything without an explicit
   day — "Early August 2026", "June 2026", "TBA" — must not produce one. */
const DATE_RE = /(\d{1,2})(?:\s*[–—-]\s*\d{1,2})?\s+([A-Za-z]{3,})\.?\s+(\d{4})/;

/**
 * Reads the date formats the data actually uses: "31 July 2026",
 * "Closes 31 July 2026", "13–15 August 2026" (takes the first day).
 * Returns null when there is no explicit day, so callers render no countdown
 * rather than a wrong one.
 */
export const parseEventDate = (value) => {
  if (!value || typeof value !== 'string') return null;

  const match = DATE_RE.exec(value);
  if (!match) return null;

  const [, day, monthName, year] = match;
  const month = MONTHS.indexOf(monthName.toLowerCase());
  if (month === -1) return null;

  const dayNumber = Number(day);
  if (dayNumber < 1 || dayNumber > 31) return null;

  return new Date(Date.UTC(Number(year), month, dayNumber));
};

/**
 * Whole days from today (Dhaka) until `value`.
 *   > 0  still ahead
 *     0  today
 *   < 0  already passed
 * Returns null when the date cannot be read.
 */
export const daysUntil = (value, now = new Date()) => {
  const target = parseEventDate(value);
  if (!target) return null;
  return Math.round((dhakaMidnight(target) - dhakaMidnight(now)) / 86_400_000);
};

/**
 * A short human label for a deadline — what a countdown pill says.
 * `null` means there is nothing worth showing.
 */
export const countdownLabel = (value, now = new Date()) => {
  const days = daysUntil(value, now);
  if (days === null) return null;
  if (days > 1) return `${days} days left`;
  if (days === 1) return 'Last day tomorrow';
  if (days === 0) return 'Closes today';
  return 'Closed';
};

/** Urgency band, so callers style without re-deriving the arithmetic. */
export const urgencyOf = (value, now = new Date()) => {
  const days = daysUntil(value, now);
  if (days === null) return 'unknown';
  if (days < 0) return 'passed';
  if (days <= 3) return 'urgent';
  if (days <= 14) return 'soon';
  return 'distant';
};

/** True while a deadline is still in the future (or today). */
export const isUpcoming = (value, now = new Date()) => {
  const days = daysUntil(value, now);
  return days === null ? false : days >= 0;
};

/**
 * Which stop of a milestone list is current.
 * Returns the index of the first milestone still ahead, or the list length
 * once every one has passed. Milestones must be in chronological order.
 */
export const currentStop = (milestones, now = new Date()) => {
  const index = milestones.findIndex((m) => {
    const days = daysUntil(m.date, now);
    return days === null ? false : days >= 0;
  });
  return index === -1 ? milestones.length : index;
};
