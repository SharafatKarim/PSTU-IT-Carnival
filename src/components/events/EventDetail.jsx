'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Faq from '@/components/landing/Faq';
import HeadlineStrip from '@/components/ui/HeadlineStrip';
import TournamentInfo from '@/components/gaming/TournamentInfo';
import RulesSection from '@/components/gaming/RulesSection';
import CoordinatorContact from '@/components/gaming/CoordinatorContact';
import { accentOf } from '@/lib/accents';
import {
  ICON_MAP,
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  CheckIcon,
} from '@/components/landing/Icons';
import { getEventDetail } from '@/data/events';
import { ROUTES, eventDetailNav } from '@/lib/routes';

/* "Entries have closed" as opposed to "entries have not opened yet" — the two
   look identical through registrationOpen alone, and telling a team to wait for
   a form that has already shut is the one thing this page must not do.
 *
 * Two signals, because they arrived from two directions and both are in use:
 *
 *   registrationClosed: true   stated outright (IUPC, whose stage also moved to
 *                              'published' so the landing ledger stops filing it
 *                              under "Open now").
 *   stage: 'open' + the form off
 *                              closed by implication — the event is still in its
 *                              open phase, the form is simply switched off
 *                              (hackathon).
 *
 * Either one means the same thing to a visitor, so both resolve here rather than
 * at each of the three places that ask. */
const isRegistrationClosed = (event) =>
  event.registrationOpen === false &&
  (event.registrationClosed === true || event.stage === 'open');

/* Which events have a public directory to link at. Listed once because these
   links belong in BOTH hero branches: they were spelled out in the open branch
   only, so closing IUPC silently took its teams and slots pages off the page.
   Those pages stay live after entries shut — that is exactly when a team wants
   to check it is on the list and which slot it drew. */
const DIRECTORY_SLUGS = {
  teams: ['iupc', 'hackathon', 'datathon', 'project-showcase'],
  slots: ['iupc'],
};

const DirectoryLinks = ({ event }) => (
  <>
    {DIRECTORY_SLUGS.teams.includes(event.slug) && (
      <Link href={ROUTES.eventTeams(event.slug)} className={SECONDARY_CTA}>
        View Teams
      </Link>
    )}
    {DIRECTORY_SLUGS.slots.includes(event.slug) && (
      <Link href={ROUTES.eventSlots(event.slug)} className={SECONDARY_CTA}>
        Slot Allocations
      </Link>
    )}
  </>
);

/* The same notice the #register card renders, cut down to a strip and lifted
   into the hero.
 *
 * That card is five screens down, below the rules — fine for a detail, wrong
 * for a deadline. A team arriving at this page has one thing left to do and a
 * date to do it by, so the announcement has to be above the fold with the
 * action attached, and the card further down stays as the full version for
 * anyone who reads the page properly.
 *
 * Same object drives both, so the two cannot end up quoting different dates. */
