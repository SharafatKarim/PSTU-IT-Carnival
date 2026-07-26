import Link from 'next/link';
import { EVENT, EVENT_TIERS } from '@/data/content';
import { ROUTES } from '@/lib/routes';
import { CalendarIcon, MapPinIcon } from './Icons';

const FooterLink = ({ href, children }) => (
  <li>
    <Link
      href={href}
      className="text-sm text-mist-400 transition hover:text-white"
    >
      {children}
    </Link>
  </li>
);

const Footer = () => {
  /* The events worth a direct link are the ones with something to read. The
     announced seven have a page but nothing on it yet, and /events lists them
     anyway. */
  const linkable = [...EVENT_TIERS.open, ...EVENT_TIERS.published];

  return (
    <footer className="border-t border-white/10 bg-ink-950/60">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <Link href={ROUTES.home} className="inline-flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="PSTU IT Carnival Logo"
                className="h-9 w-auto object-contain"
              />
              <span className="text-sm">
                <span className="block font-bold text-white">{EVENT.title}</span>
                <span className="block text-xs text-mist-400">
                  Organized by {EVENT.organizer}
                </span>
              </span>
            </Link>

            <div className="mt-5 space-y-2 text-sm text-mist-400">
              <p className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 shrink-0" />
                {EVENT.date}
              </p>
              <p className="flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 shrink-0" />
                {EVENT.venue}
              </p>
            </div>
          </div>

          <div className="lg:col-span-4">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.22em] text-mist-300">
              Events
            </h2>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {linkable.map((event) => (
                <FooterLink key={event.id} href={event.href}>
                  {event.name}
                </FooterLink>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.22em] text-mist-300">
              Browse
            </h2>
            <ul className="mt-4 space-y-2.5">
              <FooterLink href={ROUTES.events}>All twelve events</FooterLink>
              <FooterLink href={ROUTES.gaming}>Gaming Fest</FooterLink>
              <FooterLink href={ROUTES.register}>IUPC pre-registration</FooterLink>
              <FooterLink href={`${ROUTES.iupc}#contact`}>
                Contact the coordinator
              </FooterLink>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-white/10 pt-6 sm:flex-row sm:items-center">
          <a
            href={`https://${EVENT.website}`}
            className="text-sm font-semibold text-aqua-300 transition hover:text-aqua-200"
          >
            {EVENT.website}
          </a>
          {EVENT.contactEmail && (
            <a
              href={`mailto:${EVENT.contactEmail}`}
              className="text-sm text-mist-400 transition hover:text-white"
            >
              {EVENT.contactEmail}
            </a>
          )}
          <p className="text-xs text-mist-400">© 2026 PSTU IT Carnival</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
