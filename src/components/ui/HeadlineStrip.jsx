/* The band of headline numbers that closes every hero — the landing page and
   the event/game detail pages had drifted into three slightly different
   versions of it.

   Borders are set per-cell rather than with `divide-x`: in a two-column grid
   `divide-x` skips only the last child, so cell 2 — which sits in the right
   column — gets a border on the strip's outer edge with nothing beyond it.

   Expects exactly four items; more would break the row maths. */
const HeadlineStrip = ({ items }) => (
  <div className="relative border-t border-white/10 bg-ink-950/70 backdrop-blur">
    <div className="mx-auto grid max-w-6xl grid-cols-2 px-4 lg:grid-cols-4">
      {items.slice(0, 4).map((item) => (
        <div
          key={item.label}
          className="flex flex-col items-center justify-center border-white/10 px-4 py-5 text-center odd:border-e [&:nth-child(-n+2)]:border-b sm:py-6 lg:border-e lg:border-b-0 lg:last:border-e-0"
        >
          <p
            className={`text-2xl font-extrabold sm:text-3xl ${
              item.accentClass || 'text-white'
            }`}
          >
            {item.value}
          </p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-mist-400">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  </div>
);

export default HeadlineStrip;
