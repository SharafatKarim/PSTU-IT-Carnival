'use client';

import Link from 'next/link';
import { EVENTS } from '@/data/content';
import {
  ICON_MAP,
  ArrowRightIcon,
  UsersIcon,
  TicketIcon,
  AlertIcon,
} from './Icons';
import { getEventDetail } from '@/data/events';
import { ROUTES } from '@/lib/routes';

const IconBox = ({ icon, muted }) => {
  const Icon = ICON_MAP[icon] || ICON_MAP.code;
  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
        muted
          ? 'bg-ink-700 text-mist-400 ring-1 ring-white/5'
          : 'bg-carnival text-white shadow-glow-grape'
      }`}
    >
      <Icon className="h-6 w-6" />
    </div>
  );
};

const ScopeBadge = ({ children }) => (
  <span className="inline-block rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-mist-300">
    {children}
  </span>
);

/* Full-width highlight for the one event that is open for registration.
   Its headline numbers come from the event's own detail data, so the card and
   the detail page can never drift apart. */
const FeaturedEvent = ({ event }) => {
  const detail = getEventDetail(event.id);
  const t = detail?.tournament;
  const facts = t
    ? [
        { icon: UsersIcon, value: t.slots, label: 'available' },
        { icon: TicketIcon, value: t.entryFee, label: 'at final registration' },
        { icon: AlertIcon, value: t.deadline, label: 'pre-registration deadline' },
      ]
    : [];

  return (
  <div className="relative overflow-hidden rounded-3xl border-2 border-gold-400/50 bg-ink-800/70 p-6 shadow-glow-gold sm:p-8">
    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold-400/10 blur-3xl" />
    <span className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full border border-aqua-400/30 bg-aqua-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-aqua-300">
      <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-aqua-400" />
      Registration Open
    </span>

    <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
      <IconBox icon={event.icon} />
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-2xl font-extrabold text-white">{event.name}</h3>
          <ScopeBadge>{event.scope}</ScopeBadge>
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mist-300">
          {event.blurb}
        </p>
        {facts.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            {facts.map((fact) => (
              <span
                key={fact.label}
                className="inline-flex items-center gap-2 text-xs text-mist-300"
              >
                <fact.icon className="h-4 w-4 shrink-0 text-gold-400" />
                <span className="font-semibold text-white">{fact.value}</span>
                {fact.label}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row">
        <Link
          href={event.href}
          aria-label={`View ${event.name} details`}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-ink-500 px-6 py-3 text-sm font-semibold text-mist-200 transition hover:bg-white/5 hover:text-white"
        >
          View Details
        </Link>
        <Link
          href={event.registerHref || event.href}
          aria-label={`${event.cta || 'Register'} for ${event.name}`}
          className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gold-400 px-6 py-3 text-sm font-bold text-ink-950 shadow-glow-gold transition hover:bg-gold-300"
        >
          {event.cta || 'Register'}
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  </div>
  );
};

/* Muted, non-interactive card for events that are not open yet. */
const ComingSoonCard = ({ event }) => (
  <div className="relative flex flex-col rounded-2xl border border-ink-600 bg-ink-800/40 p-5 transition hover:border-grape-500/40">
    <span className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-mist-400">
      Coming Soon
    </span>
    <IconBox icon={event.icon} muted />
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <h4 className="text-base font-bold text-mist-100">{event.name}</h4>
      <ScopeBadge>{event.scope}</ScopeBadge>
    </div>
    <p className="mt-2 flex-1 text-sm leading-relaxed text-mist-400">
      {event.blurb}
    </p>
    <p className="mt-4 text-sm font-medium text-mist-400">
      Registration opens later
    </p>
  </div>
);

/* Event that has its own page and open registration (the gaming tournaments). */
const LiveCard = ({ event }) => (
  <div className="relative flex flex-col rounded-2xl border border-ink-600 bg-ink-800/60 p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:border-grape-500/60 hover:shadow-glow-grape">
    <span
      className={`absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
        event.registerHref
          ? 'border-aqua-400/30 bg-aqua-400/10 text-aqua-300'
          : 'border-gold-400/40 bg-gold-400/10 text-gold-300'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 animate-pulse-glow rounded-full ${
          event.registerHref ? 'bg-aqua-400' : 'bg-gold-400'
        }`}
      />
      {event.registerHref ? 'Open' : 'Soon'}
    </span>
    <IconBox icon={event.icon} />
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <h4 className="text-base font-bold text-white">{event.name}</h4>
      <ScopeBadge>{event.scope}</ScopeBadge>
    </div>
    <p className="mt-2 flex-1 text-sm leading-relaxed text-mist-400">
      {event.blurb}
    </p>
    {/* Closed entries get one full-width primary instead of a live button
        beside a dead one — the detail page is the real destination. */}
    <div className="mt-4 flex gap-2">
      <Link
        href={event.href}
        aria-label={`View ${event.name} details`}
        className={
          event.registerHref
            ? 'flex-1 rounded-lg border border-ink-500 px-3 py-2 text-center text-sm font-semibold text-mist-200 transition hover:bg-white/5 hover:text-white'
            : 'w-full rounded-lg bg-gold-400 px-3 py-2 text-center text-sm font-bold text-ink-950 transition hover:bg-gold-300'
        }
      >
        {event.registerHref ? 'Details' : 'View Details'}
      </Link>
      {event.registerHref && (
        <Link
          href={event.registerHref}
          aria-label={`Register for ${event.name}`}
          className="flex-1 rounded-lg bg-gold-400 px-3 py-2 text-center text-sm font-bold text-ink-950 transition hover:bg-gold-300"
        >
          Register
        </Link>
      )}
    </div>
  </div>
);

const GroupHeading = ({ children, action }) => (
  <div className="mb-6 mt-14 flex items-center gap-4">
    <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-mist-300">
      {children}
    </h3>
    <span className="h-px flex-1 bg-white/10" />
    {action}
  </div>
);

/* `intro` is off on /events, where the page's own hero already carries the
   heading — the card grids below are the part that gets reused. */
const Events = ({ intro = true }) => {
  const featured = EVENTS.find((e) => e.status === 'open' && e.href);
  const isFeatured = (e) => featured && e.id === featured.id;
  const tech = EVENTS.filter((e) => e.category === 'tech' && !isFeatured(e));
  const gaming = EVENTS.filter((e) => e.category === 'gaming' && !isFeatured(e));

  return (
    <section id="events" className="scroll-mt-20 bg-ink-950/40 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4">
        {intro && (
          <div className="mx-auto mb-4 max-w-2xl text-center">
            <p className="text-gradient-brand text-xs font-bold uppercase tracking-[0.22em]">
              The Line-Up
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
              Eleven events. One carnival.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-mist-300">
              From the flagship programming contest to esports and board-game
              showdowns — pick your arena. IUPC pre-registration is open now;
              gaming entries and the rest of the line-up follow soon.
            </p>
          </div>
        )}

        {featured && (
          <div className="mt-10">
            <FeaturedEvent event={featured} />
          </div>
        )}

        <GroupHeading>Tech Competitions</GroupHeading>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {tech.map((event) => (
            <ComingSoonCard key={event.id} event={event} />
          ))}
        </div>

        <GroupHeading
          action={
            <Link
              href={ROUTES.gaming}
              className="group inline-flex shrink-0 items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-aqua-300 transition hover:text-aqua-200"
            >
              Gaming Fest
              <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          }
        >
          Gaming &amp; Fun
        </GroupHeading>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {gaming.map((event) =>
            event.href ? (
              <LiveCard key={event.id} event={event} />
            ) : (
              <ComingSoonCard key={event.id} event={event} />
            )
          )}
        </div>
      </div>
    </section>
  );
};

export default Events;
