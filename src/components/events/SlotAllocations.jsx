'use client';

import { useMemo, useState } from 'react';
import { AlertIcon } from '@/components/landing/Icons';
import { UNIVERSITIES } from '@/data/universities';
import { slotsFor, totalAllocated, hasAllocations } from '@/data/slots';
import { getEventDetail } from '@/data/events';
import { eventSlotsNav } from '@/lib/routes';
import { accentOf } from '@/components/gaming/accents';
import EventSubPage, { SubPageTabs } from './EventSubPage';

const COLS = 'sm:grid-cols-[minmax(0,1fr)_9rem_6rem]';

/* The list is the same one the registration form searches — universities are
   never restated here, so a university added there appears here too. */
const SlotAllocations = ({ slug = 'iupc' }) => {
  const event = getEventDetail(slug);
  const accent = accentOf(event?.accent);
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return UNIVERSITIES.filter(
      (u) =>
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.short.toLowerCase().includes(q) ||
        (u.district || '').toLowerCase().includes(q)
    ).map((u) => ({ ...u, slots: slotsFor(u.short) }));
  }, [query]);

  const published = hasAllocations();

  return (
    <EventSubPage
      event={event}
      slug={slug}
      nav={eventSlotsNav(slug)}
      eyebrow={event?.scope}
      title="Slot Allocations"
      intro={`University-wise slots for ${event?.name}. ${
        published
          ? `${totalAllocated()} of ${event?.tournament?.slots || ''} allocated so far.`
          : 'Nothing has been allocated yet — every university shows N/A until slots are published.'
      }`}
      tabs={<SubPageTabs slug={slug} active="slots" />}
    >
      {!published && (
        <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-gold-400/25 bg-gold-400/[0.07] px-4 py-3 text-sm text-mist-200">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" />
          <span>
            Slots are decided after pre-registration closes on{' '}
            <strong className="font-semibold text-white">
              {event?.tournament?.deadline}
            </strong>
            . This page fills in once the committee publishes the split.
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
          {rows.length} universit{rows.length === 1 ? 'y' : 'ies'}
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

        {rows.length === 0 ? (
          <p className="border-t border-ink-700/70 p-10 text-center text-sm text-mist-400">
            No university matches that search.
          </p>
        ) : (
          <ul>
            {rows.map((u) => (
              <li
                key={u.short}
                className={`grid grid-cols-1 items-start gap-x-4 gap-y-1 border-t border-ink-700/70 px-3 py-3 transition hover:bg-white/[0.02] sm:items-center sm:py-2.5 ${COLS}`}
              >
                <div className="flex items-start justify-between gap-3 sm:block">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {u.name}
                    </p>
                    <p className={`text-[11px] font-bold uppercase tracking-wide ${accent.text}`}>
                      {u.short}
                    </p>
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
        N/A means slots for that university have not been decided yet — it does
        not mean zero. Teams from any listed university may pre-register now.
      </p>
    </EventSubPage>
  );
};

const SlotValue = ({ slots }) =>
  slots === null ? (
    <span className="rounded-md border border-ink-500 bg-ink-900/60 px-2 py-0.5 text-xs font-semibold text-mist-400">
      N/A
    </span>
  ) : (
    <span className="rounded-md border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-xs font-bold text-emerald-300">
      {slots}
    </span>
  );

export default SlotAllocations;
