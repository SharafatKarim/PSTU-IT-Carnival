import { accentOf } from '@/lib/accents';

// ---------------------------------------------------------------------------
// Map rotation / bracket, and the placement points table.
//
// Both battle royales score on a placement table, and eFootball runs a six
// round bracket. Written out as bullet points these read as a wall of numbers,
// so they get their own board above the rule cards.
//
// Driven by `game.matchFormat` — a game without one renders nothing, which is
// how the board and puzzle events stay untouched.
// ---------------------------------------------------------------------------

const Stage = ({ stage, accent }) => (
  <div className="rounded-xl border border-ink-600 bg-ink-800/60 p-4 text-center shadow-card">
    <p className="text-[11px] font-bold uppercase tracking-wide text-mist-500">
      {stage.label}
    </p>
    <p className={`mt-1.5 text-sm font-bold ${accent.text}`}>{stage.value}</p>
  </div>
);

const PointsTable = ({ points, accent }) => (
  <div className="overflow-hidden rounded-2xl border border-ink-600 bg-ink-800/60 shadow-card">
    <div className="border-b border-ink-600 px-5 py-4">
      <h3 className="text-base font-bold text-white">Points distribution</h3>
      {points.note && (
        <p className="mt-1.5 text-sm leading-relaxed text-mist-400">{points.note}</p>
      )}
    </div>

    {/* Narrow screens get a real horizontal scroll rather than a squeezed
        table — the placement labels do not shorten usefully. */}
    <div className="overflow-x-auto">
      <table className="w-full min-w-[20rem] border-collapse text-left">
        <thead>
          <tr className="border-b border-ink-600 bg-ink-900/40">
            <th className="px-5 py-2.5 text-[11px] font-bold uppercase tracking-wide text-mist-500">
              Placement
            </th>
            <th className="px-5 py-2.5 text-right text-[11px] font-bold uppercase tracking-wide text-mist-500">
              Points
            </th>
          </tr>
        </thead>
        <tbody>
          {points.rows.map((row, i) => (
            <tr
              key={row.place}
              className="border-b border-ink-700/60 last:border-b-0"
            >
              <td
                className={`px-5 py-2.5 text-sm ${
                  i === 0 ? 'font-bold text-white' : 'text-mist-300'
                }`}
              >
                {row.place}
              </td>
              <td
                className={`px-5 py-2.5 text-right text-sm font-bold tabular-nums ${
                  i === 0 ? accent.text : 'text-white'
                }`}
              >
                {row.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {points.perKill != null && (
      <div
        className={`flex items-center justify-between gap-4 border-t border-ink-600 px-5 py-3.5 ${accent.bgFaint}`}
      >
        <span className="text-sm font-semibold text-white">Per kill</span>
        <span className={`text-sm font-bold tabular-nums ${accent.text}`}>
          +{points.perKill}
        </span>
      </div>
    )}
  </div>
);

const FormatBoard = ({ game }) => {
  const format = game.matchFormat;
  if (!format) return null;

  const accent = accentOf(game.accent);
  const { stages = [], points } = format;

  return (
    <div className="mb-10 grid gap-6 lg:grid-cols-2">
      {stages.length > 0 && (
        <div>
          <h3 className="text-base font-bold text-white">
            {format.title || 'Match format'}
          </h3>
          {format.subtitle && (
            <p className="mt-1.5 text-sm leading-relaxed text-mist-400">
              {format.subtitle}
            </p>
          )}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {stages.map((stage) => (
              <Stage
                key={`${stage.label}-${stage.value}`}
                stage={stage}
                accent={accent}
              />
            ))}
          </div>
        </div>
      )}

      {points?.rows?.length > 0 && (
        <PointsTable points={points} accent={accent} />
      )}
    </div>
  );
};

export default FormatBoard;
