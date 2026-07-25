import { PhoneIcon, MailIcon, UserIcon, FacebookIcon } from '../landing/Icons';
import { accentOf } from './accents';

const CoordinatorContact = ({ game }) => {
  const a = accentOf(game.accent);
  const many = game.coordinators.length > 1;

  return (
    <div
      className={`grid gap-5 ${many ? 'sm:grid-cols-2' : 'mx-auto max-w-md'}`}
    >
      {game.coordinators.map((c) => (
        <div
          key={c.email + c.phone}
          className={`rounded-2xl border border-ink-600 bg-ink-800/60 p-6 shadow-card transition ${a.hoverBorder}`}
        >
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-carnival text-white shadow-glow-grape">
              <UserIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-base font-bold text-white">{c.name}</p>
              <p className="text-xs text-mist-400">{c.role}</p>
            </div>
          </div>

          <div className="mt-5 space-y-2.5 border-t border-ink-600 pt-4">
            <a
              href={`tel:${c.phone.replace(/\s/g, '')}`}
              className="flex items-center gap-2.5 text-sm text-mist-300 transition hover:text-white"
            >
              <PhoneIcon className={`h-4 w-4 shrink-0 ${a.text}`} />
              {c.phone}
            </a>
            <a
              href={`mailto:${c.email}`}
              className="flex items-center gap-2.5 text-sm break-all text-mist-300 transition hover:text-white"
            >
              <MailIcon className={`h-4 w-4 shrink-0 ${a.text}`} />
              {c.email}
            </a>
            {c.facebook && (
              <a
                href={c.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-mist-300 transition hover:text-white"
              >
                <FacebookIcon className={`h-4 w-4 shrink-0 ${a.text}`} />
                Message on Facebook
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CoordinatorContact;
