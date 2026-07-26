import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  TicketIcon,
  CoinIcon,
  FlagIcon,
  UsersIcon,
  MonitorIcon,
  AlertIcon,
  CertificateIcon,
} from '@/components/landing/Icons';
import { accentOf } from './accents';

const FIELDS = [
  { key: 'date', label: 'Date', icon: CalendarIcon },
  { key: 'time', label: 'Time', icon: ClockIcon },
  { key: 'venue', label: 'Venue', icon: MapPinIcon },
  { key: 'entryFee', label: 'Entry Fee', icon: TicketIcon },
  { key: 'prizePool', label: 'Prize Pool', icon: CoinIcon },
  { key: 'format', label: 'Format', icon: FlagIcon },
  { key: 'teamSize', label: 'Team Size', icon: UsersIcon },
  { key: 'platform', label: 'Platform', icon: MonitorIcon },
  { key: 'slots', label: 'Slots', icon: UsersIcon },
  { key: 'deadline', label: 'Registration Deadline', icon: AlertIcon },
];

const InfoTile = ({ icon: Icon, label, value, accent }) => (
  <div className="flex items-start gap-3 rounded-xl border border-ink-600 bg-ink-800/60 p-4 shadow-card">
    <span
      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accent.bgSoft} ${accent.text}`}
    >
      <Icon className="h-5 w-5" />
    </span>
    <div className="min-w-0">
      <p className="text-[11px] font-bold uppercase tracking-wide text-mist-500">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold leading-snug text-white">
        {value}
      </p>
    </div>
  </div>
);

const rankStyles = {
  1: { border: 'border-gold-400/60 shadow-glow-gold', badge: 'bg-gold-400 text-ink-950', medal: 'text-gold-400' },
  2: { border: 'border-grape-400/50 shadow-glow-grape', badge: 'bg-grape-500 text-white', medal: 'text-grape-300' },
  3: { border: 'border-magenta-500/50 shadow-glow-magenta', badge: 'bg-magenta-500 text-white', medal: 'text-magenta-400' },
  4: { border: 'border-aqua-400/40', badge: 'bg-aqua-400/20 text-aqua-200', medal: 'text-aqua-300' },
};

const TournamentInfo = ({ game }) => {
  const a = accentOf(game.accent);
  const t = game.tournament;

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FIELDS.filter((f) => t[f.key]).map((f) => (
          <InfoTile
            key={f.key}
            icon={f.icon}
            label={f.label}
            value={t[f.key]}
            accent={a}
          />
        ))}
      </div>

      {game.prizes?.length > 0 && (
        <div>
          <h3 className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-mist-300">
            Prize Breakdown
          </h3>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {game.prizes.map((prize) => {
              const s = rankStyles[prize.rank] || rankStyles[4];
              return (
                <div
                  key={prize.place}
                  className={`rounded-2xl border bg-ink-800/70 p-6 text-center ${s.border}`}
                >
                  <CertificateIcon className={`mx-auto h-10 w-10 ${s.medal}`} />
                  <span
                    className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${s.badge}`}
                  >
                    {prize.place}
                  </span>
                  {prize.amount && (
                    <p className="mt-4 text-2xl font-extrabold text-white">
                      {prize.amount}
                    </p>
                  )}
                  <ul className="mt-3 space-y-1">
                    {prize.perks.map((perk) => (
                      <li key={perk} className="text-xs text-mist-400">
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentInfo;
