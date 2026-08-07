import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import HackathonRegistrationForm from '@/components/HackathonRegistrationForm';
import { ClockIcon, CheckIcon, ArrowRightIcon } from '@/components/landing/Icons';
import { getEventDetail } from '@/data/events';
import { ROUTES, homeNav } from '@/lib/routes';
import { eventRegisterMetadata } from '@/lib/metadata';

const SLUG = 'hackathon';

export const metadata = eventRegisterMetadata(SLUG);

const NotOpenYet = ({ event }) => (
  <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
    <div className="rounded-2xl border border-red-500/20 bg-red-950/10 p-6 shadow-card sm:p-8 text-center">
      <div className="flex flex-col items-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
          <ClockIcon className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-xl font-bold text-white">
          Hackathon preliminary submission has closed
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-mist-300">
          Preliminary round submissions are now closed. The final shortlist of teams will be announced soon.
        </p>
        <div className="mt-6">
          <Link
            href={ROUTES.event(SLUG)}
            className="inline-flex items-center justify-center rounded-xl border border-ink-500 px-5 py-3 text-sm font-semibold text-mist-200 transition hover:bg-white/5 hover:text-white"
          >
            Back to Event Details
          </Link>
        </div>
      </div>
    </div>
  </div>
);

export default function HackathonRegisterPage() {
  const event = getEventDetail(SLUG);
  if (!event?.registration) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar
        links={homeNav}
        homeHref={ROUTES.home}
        ctaHref={ROUTES.volunteer}
        ctaLabel="Register as Volunteer"
      />
      <main className="flex-1">
        {event.registrationOpen ? (
          <HackathonRegistrationForm />
        ) : (
          <NotOpenYet event={event} />
        )}
      </main>
      <Footer />
    </div>
  );
}
