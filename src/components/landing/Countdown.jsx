'use client';

import { countdownLabel, urgencyOf } from '@/lib/schedule';
import { useNow } from '@/lib/useNow';

/* Days-left pill for a deadline.
   Server-rendered as the plain date, then swapped for the live countdown once
   the client knows what day it is — see lib/useNow.js for why. Someone with
   JavaScript off still reads the deadline.

   Renders nothing when the date has no explicit day ("Early August 2026"), so
   an approximate label never becomes a confident number. */

const TONE = {
  urgent: 'border-gold-400/40 bg-gold-400/10 text-gold-300',
  soon: 'border-aqua-400/30 bg-aqua-400/10 text-aqua-300',
  distant: 'border-white/10 bg-white/5 text-mist-300',
  passed: 'border-white/10 bg-white/5 text-mist-400',
};

const PILL =
  'inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide tabular-nums';

const Countdown = ({ date, className = '' }) => {
  const now = useNow();

  /* No countdown to show at all — an approximate or missing date. */
  if (countdownLabel(date, new Date()) === null) return null;

  if (!now) {
    return (
      <span className={`${PILL} ${TONE.distant} ${className}`}>
        Closes {date}
      </span>
    );
  }

  const label = countdownLabel(date, now);
  if (!label) return null;

  return (
    <span className={`${PILL} ${TONE[urgencyOf(date, now)] || TONE.distant} ${className}`}>
      {label}
    </span>
  );
};

export default Countdown;
