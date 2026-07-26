import Link from 'next/link';
import {
  ICON_MAP,
  ArrowRightIcon,
  CalendarIcon,
  CoinIcon,
  TicketIcon,
  UsersIcon,
} from '@/components/landing/Icons';
import { ROUTES } from '@/lib/routes';
import { isGameRegistrationOpen } from '@/data/gaming';
import { accentOf } from './accents';

const Fact = ({ icon: Icon, children }) => (
  <span className="inline-flex items-center gap-1.5 text-xs text-mist-400">
    <Icon className="h-3.5 w-3.5 shrink-0 text-mist-500" />
    {children}
  </span>
);

const GameCard = ({ game }) => {
  const Icon = ICON_MAP[game.icon] || ICON_MAP.gamepad;
  const a = accentOf(game.accent);
  const t = game.tournament;
  const open = isGameRegistrationOpen(game);

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-ink-600 bg-ink-800/60 p-6 shadow-card transition duration-300 hover:-translate-y-1 ${a.hoverBorder}`}
    >
      <div
        className={`pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl transition-opacity duration-300 ${a.blob} opacity-40 group-hover:opacity-70`}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl border bg-ink-900/70 ${a.border} ${a.glow} ${a.text}`}
        >
          <Icon className="h-7 w-7" />
        </div>
        {open ? (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${a.border} ${a.bgSoft} ${a.text}`}
          >
            <span className={`h-1.5 w-1.5 animate-pulse-glow rounded-full ${a.dot}`} />
            Open
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-400/40 bg-gold-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-gold-300">
            <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-gold-400" />
            Soon
          </span>
        )}
      </div>

      <div className="relative mt-5 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-xl font-extrabold text-white">{game.name}</h3>
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-mist-300">
            {game.mode}
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-mist-400">{game.blurb}</p>

        <div className="mt-5 grid grid-cols-2 gap-y-2 border-t border-ink-600 pt-4">
          <Fact icon={CalendarIcon}>{t.date}</Fact>
          <Fact icon={UsersIcon}>{t.teamSize}</Fact>
          <Fact icon={TicketIcon}>{t.entryFee}</Fact>
          <Fact icon={CoinIcon}>{t.prizePool} pool</Fact>
        </div>
      </div>

      <div className="relative mt-6 flex flex-col gap-2.5 sm:flex-row">
        <Link
          href={ROUTES.game(game.slug)}
          aria-label={`View ${game.name} details`}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-ink-500 px-4 py-2.5 text-sm font-semibold text-mist-200 transition hover:bg-white/5 hover:text-white"
        >
          View Details
        </Link>
        {open ? (
          <Link
            href={ROUTES.gameRegister(game.slug)}
            aria-label={`Register for ${game.name}`}
            className="group/btn inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-gold-400 px-4 py-2.5 text-sm font-bold text-ink-950 shadow-glow-gold transition hover:bg-gold-300"
          >
            Register
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
          </Link>
        ) : (
          <button
            type="button"
            disabled
            aria-disabled="true"
            aria-label={`Registration for ${game.name} has not opened yet`}
            className="inline-flex flex-1 cursor-not-allowed items-center justify-center whitespace-nowrap rounded-lg border border-ink-600 bg-ink-700/40 px-4 py-2.5 text-sm font-semibold text-mist-400"
          >
            Opens Soon
          </button>
        )}
      </div>
    </article>
  );
};

export default GameCard;
