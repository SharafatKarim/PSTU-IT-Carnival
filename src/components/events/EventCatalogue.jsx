'use client';

import Link from 'next/link';
import { ICON_MAP, ArrowRightIcon } from '@/components/landing/Icons';
import { EVENTS, tierOf } from '@/data/content';
import { getEventDetail } from '@/data/events';
import { getGame } from '@/data/gaming';
import { accentOf } from '@/lib/accents';

// ---------------------------------------------------------------------------
// The catalogue: every event, grouped by what it IS.
//
// /events used to render the landing page's <Lineup> verbatim — the same twelve
// events, in the same three readiness tiers, at a second URL. It added a hero
// and nothing else, so there was no reason to go there.
//
// This groups by category instead. A student who plays chess should not have to
// read three readiness tiers to find it; they pick by interest, and readiness
// becomes a badge on the card. The 6/6 split matches what the hero band already
// states and the family grouping /events/gaming already uses.
//
// The landing page keeps the readiness ledger, because "what can I enter today"
// is the right question there. Two surfaces, two questions.
// ---------------------------------------------------------------------------

const GROUPS = [
  {
    key: 'tech',
    label: 'Tech contests',
    note: 'Programming, data, security and building',
  },
  {
    key: 'gaming',
    label: 'Gaming arenas',
    note: 'Esports, board and speed',
  },
];

/* Readiness, demoted from an axis to a badge. Ordered so a card can be scanned
   without reading: gold only on the one thing that accepts entries. */
const STATUS = {
  open: {
    label: 'Open now',
    className: 'border-gold-400/40 bg-gold-400/10 text-gold-300',
  },
  published: {
    label: 'Rules published',
    className: 'border-aqua-400/30 bg-aqua-400/10 text-aqua-300',
  },
  announced: {
    label: 'Announced',
    className: 'border-white/10 bg-white/5 text-mist-400',
  },
};

const detailFor = (event) =>
  !event.slug
    ? null
    : event.kind === 'game'
      ? getGame(event.slug)
      : getEventDetail(event.slug);

/* Within a group, the events that tell you the most come first. */
const RANK = { open: 0, published: 1, announced: 2 };

const EventCard = ({ event }) => {
  const detail = detailFor(event);
  const tier = tierOf(event);
  const status = STATUS[tier];
  const accent = accentOf(detail?.accent);
  const Icon = ICON_MAP[event.icon] || ICON_MAP.code;
  const t = detail?.tournament;

  return (
    <Link
      href={event.href}
      className="group flex flex-col rounded-2xl border border-ink-600 bg-ink-800/40 p-4 sm:p-5 transition hover:border-ink-500 hover:bg-ink-800/70"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-ink-900/70 ${accent.border} ${accent.text}`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <span
          className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      <h3 className="mt-4 text-lg font-bold text-white">{event.name}</h3>
      <p className="mt-0.5 text-xs font-medium text-mist-400">{event.scope}</p>
      <p className="mt-2.5 line-clamp-2 flex-1 text-sm leading-relaxed text-mist-300">
        {event.blurb}
      </p>

      {/* The facts a card can honestly carry. Seven events have none of these,
          and they say so rather than showing an empty row. */}
      <div className="mt-4 border-t border-white/10 pt-3">
        {t ? (
          <p className="text-xs text-mist-400 tabular-nums">
            <span className="font-semibold text-mist-200">{t.date}</span>
            {t.entryFee && <> · {t.entryFee}</>}
          </p>
        ) : (
          <p className="text-xs text-mist-400">Date and format to be announced</p>
        )}
      </div>

      <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-mist-300 transition group-hover:text-white">
        {tier === 'open' ? 'Enter now' : 'View details'}
        <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
};

const EventCatalogue = () => (
  <div>
    {GROUPS.map((group) => {
      const events = EVENTS.filter((e) => e.category === group.key).sort(
        (a, b) => RANK[tierOf(a)] - RANK[tierOf(b)]
      );
      if (events.length === 0) return null;

      return (
        <section key={group.key} className="scroll-mt-20 [&+&]:mt-14" id={group.key}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-white/10 pb-3">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.22em] text-mist-300">
              {group.label}
              <span className="ml-2.5 font-medium text-mist-400 tabular-nums">
                {events.length}
              </span>
            </h2>
            <p className="text-xs text-mist-400">{group.note}</p>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      );
    })}
  </div>
);

export default EventCatalogue;
