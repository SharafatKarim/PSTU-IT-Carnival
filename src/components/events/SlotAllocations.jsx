'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertIcon, CheckIcon } from '@/components/landing/Icons';
import { UNIVERSITIES } from '@/data/universities';
import { slotsFor } from '@/data/slots';
import { getEventDetail, IUPC_PAYMENT } from '@/data/events';
import { fetchUniversityCounts } from '@/services/events/iupc';
import { eventSlotsNav } from '@/lib/routes';
import { accentOf } from '@/lib/accents';
import EventSubPage, { SubPageTabs } from './EventSubPage';

const COLS = 'sm:grid-cols-[minmax(0,1fr)_9rem_6rem]';

/* University-wise slots.
 *
 * There is no separate allocation to publish: every pre-registered team is in,
 * so a university's slot count IS the number of teams it entered, counted live
 * from the aggregate endpoint. The page used to print both — a "Teams" column
 * with the real number beside a "Slots" column reading N/A on every row, which
 * said "nothing is decided" next to the figure that had decided it.
 *
 * slotsFor() survives as an override for the day the committee publishes a
 * different split; until then it returns null everywhere and the count stands.
 *
 * Universities that entered nothing are not listed. This is a table of who is
 * coming, and twelve rows of 0 buried the eleven that matter. */
const SlotAllocations = ({ slug = 'iupc' }) => {
  const event = getEventDetail(slug);
  const accent = accentOf(event?.accent);
  const [query, setQuery] = useState('');

  const [counts, setCounts] = useState(null);
  /* Kept apart from `counts` because the table is now built FROM the counts:
     with one null for both states, a failed request renders as "no university
     entered", which is a lie rather than an error. */
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchUniversityCounts(controller.signal)
      .then(setCounts)
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setError(err.message || 'Could not load the slot counts');
      });
    return () => controller.abort();
  }, []);

  const loading = !counts && !error;

  /* Registrations are keyed on what entrants typed, so the aggregate is matched
     to the canonical list on a normalised name and then on the short form, for
     the teams that wrote "PSTU" where the list says "Patuakhali Science and
     Technology University". Both keys can carry rows, so they are summed rather
     than the first one winning.

     Anything left over is a university nobody put on the canonical list. It
     still gets a row: its teams are in the directory, and a page that quietly
     dropped them would report a smaller contest than the one being run. */
  const allRows = useMemo(() => {
    if (!counts) return [];

    const remaining = new Map(counts.map((c) => [c.key, c]));
    const matched = [];

    for (const u of UNIVERSITIES) {
      let teams = 0;
      for (const key of [u.name.trim().toLowerCase(), u.short.trim().toLowerCase()]) {
        const row = remaining.get(key);
        if (row) {
          teams += row.count;
          remaining.delete(key);
        }
      }
      if (teams > 0) matched.push({ ...u, teams, slots: slotsFor(u.short) ?? teams });
    }

    const unlisted = [...remaining.values()].map((row) => ({
      name: row.name,
      short: '',
      district: '',
      teams: row.count,
      slots: row.count,
    }));

    /* Biggest contingent first — an allocation table is read for size, and the
       canonical list's own order means nothing to a visitor. */
    return [...matched, ...unlisted].sort(
      (a, b) => b.slots - a.slots || a.name.localeCompare(b.name)
    );
  }, [counts]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allRows;
    return allRows.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.short.toLowerCase().includes(q) ||
        (u.district || '').toLowerCase().includes(q)
    );
  }, [query, allRows]);

  const totalSlots = allRows.reduce((sum, u) => sum + u.slots, 0);

  return (
    <EventSubPage
      event={event}
      slug={slug}
      nav={eventSlotsNav(slug)}
      eyebrow={event?.scope}
      title="Slot Allocations"
      intro={`University-wise slots for ${event?.name}. Every pre-registered team has been selected, so a university's slots are the teams it entered.`}
      tabs={<SubPageTabs slug={slug} active="slots" />}
    >
      {!loading && !error && (
        <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-emerald-400/25 bg-emerald-400/[0.07] px-4 py-3 text-sm text-mist-200">
          <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
          <span>
            <strong className="font-semibold text-white">
              Every pre-registered team has been selected for the contest.
            </strong>{' '}
            No shortlist, no cut —{' '}
            <strong className="font-semibold text-white">{totalSlots}</strong>{' '}
            team{totalSlots === 1 ? '' : 's'} across{' '}
            <strong className="font-semibold text-white">{allRows.length}</strong>{' '}
            universit{allRows.length === 1 ? 'y' : 'ies'} are in, and the number
            beside each university is its confirmed slots. Confirm your place by
            paying the entry fee from your row in the team directory by{' '}
            <strong className="font-semibold text-white">
              {IUPC_PAYMENT.deadline}
            </strong>
            .
          </span>
        </div>
      )}

      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search universities</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by university, short form, or district"
            className="w-full rounded-lg border border-ink-600 bg-ink-900/70 px-4 py-2.5 text-sm text-white placeholder-mist-500 outline-none transition focus:border-grape-500 focus:ring-2 focus:ring-grape-500/30"
          />
        </label>
        <p className="shrink-0 text-sm text-mist-400">
          {loading
            ? 'Loading…'
            : `${rows.length} universit${rows.length === 1 ? 'y' : 'ies'}`}
        </p>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-ink-600 bg-ink-800/50">
        <div
          className={`hidden gap-4 bg-ink-900/50 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-mist-400 sm:grid ${COLS}`}
        >
          <span>University</span>
          <span>District</span>
          <span className="justify-self-end">Slots</span>
        </div>

        {error ? (
          <div className="flex items-start gap-2.5 border-t border-ink-700/70 p-6 text-sm text-red-300">
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : loading ? (
          <p className="border-t border-ink-700/70 p-10 text-center text-sm text-mist-400">
            Loading slots…
          </p>
        ) : rows.length === 0 ? (
          <p className="border-t border-ink-700/70 p-10 text-center text-sm text-mist-400">
            {query
              ? 'No university matches that search.'
              : 'No team has pre-registered yet.'}
          </p>
        ) : (
          <ul>
            {rows.map((u) => (
              <li
                key={u.short || u.name}
                className={`grid grid-cols-1 items-start gap-x-4 gap-y-1 border-t border-ink-700/70 px-3 py-3 transition hover:bg-white/[0.02] sm:items-center sm:py-2.5 ${COLS}`}
              >
                <div className="flex items-start justify-between gap-3 sm:block">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {u.name}
                    </p>
                    {u.short && (
                      <p className={`text-[11px] font-bold uppercase tracking-wide ${accent.text}`}>
                        {u.short}
                      </p>
                    )}
                  </div>
                  {/* Slots ride the top line on mobile, own column on desktop. */}
                  <span className="shrink-0 sm:hidden">
                    <SlotValue slots={u.slots} />
                  </span>
                </div>

                <p className="truncate text-sm text-mist-300">
                  <span className="text-mist-500 sm:hidden">District: </span>
                  {u.district || '—'}
                </p>

                <div className="hidden sm:block sm:justify-self-end">
                  <SlotValue slots={u.slots} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-5 text-xs leading-relaxed text-mist-500">
        Slots are counted live from the pre-registrations. A university appears
        here once it has entered at least one team; the full list of teams is on
        the Registered Teams tab.
      </p>
    </EventSubPage>
  );
};

const SlotValue = ({ slots }) => (
  <span className="rounded-md border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-xs font-bold text-emerald-300">
    {slots}
  </span>
);

export default SlotAllocations;
