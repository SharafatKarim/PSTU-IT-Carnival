'use client';

import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import EventCatalogue from './EventCatalogue';
import { ArrowLeftIcon, CalendarIcon, MapPinIcon } from '@/components/landing/Icons';
import { EVENT, STATS } from '@/data/content';
import { ROUTES, eventsIndexNav } from '@/lib/routes';

/* The catalogue page.

   This used to render the landing page's <Lineup> verbatim, which meant the
   same twelve events in the same three readiness tiers at a second URL, with a
   taller hero as the only difference. It now groups by category — see
   EventCatalogue.jsx for why — so the landing page answers "what can I enter
   today" and this page answers "what is there".

   Both read EVENTS, so the two can still never disagree about the list. */
const EventsIndex = () => (
  <div className="min-h-screen">
    <Navbar
      links={eventsIndexNav}
      homeHref={ROUTES.home}
      ctaHref={ROUTES.volunteer}
      ctaLabel="Register as Volunteer"
    />

    <main>
      <section className="relative overflow-hidden bg-ink-950">
        <div className="absolute inset-0 bg-hero" />
        <div className="absolute inset-0 bg-grid bg-[size:46px_46px] opacity-50" />
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-grape-600/20 blur-3xl" />
        <div className="absolute -right-16 top-20 h-72 w-72 rounded-full bg-aqua-500/15 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-10 sm:pb-14 sm:pt-12">
          <Link
            href={ROUTES.home}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-mist-200 transition hover:text-white"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to carnival home
          </Link>

          <div className="mt-7 max-w-3xl">
            <p className="text-gradient-brand text-xs font-bold uppercase tracking-[0.22em]">
              The Line-Up
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
              Every event at {EVENT.title}
            </h1>
            <p className="mt-3.5 max-w-[62ch] text-base leading-relaxed text-mist-300">
              Grouped by what they are, not by whether entries have opened.
              Every event has a page, including the ones still waiting on a
              date.
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

      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4">
          <EventCatalogue />
        </div>
      </section>
    </main>

    <Footer />
  </div>
);

export default EventsIndex;
