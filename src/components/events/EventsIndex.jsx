'use client';

import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Lineup from '@/components/landing/Lineup';
import { ArrowLeftIcon, CalendarIcon, MapPinIcon } from '@/components/landing/Icons';
import { EVENT, STATS } from '@/data/content';
import { ROUTES, eventsIndexNav } from '@/lib/routes';

/* The whole line-up on its own page.
   It reuses the landing page's <Lineup> ledger rather than restating the list,
   so the two can never disagree — this page supplies the hero, the nav and
   the URL. */
const EventsIndex = () => (
  <div className="min-h-screen">
    <Navbar
      links={eventsIndexNav}
      homeHref={ROUTES.home}
      ctaHref={ROUTES.register}
      ctaLabel="IUPC Register"
    />

    <main>
      <section className="relative overflow-hidden bg-ink-950">
        <div className="absolute inset-0 bg-hero" />
        <div className="absolute inset-0 bg-grid bg-[size:46px_46px] opacity-50" />
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-grape-600/20 blur-3xl" />
        <div className="absolute -right-16 top-20 h-72 w-72 rounded-full bg-aqua-500/15 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-12 sm:pb-20 sm:pt-16">
          <Link
            href={ROUTES.home}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-mist-200 transition hover:text-white"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to carnival home
          </Link>

          <div className="mt-8 max-w-3xl">
            <p className="text-gradient-brand text-xs font-bold uppercase tracking-[0.22em]">
              The Line-Up
            </p>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
              Every event at {EVENT.title}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-mist-300 sm:text-lg">
              {EVENT.intro}
            </p>

            <div className="mt-7 flex flex-wrap gap-x-8 gap-y-2 text-sm text-mist-200">
              <span className="inline-flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-mist-400" />
                {EVENT.date}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-mist-400" />
                {EVENT.venue}
              </span>
              <span>
                <strong className="font-semibold text-white">
                  {STATS.find((s) => s.label === 'Events')?.value ?? ''}
                </strong>{' '}
                events across {EVENT.format.toLowerCase()}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Lineup />
        </div>
      </section>
    </main>

    <Footer />
  </div>
);

export default EventsIndex;
