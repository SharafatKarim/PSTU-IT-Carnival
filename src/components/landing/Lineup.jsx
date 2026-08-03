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
// Density is the ranking mechanic, not colour: the open event is a full row
// with a button, published events are rows, and announced events are chips in a
// grid. No count is written down here — EVENT_TIERS does the counting, so this
// comment cannot go stale the way the lede below it did.
// ---------------------------------------------------------------------------

/* Resolve an EVENTS entry against the data that actually knows its state. */
const detailFor = (event) => {
  if (!event.slug) return null;
  return event.kind === 'game' ? getGame(event.slug) : getEventDetail(event.slug);
};

const IconTile = ({ icon, accent, muted, small }) => {
  const Icon = ICON_MAP[icon] || ICON_MAP.code;
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-xl border ${
        small ? 'h-8 w-8' : 'h-10 w-10'
      } ${
        muted
          ? 'border-white/5 bg-white/[0.03] text-mist-500'
          : `bg-ink-900/70 ${accent.border} ${accent.text}`
      }`}
    >
      <Icon className={small ? 'h-4 w-4' : 'h-5 w-5'} />
    </span>
  );
};

/* The one event taking entries.

   It used to be a Published row with more padding, a hairline of gold down its
   left edge and a button bolted on the right — the same object as the four
   below it, only taller. It is not the same object: it is the one thing on the
   page a visitor can act on today.

   So it is a card, and it borrows the treatment the hero's open panel already
   established: a gold-tinted border and a glow. The run-on fact line becomes
   three labelled cells, because "45 teams · ৳3,000 per team at final
   registration · closes 31 July 2026" is three facts pretending to be a
   sentence. */
const OpenRow = ({ event, detail }) => {
  const accent = accentOf(detail?.accent);
  const t = detail?.tournament;

  const facts = t
    ? [
        { label: 'Team slots', value: t.slots },
        { label: 'At final registration', value: t.entryFee },
        { label: 'Entries close', value: t.deadline },
      ].filter((f) => f.value)
    : [];

  return (
    <div className="rounded-2xl border border-gold-400/30 bg-ink-900/40 p-5 shadow-glow-gold sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-8">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-4">
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
              <p className="mt-1.5 max-w-[62ch] text-sm leading-relaxed text-mist-300">
                {event.blurb}
              </p>
            </div>
          </div>

          {facts.length > 0 && (
            <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-white/10 pt-4 sm:grid-cols-3">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-[11px] uppercase tracking-wide text-mist-400">
                    {fact.label}
                  </dt>
                  <dd className="mt-0.5 text-sm font-semibold text-white tabular-nums">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        {/* Full-width on a phone, a fixed column beside the facts on desktop —
            the button was competing with a 62ch paragraph for the same row. */}
        <div className="flex shrink-0 flex-col gap-2.5 lg:w-48 lg:self-center">
          <Link
            href={event.registerHref || event.href}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold-400 px-5 py-3 text-sm font-bold text-ink-950 shadow-glow-gold transition hover:bg-gold-300"
          >
            {event.cta || 'Register'}
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href={event.href}
            className="inline-flex w-full items-center justify-center rounded-xl border border-ink-500 px-5 py-2.5 text-sm font-semibold text-mist-200 transition hover:bg-white/5 hover:text-white"
          >
            Details
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
          {/* Carries the half of this tier's meaning the group note cannot. */}
          {detail?.registrationClosed && (
            <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-mist-300">
              Registration closed
            </span>
          )}
        </span>
        <span className="mt-0.5 block line-clamp-2 text-sm text-mist-400">
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

/* Announced only — a chip, not a row.

   Seven of the twelve events are here, and as full-width rows they were 58% of
   the section: seven identical bands whose only content was a sentence that
   said nothing had been decided. A chip carries the same information a visitor
   can act on — the name, the scope, and a way in — in a fifth of the height,
   and the grid makes them read as one set rather than seven disappointments.
   The blurb is on the event's own page, which is one tap away. */
const AnnouncedChip = ({ event }) => {
  const body = (
    <>
      <IconTile icon={event.icon} muted small />
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-mist-200">
          {event.name}
        </span>
        <span className="block truncate text-xs text-mist-400">
          {event.scope}
        </span>
      </span>
    </>
  );

  const shell =
    'flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5';

  /* Linked only if the event actually has a page — an unlinked chip is still
     valid for anything added to the data before its route exists. */
  return event.href ? (
    <Link
      href={event.href}
      className={`${shell} transition hover:border-white/20 hover:bg-white/[0.05]`}
    >
      {body}
    </Link>
  ) : (
    <div className={shell}>{body}</div>
  );
};

const Tier = ({ label, note, children }) => (
  <section className="mt-10 first:mt-0">
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
        <Tier label="Open now">
          {grouped.open.map((event) => (
            <OpenRow key={event.id} event={event} detail={detailFor(event)} />
          ))}
        </Tier>
      )}

      {grouped.published.length > 0 && (
        /* This tier holds two different situations — entries not open yet, and
           entries that have been and gone. The group note stays neutral because
           it covers both; each row says which one it is. */
        <Tier label="Published" note="Entries not open">
          {grouped.published.map((event) => (
            <PublishedRow key={event.id} event={event} detail={detailFor(event)} />
          ))}
        </Tier>
      )}

      {grouped.announced.length > 0 && (
        <Tier label="Announced" note="Dated later">
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {grouped.announced.map((event) => (
              <AnnouncedChip key={event.id} event={event} />
            ))}
          </div>
        </Tier>
      )}
    </div>
  );
};

export default Lineup;