const HeroNotice = ({ event }) => {
  const notice = event.registrationClosedNotice;
  if (!notice) return null;

  const hasDirectory = DIRECTORY_SLUGS.teams.includes(event.slug);

  return (
    <div className="mx-auto mt-6 flex w-full max-w-3xl flex-col items-center gap-4 rounded-2xl border border-gold-400/40 bg-gold-400/10 px-5 py-4 backdrop-blur sm:flex-row sm:gap-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold-400/40 bg-ink-950/50 text-gold-300">
        <ClockIcon className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1 text-center sm:text-left">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gold-300">
          {notice.eyebrow}
        </p>
        <p className="mt-1 text-sm font-bold leading-snug text-white">
          {notice.title}
        </p>
        {notice.deadline && (
          <p className="mt-1 text-sm font-bold text-red-300">{notice.deadline}</p>
        )}
      </div>

      {hasDirectory && (
        <Link
          href={ROUTES.eventTeams(event.slug)}
          className="group inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-gold-400 px-5 py-3 text-sm font-bold text-ink-950 shadow-glow-gold transition hover:bg-gold-300 sm:w-auto"
        >
          Pay now
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
};

/* Shared by every non-primary hero button, so they stay visually identical. */
const SECONDARY_CTA =
  'inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-grape-400/40 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:border-grape-400/70 hover:bg-white/10 sm:flex-none';

const Section = ({ id, eyebrow, title, subtitle, children, className = '' }) => (
  <section id={id} className={`scroll-mt-20 py-16 sm:py-20 ${className}`}>
    <div className="mx-auto max-w-6xl px-4">
      {(eyebrow || title) && (
        <div className="mx-auto mb-12 max-w-2xl text-center">
          {eyebrow && (
            <p className="text-gradient-brand text-xs font-bold uppercase tracking-[0.22em]">
              {eyebrow}
            </p>
          )}
          {title && (
            <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-4 text-base leading-relaxed text-mist-300">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  </section>
);

const Hero = ({ event }) => {
  /* icon না থাকলে বা 'none' থাকলে Icon null হবে */
  const Icon = event.icon && event.icon !== 'none' ? ICON_MAP[event.icon] : null;
  const a = accentOf(event.accent);
  const t = event.tournament;

  const quickFacts = [
    { icon: CalendarIcon, value: t.date },
    { icon: ClockIcon, value: t.time },
    { icon: MapPinIcon, value: t.venue },
  ];

  const headline = [
    t.prizePool && { label: 'Prize Pool', value: t.prizePool, accent: true },
    t.entryFee && { label: 'Entry Fee', value: t.entryShort || t.entryFee },
    { label: 'Team Size', value: t.teamSizeShort || t.teamSize },
    { label: 'Slots', value: t.slots },
    { label: 'Closes', value: t.deadline },
  ].filter(Boolean);

  const registrationOpen = event.registrationOpen !== false;
  const registrationClosed = isRegistrationClosed(event);
  const hasCover = Boolean(event.cover);

  return (
    <section className="relative overflow-hidden bg-ink-950">
      <div className="absolute inset-0 bg-hero opacity-80" />
      <div className="absolute inset-0 bg-grid bg-[size:46px_46px] opacity-50" />
      <div className={`absolute -right-24 -top-10 h-80 w-80 rounded-full blur-3xl ${a.blob}`} />
      <div className="absolute -left-24 top-32 h-72 w-72 rounded-full bg-grape-600/20 blur-3xl" />

      {hasCover && (
        <div className="relative mx-auto mt-5 w-full max-w-6xl px-4 sm:mt-6">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-ink-600 bg-ink-900 shadow-card">
            <Image
              src={event.cover}
              alt={`${event.name} cover`}
              fill
              priority
              sizes="(max-width: 1152px) 100vw, 1152px"
              className="object-cover"
            />

            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-ink-950/90 via-ink-950/55 to-transparent"
            />

            <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 sm:p-5">
              <div className="flex min-w-0 items-center gap-2.5 sm:gap-3.5">
                {/* Icon থাকলে শুধু তখনই দেখাবে */}
                {Icon && (
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-ink-950/70 backdrop-blur sm:h-14 sm:w-14 sm:rounded-2xl ${a.border} ${a.text}`}
                  >
                    <Icon className="h-5 w-5 sm:h-7 sm:w-7" />
                  </span>
                )}
                <span className="min-w-0">
                  <h1 className="truncate text-xl font-extrabold leading-tight tracking-tight text-white drop-shadow-lg sm:text-3xl lg:text-4xl">
                    {event.name}
                  </h1>
                  <p className="truncate text-[10px] font-medium text-mist-300 drop-shadow sm:text-sm">
                    {event.fullName}
                  </p>
                </span>
              </div>

              <dl className="hidden shrink-0 flex-col items-end gap-1 text-right sm:flex">
                {quickFacts.map((fact, i) => (
                  <dd
                    key={i}
                    className="inline-flex items-center gap-2 text-xs font-medium text-mist-100 drop-shadow sm:text-sm"
                  >
                    {fact.value}
                    <fact.icon className={`h-4 w-4 shrink-0 ${a.text}`} />
                  </dd>
                ))}
              </dl>
            </div>
          </div>
        </div>
      )}

      <div className="relative mx-auto flex w-full max-w-6xl flex-col px-4 pb-10 pt-6 sm:pb-12 sm:pt-8">
        {!hasCover && (
          <div className="mb-5 flex items-center gap-4">
            {/* Icon থাকলে শুধু তখনই দেখাবে */}
            {Icon && (
              <span
                className={`flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-3xl border bg-ink-900/70 ${a.border} ${a.glow} ${a.text}`}
              >
                <Icon className="h-9 w-9" />
              </span>
            )}
            <span>
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                {event.name}
              </h1>
              <p className="mt-1 text-sm font-medium text-mist-400">{event.fullName}</p>
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {registrationOpen ? (
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-widest ${a.border} ${a.bgSoft} ${a.text}`}
            >
              <span className={`h-1.5 w-1.5 animate-pulse-glow rounded-full ${a.dot}`} />
              Pre-Registration Open
            </span>
          ) : registrationClosed ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-red-400">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              Registration Closed
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-gold-300">
              <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-gold-400" />
              Registration Opens Soon
            </span>
          )}
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-mist-300">
            {event.scope}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-mist-300">
            {event.mode}
          </span>
        </div>

        <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-mist-300">
          {event.tagline}
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-mist-200 sm:hidden">
          {quickFacts.map((fact, i) => (
            <span key={i} className="inline-flex items-center gap-1.5">
              <fact.icon className="h-4 w-4 text-mist-400" />
              {fact.value}
            </span>
          ))}
        </div>

        <div
          className={`mt-8 grid gap-3 ${
            registrationOpen
              ? event.slug === 'iupc'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                : (event.slug === 'hackathon' || event.slug === 'datathon' || event.slug === 'project-showcase')
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1 sm:grid-cols-2'
              : registrationClosed
                ? event.slug === 'hackathon'
                  ? 'mx-auto w-full max-w-3xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                  : (event.slug === 'datathon' || event.slug === 'project-showcase')
                    ? 'mx-auto w-full max-w-xl grid-cols-1 sm:grid-cols-3'
                    : 'mx-auto w-full max-w-md grid-cols-1 sm:grid-cols-2'
                : 'mx-auto w-full max-w-xs grid-cols-1'
          }`}
        >
          {registrationOpen ? (
            <>
              <Link
                href={ROUTES.eventRegister(event.slug)}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gold-400 px-5 py-3.5 text-sm font-bold text-ink-950 shadow-glow-gold transition hover:bg-gold-300"
              >
                Register
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <DirectoryLinks event={event} />
              <a href="#rules" className={SECONDARY_CTA}>
                Read the Rules
              </a>
            </>
          ) : registrationClosed ? (
            <>
              <button
                disabled
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-5 py-3.5 text-sm font-bold text-mist-400 cursor-not-allowed"
              >
                Registration Closed
              </button>
              {event.slug === 'hackathon' && (
                <button
                  disabled
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-5 py-3.5 text-sm font-bold text-mist-400 cursor-not-allowed"
                >
                  Submission Closed
                </button>
              )}
              <DirectoryLinks event={event} />
              <a href="#rules" className={SECONDARY_CTA}>
                Read the Rules
              </a>
            </>
          ) : (
            <a
              href="#rules"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gold-400 px-5 py-3.5 text-sm font-bold text-ink-950 shadow-glow-gold transition hover:bg-gold-300"
            >
              Read the Rules
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          )}
        </div>

        {registrationClosed && <HeroNotice event={event} />}

        <p className="mt-5 text-center text-xs text-mist-400">{event.heroNote}</p>
      </div>

      <HeadlineStrip
        items={headline.map((item) => ({
          ...item,
          accentClass: item.accent ? a.text : undefined,
        }))}
      />
    </section>
  );
};

const SponsorBanner = ({ sponsor, accent }) => {
  if (!sponsor) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <div className={`rounded-3xl border border-white/10 bg-ink-900/80 p-6 sm:p-8 ${accent.border}`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-mist-500">
              Sponsor
            </p>
            <h2 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">
              {sponsor.title || 'Sponsored by'}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-mist-300">
              {sponsor.description || 'This event is supported by our sponsor. Visit their site for more details.'}
            </p>
          </div>

          {sponsor.website && (
            <a
              href={sponsor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              {sponsor.cta || 'Visit Sponsor'}
              <ArrowRightIcon className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

const RegisterCta = ({ event }) => {
  const a = accentOf(event.accent);
  const r = event.registration;

  return (
    <div className="mx-auto max-w-4xl">
      {r.process?.length > 0 && (
        <ol className="mb-6 grid gap-4 sm:grid-cols-3">
          {r.process.map((step, i) => (
            <li
              key={step}
              className="rounded-2xl border border-ink-600 bg-ink-800/60 p-5 shadow-card"
            >
              <span
                className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold ${a.bgSoft} ${a.text}`}
              >
                {i + 1}
              </span>
              <p className="mt-3 text-sm leading-relaxed text-mist-300">{step}</p>
            </li>
          ))}
        </ol>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-ink-600 bg-ink-800/60 p-6 shadow-card sm:p-7">
            <h3 className="text-base font-bold text-white">
              Have this ready before you start
            </h3>
            <ul className="mt-4 space-y-3">
              {r.checklist.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${a.bgSoft} ${a.text}`}
                  >
                    <CheckIcon className="h-3 w-3" />
                  </span>
                  <span className="text-sm leading-relaxed text-mist-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="relative overflow-hidden rounded-2xl bg-carnival p-7 text-white shadow-glow-grape">
            <div className="absolute inset-0 bg-grid bg-[size:30px_30px] opacity-30" />
            <div className="relative">
              <h3 className="text-xl font-bold">Ready to register?</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/85">
                The form takes a few minutes — team and coach details first, then
                your three members, then a review before you submit.
              </p>
              <Link
                href={ROUTES.eventRegister(event.slug)}
                className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-gold-400 px-6 py-3 text-sm font-bold text-ink-950 shadow-md transition hover:bg-gold-300"
              >
                {r.cta}
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <p className="mt-4 text-xs text-white/70">{r.note}</p>
              <p className="mt-1 text-xs text-white/70">
                Registration closes {event.tournament.deadline}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* The card in the #register section once entries have shut.
 *
 * "Pre-registration has closed" is the right thing to say right up until
 * something else falls due, and then it is the least useful sentence on the
 * page — a team arriving to pay does not need to be told the form it already
 * filled in is gone. So an event may replace the copy with
 * registrationClosedNotice (IUPC does, to announce the entry-fee deadline) and
 * everything without one falls through to the generic text unchanged. */
const ClosedRegistrationCard = ({ event }) => {
  const notice = event.registrationClosedNotice;

  if (!notice) {

    return (
      <div className="mx-auto max-w-2xl text-center rounded-2xl border border-red-500/20 bg-red-950/10 p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-widest text-red-400">Registration Closed</p>
        <h3 className="mt-3 text-lg font-bold text-white">Pre-registration has closed</h3>
        <p className="mt-2 text-sm leading-relaxed text-mist-300">
          Pre-registration for {event.name} is now closed. The final shortlist of teams will be published soon.
        </p>
      </div>
    );
  }

  const a = accentOf(event.accent);
  /* The label is only worth a button if the page it points at exists. */
  const linkToDirectory =
    notice.ctaLabel && DIRECTORY_SLUGS.teams.includes(event.slug);

  return (
    <div
      className={`mx-auto max-w-2xl rounded-2xl border p-8 text-center shadow-card ${a.border} ${a.bgFaint}`}
    >
      <p className={`text-sm font-semibold uppercase tracking-widest ${a.text}`}>
        {notice.eyebrow}
      </p>
      <h3 className="mt-3 text-lg font-bold text-white">{notice.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-mist-300">{notice.body}</p>

      {/* Red rather than the event accent: this is the one line on the card
          that costs a team its slot if they read past it. */}
      {notice.deadline && (
        <p className="mt-6 inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-2.5 text-sm font-bold text-red-300">
          <ClockIcon className="h-4 w-4 shrink-0" />
          {notice.deadline}
        </p>
      )}

      {linkToDirectory && (
        <div className="mt-6">
          <Link
            href={ROUTES.eventTeams(event.slug)}
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gold-400 px-5 py-3.5 text-sm font-bold text-ink-950 shadow-glow-gold transition hover:bg-gold-300"
          >
            {notice.ctaLabel}
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      )}
    </div>
  );
};

const EmbeddedTeamsList = ({ slug }) => {
  const [search, setSearch] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const query = new URLSearchParams({ limit: '100' });
        if (search) query.set('search', search);
        const res = await fetch(`/api/v1/events/${slug}/registrations?${query}`);
        if (!res.ok) throw new Error('Could not load teams');
        const data = await res.json();
        if (active) setResult(data.data);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    const debounceId = setTimeout(load, 300);
    return () => {
      active = false;
      clearTimeout(debounceId);
    };
  }, [slug, search]);

  const teams = result?.teams ?? [];

  return (
    <div className="mx-auto max-w-4xl mt-12 border-t border-white/10 pt-10">
      <h3 className="text-xl font-bold text-center text-white mb-6">{slug === 'hackathon' ? 'Selected Teams' : 'Registered Teams'}</h3>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={slug === 'hackathon' ? 'Search selected teams...' : 'Search registered teams...'}
          className="flex-1 rounded-xl border border-ink-600 bg-ink-900/70 px-4 py-2.5 text-sm text-white placeholder-mist-500 outline-none transition focus:border-magenta-500 focus:ring-2 focus:ring-magenta-500/30"
        />
        <p className="text-sm text-mist-400">
          {loading ? 'Loading…' : `${result?.total ?? 0} team(s)`}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-ink-600 bg-ink-800/50">
        {error ? (
          <p className="p-6 text-sm text-red-300 text-center">{error}</p>
        ) : loading && !result ? (
          <p className="p-10 text-center text-sm text-mist-400">Loading teams…</p>
        ) : teams.length === 0 ? (
          <p className="p-10 text-center text-sm text-mist-400">No teams found</p>
        ) : (
          <div className="divide-y divide-ink-700/50">
            {teams.map((t) => (
              <div key={t.registrationId} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition">
                <div>
                  <h4 className="font-bold text-white text-base">{t.teamName}</h4>
                  <p className="text-xs text-magenta-400 mt-0.5">{t.university}</p>
                </div>
                <div className="text-xs text-mist-400">
                  <span className="font-semibold text-mist-300">Members:</span>{' '}
                  {t.players?.map((p) => p.name).join(', ') || 'N/A'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const EventDetail = ({ slug }) => {
  const event = getEventDetail(slug);
  if (!event) return null;

  const registrationOpen = event.registrationOpen !== false;
  const registrationClosed = isRegistrationClosed(event);

  return (
    <div className="min-h-screen">
      <Navbar
        links={eventDetailNav}
        homeHref={ROUTES.home}
        ctaHref={registrationOpen ? ROUTES.volunteer : '#contact'}
        ctaLabel={registrationOpen ? 'Register as Volunteer' : 'Contact Support'}
      />
      <main>
        <Hero event={event} />
        <SponsorBanner sponsor={event.sponsor} accent={accentOf(event.accent)} />

        <Section
          id="info"
          eyebrow="Contest Info"
          title={`${event.name} at a glance`}
          subtitle={event.blurb}
        >
          <TournamentInfo game={event} />
        </Section>

        <Section
          id="rules"
          eyebrow="Rules & Regulations"
          title="Know before you compete"
          subtitle="Read these carefully — registering means your whole team accepts them."
          className="bg-ink-950/40"
        >
          <RulesSection game={event} />
        </Section>

        <Section
          id="register"
          eyebrow="Registration"
          title={registrationOpen ? `Pre-register for ${event.name}` : `Registration for ${event.name}`}
          subtitle={registrationOpen ? "Registration happens on a separate page so you can fill it in one sitting." : "Registration details for this event."}
        >
          {registrationOpen ? (
            <RegisterCta event={event} />
          ) : registrationClosed ? (
            <>
              <ClosedRegistrationCard event={event} />
              {event.slug === 'hackathon' && <EmbeddedTeamsList slug={event.slug} />}
            </>
          ) : (
            <div className="mx-auto max-w-2xl text-center rounded-2xl border border-ink-600 bg-ink-800/40 p-8 shadow-card">
              <p className="text-sm font-semibold uppercase tracking-widest text-gold-400">Registration Opens Later</p>
              <h3 className="mt-3 text-lg font-bold text-white">Online registration is not open yet</h3>
              <p className="mt-2 text-sm leading-relaxed text-mist-300">
                Pre-registration for the {event.name} is not open on this platform. Please prepare your team according to the rules and contact the coordinators for queries.
              </p>
            </div>
          )}
        </Section>

        <Section
          id="faq"
          eyebrow="FAQ"
          title="Questions, answered"
          subtitle={`The things ${event.name} teams ask us most.`}
          className="bg-ink-950/40"
        >
          <div className="mx-auto max-w-3xl">
            <Faq items={event.faqs} />
          </div>
        </Section>

        {/* Skipped entirely when nobody has been named yet. This used to read
            `event.coordinators.length` unguarded, which crashed the BUILD for
            any event without the array — an empty contact section is bad, but
            a page that cannot be generated is worse. */}
        {event.coordinators?.length > 0 && (
        <Section
          id="contact"
          eyebrow="Coordinator Contact"
          title="Still need help?"
          subtitle={
            event.coordinators.length > 1
              ? 'Reach the people running this contest directly.'
              : 'Reach the coordinator running this contest directly.'
          }
        >
          <div className="mx-auto max-w-4xl">
            <CoordinatorContact game={event} />
          </div>
        </Section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default EventDetail;