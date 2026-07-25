import { ICON_MAP, CheckIcon } from '../landing/Icons';
import { accentOf } from './accents';

const RulesSection = ({ game }) => {
  const a = accentOf(game.accent);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {game.rules.map((group) => {
        const Icon = ICON_MAP[group.icon] || ICON_MAP.shield;
        return (
          <div
            key={group.title}
            className="rounded-2xl border border-ink-600 bg-ink-800/60 p-6 shadow-card"
          >
            <div className="flex items-center gap-3 border-b border-ink-600 pb-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-carnival text-white shadow-glow-grape">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="text-base font-bold text-white">{group.title}</h3>
            </div>
            <ul className="mt-4 space-y-3">
              {group.items.map((item) => (
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
        );
      })}
    </div>
  );
};

export default RulesSection;
