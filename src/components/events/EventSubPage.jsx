'use client';

import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { ArrowLeftIcon } from '@/components/landing/Icons';
import { ROUTES } from '@/lib/routes';
import { accentOf } from '@/lib/accents';

/* Shell shared by an event's directory pages (teams, slots).
   Three things it exists to get right:
     - the footer sits at the bottom even when the content is short, via
       flex-col + a flex-1 main rather than a fixed min-height;
     - the page surface is flat ink-950, so the only visible panel is the
       card the child renders — no full-bleed tint behind it;
     - one compact header, so the list gets the vertical space. */
const EventSubPage = ({ event, slug, nav, eyebrow, title, intro, tabs, children }) => {
  const a = accentOf(event?.accent);

  return (
    <div className="flex min-h-screen flex-col bg-ink-950">
      <Navbar
        links={nav}
        homeHref={ROUTES.home}
        ctaHref={ROUTES.volunteer}
        ctaLabel="Register as Volunteer"
      />

      {/* shrink-0 is load-bearing: this is a flex child with overflow-hidden,
          and flex-shrink defaults to 1, so once the page's natural content
          passes 100vh the header silently clips its last line instead of the
          page growing. */}
      <header className="relative shrink-0 overflow-hidden">
        <div className="absolute inset-0 bg-hero opacity-70" />
        <div className="absolute inset-0 bg-grid bg-[size:44px_44px] opacity-40" />
        <div className={`absolute -right-24 -top-20 h-64 w-64 rounded-full blur-3xl ${a.blob}`} />

        <div className="relative mx-auto w-full max-w-6xl px-4 pb-7 pt-8 sm:pb-8 sm:pt-10">
          <Link
            href={ROUTES.event(slug)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-mist-300 transition hover:text-white"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to {event?.name || 'event'} details
          </Link>

          {eyebrow && (
            <p className={`mt-5 text-xs font-bold uppercase tracking-[0.22em] ${a.text}`}>
              {eyebrow}
            </p>
          )}
          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight sm:text-3xl">
            {title}
          </h1>
          {intro && (
            <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-mist-300">
              {intro}
            </p>
          )}

          {tabs && <div className="mt-5">{tabs}</div>}
        </div>
      </header>

      {/* flex-1 is what pins the footer down on short pages. */}
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">{children}</div>
      </main>

      <Footer />
    </div>
  );
};

/* Small segmented control linking an event's directory pages to each other. */
export const SubPageTabs = ({ slug, active }) => {
  const items = [
    { key: 'teams', label: 'Registered Teams', href: ROUTES.eventTeams(slug) },
    { key: 'slots', label: 'Slot Allocations', href: ROUTES.eventSlots(slug) },
    ...(slug === 'iupc' ? [{ key: 'seat-plan', label: 'Seat Plans', href: ROUTES.eventSeatPlan(slug) }] : []),
  ];

  return (
    <nav className="inline-flex rounded-xl border border-ink-600 bg-ink-900/60 p-1">
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          aria-current={item.key === active ? 'page' : undefined}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition sm:text-sm ${
            item.key === active
              ? 'bg-carnival text-white shadow-glow-grape'
              : 'text-mist-300 hover:bg-white/5 hover:text-white'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
};

export default EventSubPage;
