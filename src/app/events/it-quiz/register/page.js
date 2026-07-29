import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import ItQuizRegistrationForm from '@/components/ItQuizRegistrationForm';
import { ClockIcon, CheckIcon, ArrowRightIcon } from '@/components/landing/Icons';
import { getEventDetail } from '@/data/events';
import { ROUTES, homeNav } from '@/lib/routes';

const SLUG = 'it-quiz';

export const metadata = {
  title: 'IT Quiz Registration — PSTU IT Carnival 2026',
  description:
    'Register for the IT Quiz at PSTU IT Carnival 2026. Individual entry, ৳100.',
};

/* The route exists before entries open so it can say WHY it is shut. A 404
   here would read as a broken site.

   Not the gaming RegistrationClosed component — that one takes a `game`, links
   to ROUTES.game() and pulls its copy from the GAMING block, none of which
   apply to an event. */
const NotOpenYet = ({ event }) => (
  <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
    <div className="rounded-2xl border border-ink-600 bg-ink-800/60 p-6 shadow-card sm:p-8">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-400/10 text-gold-300">
          <ClockIcon className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-white">
            {event.name} entries have not opened yet
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-mist-300">
            The form is ready. It opens once the committee publishes the date
            and the number the ৳{event.entry?.fee ?? 100} is sent to.
          </p>
        </div>
      </div>

      <div className="mt-6 border-t border-ink-600 pt-5">
        <p className="text-[11px] font-bold uppercase tracking-wide text-mist-400">
          Have this ready
        </p>
        <ul className="mt-3 space-y-2.5">
          {event.registration.checklist.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-aqua-400" />
              <span className="text-sm leading-relaxed text-mist-300">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <Link
        href={ROUTES.event(SLUG)}
        className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-mist-300 transition hover:text-white"
      >
        Back to {event.name}
        <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  </div>
);

export default function ItQuizRegisterPage() {
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
          <ItQuizRegistrationForm />
        ) : (
          <NotOpenYet event={event} />
        )}
      </main>
      <Footer />
    </div>
  );
}
