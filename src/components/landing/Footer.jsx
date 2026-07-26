import Link from 'next/link';
import { EVENT } from '@/data/content';
import { ROUTES } from '@/lib/routes';

const Footer = () => (
  <footer className="border-t border-white/10 bg-ink-950/60">
    <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
      <Link href={ROUTES.home} className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-carnival text-sm font-extrabold text-white shadow-glow-grape">
          PC
        </span>
        <div className="text-sm">
          <p className="font-bold text-white">PSTU IT Carnival 2026</p>
          <p className="text-xs text-mist-400">Organized by {EVENT.organizer}</p>
        </div>
      </Link>
      <div className="flex flex-col items-center gap-1 text-sm text-mist-300 sm:items-end">
        <a
          href={`https://${EVENT.website}`}
          className="font-semibold text-aqua-300 transition hover:text-aqua-200"
        >
          {EVENT.website}
        </a>
        {EVENT.contactEmail && (
          <a
            href={`mailto:${EVENT.contactEmail}`}
            className="text-mist-400 transition hover:text-white"
          >
            {EVENT.contactEmail}
          </a>
        )}
        <p className="text-xs text-mist-400">© 2026 PSTU IT Carnival</p>
      </div>
    </div>
  </footer>
);

export default Footer;
