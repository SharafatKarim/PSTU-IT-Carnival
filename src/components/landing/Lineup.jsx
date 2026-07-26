'use client';

import Link from 'next/link';
import { ICON_MAP, ArrowRightIcon } from './Icons';
import Countdown from './Countdown';
import { EVENT_TIERS } from '@/data/content';
import { getEventDetail } from '@/data/events';
import { getGame } from '@/data/gaming';
import { accentOf } from '@/lib/accents';

// ---------------------------------------------------------------------------
// The line-up, as a ledger rather than a wall of cards.
//
// Every event used to render as a bordered card, most of which apologised in
// two different ways. They are now rows in three tiers, and the tier comes from
// the `stage` field in events.js / gaming.js — not from the hand-written
// `status` string, which drifts. routes.js warns in development when the two
// disagree.
//
// Density is the ranking mechanic, not colour: py-5 open, py-4 published, py-3
// announced. No count is written down here — EVENT_TIERS does the counting, so
// this comment cannot go stale the way the lede below it did.
// ---------------------------------------------------------------------------

/* Resolve an EVENTS entry against the data that actually knows its state. */
const detailFor = (event) => {
  if (!event.slug) return null;
  return event.kind === 'game' ? getGame(event.slug) : getEventDetail(event.slug);
};

const IconTile = ({ icon, accent, muted }) => {
  const Icon = ICON_MAP[icon] || ICON_MAP.code;
  return (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
        muted
          ? 'border-white/5 bg-white/[0.03] text-mist-500'
          : `bg-ink-900/70 ${accent.border} ${accent.text}`
      }`}
    >
      <Icon className="h-5 w-5" />
    </span>
  );
};

/* The one event taking entries. The only row with a button. */
const OpenRow = ({ event, detail }) => {
  const accent = accentOf(detail?.accent);
  const t = detail?.tournament;

  return (
    <div className="border-t border-white/10 first:border-t-0">
      <div className="relative flex flex-col gap-4 py-5 pl-5 sm:flex-row sm:items-center sm:gap-6">
        <span
          aria-hidden="true"
          className="absolute inset-y-4 left-0 w-0.5 rounded-full bg-gold-400"
        />
        <IconTile icon={event.icon} accent={accent} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <Link
              href={event.href}
              className="text-lg font-bold text-white transition hover:text-gold-300"
            >
              {event.name}
            </Link>
            <span className="text-xs text-mist-400">{event.scope}</span>
            {t?.deadline && <Countdown date={t.deadline} />}
          </div>
          <p className="mt-1 max-w-[62ch] text-sm leading-relaxed text-mist-400">
            {event.blurb}
          </p>
          {t && (
            <p className="mt-2 text-xs text-mist-400 tabular-nums">
              <span className="text-mist-200">{t.slots}</span> ·{' '}
              <span className="text-mist-200">{t.entryFee}</span> at final
              registration · closes {t.deadline}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Link
            href={event.href}
            className="text-sm font-semibold text-mist-300 transition hover:text-white"
          >
            Details
          </Link>
          <Link
            href={event.registerHref || event.href}
            className="inline-flex items-center gap-2 rounded-lg bg-gold-400 px-5 py-2.5 text-sm font-bold text-ink-950 shadow-glow-gold transition hover:bg-gold-300"
          >
            {event.cta || 'Register'}
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

/* Published: full rules, dates and venue, entries not open. The whole row is
   the link — no button, because there is nothing to submit. */
const PublishedRow = ({ event, detail }) => {
  const accent = accentOf(detail?.accent);
  const t = detail?.tournament;

  return (
    <Link
      href={event.href}
      className="group flex items-center gap-4 border-t border-white/10 py-4 transition first:border-t-0 hover:bg-white/[0.03]"
    >
      <IconTile icon={event.icon} accent={accent} />

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-bold text-white">{event.name}</span>
          <span className="text-xs text-mist-400">{event.scope}</span>
        </span>
        <span className="mt-0.5 block truncate text-sm text-mist-400">
          {event.blurb}
        </span>
        {/* The date is the whole point of this tier, so it stays on narrow
            screens where the right-hand column cannot. */}
        {t && (
          <span className="mt-1 block text-xs text-mist-400 tabular-nums sm:hidden">
            {t.date} · {t.entryFee}
          </span>
        )}
      </span>

      {t && (
        <span className="hidden shrink-0 text-right sm:block">
          <span className="block text-sm font-semibold text-white tabular-nums">
            {t.date}
          </span>
          <span className="block text-xs text-mist-400 tabular-nums">
            {t.entryFee}
          </span>
        </span>
      )}

      <ArrowRightIcon className="h-4 w-4 shrink-0 text-mist-500 transition-transform group-hover:translate-x-0.5 group-hover:text-mist-300" />
    </Link>
  );
};

/* Announced only. No badge, no button, no chevron — the tier label above says
   it once, and repeating it on every row is what made the old grid a wall. */
const AnnouncedRow = ({ event }) => {
  const body = (
    <>
      <IconTile icon={event.icon} muted />
      <span className="min-w-0 flex-1">
        <span className="font-semibold text-mist-200">{event.name}</span>
        <span className="ml-3 text-xs text-mist-400">{event.scope}</span>
        <span className="mt-0.5 block truncate text-sm text-mist-400">
          {event.blurb}
        </span>
      </span>
    </>
  );

  /* Linked only if the event actually has a page — an unlinked row is still
     valid for anything added to the data before its route exists. */
  return event.href ? (
    <Link
      href={event.href}
      className="group flex items-center gap-4 border-t border-white/10 py-3 transition first:border-t-0 hover:bg-white/[0.03]"
    >
      {body}
      <ArrowRightIcon className="h-4 w-4 shrink-0 text-mist-500 transition-transform group-hover:translate-x-0.5 group-hover:text-mist-300" />
    </Link>
  ) : (
    <div className="flex items-center gap-4 border-t border-white/10 py-3 first:border-t-0">
      {body}
    </div>
  );
};

const Tier = ({ label, note, children }) => (
  <section className="mt-12 first:mt-0">
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-white/10 pb-3">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.22em] text-mist-300">
        {label}
      </h3>
      {note && <p className="text-xs text-mist-400">{note}</p>}
    </div>
    <div>{children}</div>
  </section>
);

const Lineup = () => {
  /* Grouped in content.js, beside the lede that counts the same tiers. */
  const grouped = EVENT_TIERS;

  return (
    <div>
      {grouped.open.length > 0 && (
        <Tier label="Open now" note="Taking entries">
          {grouped.open.map((event) => (
            <OpenRow key={event.id} event={event} detail={detailFor(event)} />
          ))}
        </Tier>
      )}

      {grouped.published.length > 0 && (
        <Tier
          label="Published"
          note="Format, rules and prizes are final — entries have not opened yet"
        >
          {grouped.published.map((event) => (
            <PublishedRow key={event.id} event={event} detail={detailFor(event)} />
          ))}
        </Tier>
      )}

      {grouped.announced.length > 0 && (
        <Tier label="Announced" note="Details to follow">
          {grouped.announced.map((event) => (
            <AnnouncedRow key={event.id} event={event} />
          ))}
        </Tier>
      )}
    </div>
  );
};

export default Lineup;
