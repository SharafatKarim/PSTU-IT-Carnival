import Link from 'next/link';
import { ClockIcon, ArrowRightIcon } from '@/components/landing/Icons';
import { VOLUNTEER } from '@/data/content';
import { ROUTES } from '@/lib/routes';

/* Stands in for the volunteer form once VOLUNTEER.registrationOpen is false.
   Shared by the /volunteer page and the navbar modal so the two can never say
   different things — the page keeps existing rather than 404ing, because a
   dead link reads as a broken site to anyone holding an old share. */
const VolunteerClosed = ({ onDismiss }) => (
  <div className="rounded-2xl border border-ink-600 bg-ink-800/60 p-6 shadow-card sm:p-7">
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-400/10 text-gold-300">
        <ClockIcon className="h-5 w-5" />
      </span>
      <div>
        <h2 className="text-xl font-bold text-white">{VOLUNTEER.closedHeading}</h2>
        <p className="mt-2 text-sm leading-relaxed text-mist-300">
          {VOLUNTEER.closedNote}
        </p>
      </div>
    </div>

    <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-ink-600 pt-5">
      <Link
        href={ROUTES.events}
        className="group inline-flex items-center gap-2 rounded-xl bg-gold-400 px-5 py-2.5 text-sm font-bold text-ink-950 shadow-glow-gold transition hover:bg-gold-300"
        onClick={onDismiss}
      >
        Browse the events
        <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>

      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-xl border border-ink-500 px-5 py-2.5 text-sm font-semibold text-mist-200 transition hover:bg-white/5 hover:text-white"
        >
          Close
        </button>
      ) : (
        <Link
          href={ROUTES.home}
          className="rounded-xl border border-ink-500 px-5 py-2.5 text-sm font-semibold text-mist-200 transition hover:bg-white/5 hover:text-white"
        >
          Back to home
        </Link>
      )}
    </div>
  </div>
);

export default VolunteerClosed;
