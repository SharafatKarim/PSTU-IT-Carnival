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
          Hackathon pre-registration has closed
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-mist-300">
          Registration has closed. The preliminary round results will be announced soon.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={ROUTES.eventTeams(SLUG)}
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-magenta-600 hover:bg-magenta-500 px-6 py-3 text-sm font-bold text-white shadow-glow-magenta transition"
          >
            View Registered Teams
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
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
        <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
          <div className="rounded-2xl border border-gold-400/20 bg-gold-400/5 p-6 shadow-card sm:p-8 text-center">
            <div className="flex flex-col items-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-400/10 text-gold-400">
                <CheckIcon className="h-6 w-6" />
              </span>
              <h1 className="mt-4 text-xl font-bold text-white">
                Hackathon Final Registration
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-mist-300">
                Hackathon pre-registration is closed. Only selected teams can pay the entry fee to complete their final registration.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href={ROUTES.eventTeams(SLUG)}
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gold-400 hover:bg-gold-300 px-6 py-3 text-sm font-bold text-ink-950 shadow-glow-gold transition"
                >
                  Go to Teams & Pay
                  <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
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
      </main>
      <Footer />
    </div>
  );
}
