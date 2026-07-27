import { PhoneIcon, MailIcon, FacebookIcon, ArrowRightIcon } from '@/components/landing/Icons';
import { accentOf } from '@/lib/accents';

const initials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

/* Every way to reach this person, as tappable tiles rather than plain links —
   on a phone these are the primary action of the whole page. */
const channelsOf = (c) =>
  [
    c.phone && {
      key: 'phone',
      icon: PhoneIcon,
      label: 'Call or WhatsApp',
      value: c.phone,
      href: `tel:${c.phone.replace(/\s/g, '')}`,
    },
    c.email && {
      key: 'email',
      icon: MailIcon,
      label: 'Email',
      value: c.email,
      href: `mailto:${c.email}`,
    },
    c.facebook && {
      key: 'facebook',
      icon: FacebookIcon,
      label: 'Facebook',
      value: 'Send a message',
      href: c.facebook,
      external: true,
    },
  ].filter(Boolean);

const Channel = ({ channel, accent }) => {
  const { icon: Icon, label, value, href, external } = channel;

  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={`group flex items-center gap-3 rounded-xl border border-ink-600 bg-ink-900/50 p-3.5 transition hover:bg-ink-900 ${accent.hoverBorder}`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accent.bgSoft} ${accent.text}`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-bold uppercase tracking-wide text-mist-400">
          {label}
        </span>
        <span
          className="block truncate text-[13px] font-semibold text-white"
          title={value}
        >
          {value}
        </span>
      </span>
      <ArrowRightIcon className="h-4 w-4 shrink-0 text-mist-500 transition-transform group-hover:translate-x-0.5 group-hover:text-mist-300" />
    </a>
  );
};

const CoordinatorCard = ({ coordinator, accent }) => {
  const channels = channelsOf(coordinator);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-ink-600 bg-ink-800/60 p-6 shadow-card transition sm:p-7 ${accent.hoverBorder}`}
    >
      <div
        className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl ${accent.blob} opacity-40`}
      />

      <div className="relative flex items-center gap-4">
        <span
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border bg-ink-900/70 text-lg font-extrabold ${accent.border} ${accent.text}`}
        >
          {initials(coordinator.name)}
        </span>
        <div className="min-w-0">
          <p className="text-lg font-bold text-white">{coordinator.name}</p>
          <p className="mt-0.5 text-sm text-mist-400">{coordinator.role}</p>
        </div>
      </div>

      <div
        className={`relative mt-6 grid gap-3 ${
          channels.length > 2 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
        }`}
      >
        {channels.map((channel) => (
          <Channel key={channel.key} channel={channel} accent={accent} />
        ))}
      </div>
    </div>
  );
};

/* `coordinators` is passed in by the gaming pages, which read it from the
   database so a number can be corrected without a redeploy. The tech event
   pages still carry theirs in src/data/events.js, hence the fallback. */
const CoordinatorContact = ({ game, coordinators }) => {
  const accent = accentOf(game.accent);
  const people = coordinators?.length > 0 ? coordinators : game.coordinators || [];

  if (people.length === 0) {
    return (
      <div className="rounded-2xl border border-ink-600 bg-ink-800/60 p-6 text-center shadow-card">
        <p className="text-sm text-mist-300">
          Coordinator contact details for this event are being updated. Reach the
          CSE Club desk in the meantime.
        </p>
      </div>
    );
  }

  /* Cards stack rather than sitting side by side: a full-width card keeps the
     contact tiles in one row, and email addresses readable instead of clipped. */
  return (
    <div className="grid gap-5">
      {people.map((coordinator) => (
        <CoordinatorCard
          key={coordinator.email + coordinator.phone}
          coordinator={coordinator}
          accent={accent}
        />
      ))}
    </div>
  );
};

export default CoordinatorContact;
