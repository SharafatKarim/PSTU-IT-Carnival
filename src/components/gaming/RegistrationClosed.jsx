import Link from 'next/link';
import { ClockIcon, MailIcon, PhoneIcon, CheckIcon } from '@/components/landing/Icons';
import { GAMING } from '@/data/gaming';
import { ROUTES } from '@/lib/routes';
import { accentOf } from '@/lib/accents';
import { prepList } from './prep';

/* Stands in for the registration form while a tournament's entries are shut.
   Keeps the page useful: what to prepare, when it opens, who to ask.
   Rendered on both the detail page and the registration route, so the
   coordinator link resolves against the detail page rather than assuming a
   #contact section exists on the current page. */
const RegistrationClosed = ({ game, coordinators }) => {
  const a = accentOf(game.accent);
  const lead = (coordinators?.length > 0 ? coordinators : game.coordinators)?.[0];
  const prep = prepList(game);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="grid items-start gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div
            className={`rounded-2xl border bg-ink-800/60 p-6 shadow-card sm:p-7 ${a.borderSoft}`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${a.bgSoft} ${a.text}`}
              >
                <ClockIcon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {GAMING.closedHeading}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-mist-300">
                  {GAMING.closedNote}
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-ink-600 pt-5">
              <p className="text-[11px] font-bold uppercase tracking-wide text-mist-400">
                Get ready in the meantime
              </p>
              <ul className="mt-3 space-y-2.5">
                {prep.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${a.bgSoft} ${a.text}`}
                    >
                      <CheckIcon className="h-3 w-3" />
                    </span>
                    <span className="text-sm leading-relaxed text-mist-300">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-ink-600 bg-ink-800/60 p-6 shadow-card">
            <p className="text-[11px] font-bold uppercase tracking-wide text-mist-400">
              Want to be told first?
            </p>
            <p className="mt-2 text-sm leading-relaxed text-mist-300">
              Message the {game.name} coordinator and they will let you know the
              moment entries open.
            </p>

            {lead && (
              <div className="mt-5 space-y-2.5 border-t border-ink-600 pt-4">
                <p className="text-sm font-bold text-white">{lead.name}</p>
                <a
                  href={`tel:${lead.phone.replace(/\s/g, '')}`}
                  className="flex items-center gap-2.5 text-sm text-mist-300 transition hover:text-white"
                >
                  <PhoneIcon className={`h-4 w-4 shrink-0 ${a.text}`} />
                  {lead.phone}
                </a>
                <a
                  href={`mailto:${lead.email}`}
                  className="flex items-center gap-2.5 break-all text-sm text-mist-300 transition hover:text-white"
                >
                  <MailIcon className={`h-4 w-4 shrink-0 ${a.text}`} />
                  {lead.email}
                </a>
              </div>
            )}

            <Link
              href={`${ROUTES.game(game.slug)}#contact`}
              className="mt-5 inline-flex w-full items-center justify-center rounded-lg border border-ink-500 px-4 py-2.5 text-sm font-semibold text-mist-200 transition hover:bg-white/5 hover:text-white"
            >
              All coordinators
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationClosed;
