'use client';

import { useSyncExternalStore } from 'react';

// ---------------------------------------------------------------------------
// "What time is it, on the client?"
//
// Every page here is statically prerendered, so anything derived from the
// current date is frozen at build time in the HTML — a countdown rendered in
// July would still claim "5 days left" in September. This re-derives it in the
// browser.
//
// useSyncExternalStore rather than useState-in-an-effect: it has a first-class
// server snapshot, so the hydration render matches the HTML exactly and React
// re-renders with the real value immediately afterwards. No mismatch warning,
// and no setState inside an effect for the compiler to object to.
// ---------------------------------------------------------------------------

const HOUR = 60 * 60 * 1000;

const subscribe = (onChange) => {
  /* A page can sit open past midnight; an hourly tick is enough for a
     day-granularity countdown and costs nothing. */
  const id = setInterval(onChange, HOUR);
  return () => clearInterval(id);
};

/* Bucketed to the hour so the snapshot is referentially stable between ticks —
   returning a fresh Date here would re-render on every check. */
const getSnapshot = () => Math.floor(Date.now() / HOUR);

const getServerSnapshot = () => null;

/**
 * The current time on the client, or `null` while rendering on the server and
 * during hydration. Callers render a static fallback for `null`.
 */
export function useNow() {
  const hour = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return hour === null ? null : new Date();
}
