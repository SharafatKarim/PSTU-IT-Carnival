import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import RegistrationForm from '@/components/RegistrationForm';
import { ClockIcon, ArrowRightIcon } from '@/components/landing/Icons';
import { getEventDetail } from '@/data/events';
import { eventRegisterMetadata } from '@/lib/metadata';
import { ROUTES, homeNav } from '@/lib/routes';

const SLUG = 'iupc';

export const metadata = eventRegisterMetadata(SLUG);

/* Entries have closed, so the form is gone — but the route stays. Posters, the
   /register redirect and months of shared links all point here, and a 404 on a
   URL the carnival published itself reads as a broken site rather than as a
   deadline that passed. Same reasoning as the it-quiz "not open yet" panel; the
   difference is that this one will not reopen, and says so. */
const RegistrationClosed = ({ event }) => (
  <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
    <div className="rounded-2xl border border-ink-600 bg-ink-800/60 p-6 shadow-card sm:p-8">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-400/10 text-gold-300">
          <ClockIcon className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-white">
            {event.name} pre-registration has closed
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-mist-300">
            Thank you to every team that entered. The form is no longer taking
            submissions.
          </p>
        </div>
      </div>

      <div className="mt-6 border-t border-ink-600 pt-5">
        <p className="text-[11px] font-bold uppercase tracking-wide text-mist-400">
          Already pre-registered?
        </p>
        <p className="mt-2 text-sm leading-relaxed text-mist-300">
          Keep your registration ID safe. Confirmed slots are published
          university-wise, and final registration then opens for the listed
          teams — your team leader is emailed at each step.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-ink-600 pt-5">
        <Link
          href={ROUTES.eventTeams(SLUG)}
          className="group inline-flex items-center gap-2 rounded-xl bg-gold-400 px-5 py-2.5 text-sm font-bold text-ink-950 shadow-glow-gold transition hover:bg-gold-300"
        >
          See registered teams
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <Link
          href={ROUTES.event(SLUG)}
          className="rounded-xl border border-ink-500 px-5 py-2.5 text-sm font-semibold text-mist-200 transition hover:bg-white/5 hover:text-white"
        >
          Back to {event.name}
        </Link>
      </div>
    </div>
  </div>
);

export default function IupcRegisterPage() {
  const event = getEventDetail(SLUG);

  /* A missing event or one that never had a form here is still a genuine 404 —
     only a closed intake gets the panel above. */
  if (!event || event.registration?.kind !== 'form') {
    notFound();
  }

  if (!event.registrationOpen) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar links={homeNav} homeHref={ROUTES.home} />
        <main className="flex-1">
          <RegistrationClosed event={event} />
        </main>
        <Footer />
      </div>
    );
  }

  return <RegistrationForm slug={SLUG} />;
}
