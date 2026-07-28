'use client';

import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import {
  ICON_MAP,
  ArrowLeftIcon,
  ArrowRightIcon,
  ClockIcon,
  CalendarIcon,
  MapPinIcon,
} from '@/components/landing/Icons';
import { EVENT } from '@/data/content';
import { getEventDetail } from '@/data/events';
import { getGame } from '@/data/gaming';
import { ROUTES } from '@/lib/routes';
import { accentOf } from '@/lib/accents';

// ---------------------------------------------------------------------------
// The page for an event that has been announced and nothing more.
//
// Most events have a name, a category and a sentence — no date,
// fee, format, rules or coordinator. Rendering them through EventDetail would
// mean inventing all of that, so they get this instead: everything that is
// actually known, an explicit statement that the rest is not decided, and a
// route out rather than a dead end.
//
// Deliberately not a full-viewport hero. There is roughly a screen of real
// content here; a 100dvh hero would just be a screen of empty gradient.
//
// When the details land, fill in the data entry and switch `stage` to
// 'published' — the route swaps to EventDetail on its own.
// ---------------------------------------------------------------------------

const AnnouncedEvent = ({ slug, kind = 'event' }) => {
  const event = kind === 'game' ? getGame(slug) : getEventDetail(slug);
  if (!event) return null;

  const a = accentOf(event.accent);
  const Icon = ICON_MAP[event.icon] || ICON_MAP.code;
  const backHref = kind === 'game' ? ROUTES.gaming : ROUTES.events;
  const backLabel = kind === 'game' ? 'All gaming events' : 'All carnival events';

  /* Only what the carnival as a whole has committed to. Nothing here is
     specific to this event, and it does not pretend to be. */
  const known = [
    { icon: CalendarIcon, label: 'Carnival dates', value: EVENT.date },
    { icon: MapPinIcon, label: 'Venue', value: EVENT.venue },
    { icon: ClockIcon, label: 'This event', value: 'Date to be announced' },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar
        links={[
          { label: 'Home', href: ROUTES.home },
          { label: 'All Events', href: ROUTES.events },
          { label: 'Gaming', href: ROUTES.gaming },
        ]}
        homeHref={ROUTES.home}
        ctaHref={ROUTES.volunteer}
        ctaLabel="Register as Volunteer"
      />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-ink-950">
          <div className="absolute inset-0 bg-hero opacity-80" />
          <div className="absolute inset-0 bg-grid bg-[size:46px_46px] opacity-50" />
          <div className={`absolute -right-24 -top-10 h-72 w-72 rounded-full blur-3xl ${a.blob}`} />

          <div className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:pb-20">
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-mist-300 transition hover:text-white"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              {backLabel}
            </Link>

            <div className="mt-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
              <div
                className={`flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-3xl border bg-ink-900/70 backdrop-blur ${a.border} ${a.glow} ${a.text}`}
              >
                <Icon className="h-9 w-9" />
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-mist-300">
                    Announced
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-mist-400">
                    {event.scope}
                  </span>
                  {event.mode && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-mist-400">
                      {event.mode}
                    </span>
                  )}
                </div>

                <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                  {event.name}
                </h1>
                {event.fullName && event.fullName !== event.name && (
                  <p className="mt-1 text-sm font-medium text-mist-400">
                    {event.fullName}
                  </p>
                )}
                <p className="mt-3 max-w-[62ch] text-base leading-relaxed text-mist-300">
                  {event.tagline}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-7">
                <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  What this event is
                </h2>
                <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-mist-300">
                  {event.blurb}
                </p>

                <dl className="mt-8 divide-y divide-white/10 border-y border-white/10">
                  {known.map((row) => (
                    <div key={row.label} className="flex items-center gap-3 py-3">
                      <row.icon className="h-4 w-4 shrink-0 text-mist-400" />
                      <dt className="flex-1 text-sm text-mist-400">{row.label}</dt>
                      <dd className="text-sm font-semibold text-white">
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-ink-600 bg-ink-800/60 p-6 shadow-card sm:p-7">
                  <h2 className="text-lg font-bold text-white">
                    Details still to come
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-mist-300">
                    The date, format, rules, entry fee and how to register for{' '}
                    {event.name} have not been announced yet. Nothing is listed
                    here until it is decided — this page fills in as the
                    committee confirms it.
                  </p>
                  <p className="mt-4 border-t border-white/10 pt-4 text-sm leading-relaxed text-mist-300">
                    {EVENT.title} runs {EVENT.date}. One event is taking entries
                    today.
                  </p>

                  <Link
                    href={ROUTES.iupc}
                    className="group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold-400 px-6 py-3 text-sm font-bold text-ink-950 shadow-glow-gold transition hover:bg-gold-300"
                  >
                    See what is open
                    <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    href={ROUTES.events}
                    className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-ink-500 px-6 py-3 text-sm font-semibold text-mist-200 transition hover:bg-white/5 hover:text-white"
                  >
                    Browse the whole line-up
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AnnouncedEvent;
