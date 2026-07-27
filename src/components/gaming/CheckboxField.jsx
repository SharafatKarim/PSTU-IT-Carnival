/* Splits the plain-text label on each link's `text` and swaps in an anchor.

   The label stays a plain string in src/data/gaming.js because the server
   validator quotes it in error messages, so the markup has to be reassembled
   here rather than authored there.

   Links open in a new tab: the rules live on another route, and following them
   in place would throw away a half-filled registration form. */
const linkify = (label, links) => {
  if (!links?.length) return label;

  let parts = [label];

  links.forEach(({ text, href }, linkIndex) => {
    parts = parts.flatMap((part, partIndex) => {
      if (typeof part !== 'string') return [part];

      const at = part.indexOf(text);
      if (at === -1) return [part];

      return [
        part.slice(0, at),
        <a
          key={`${linkIndex}-${partIndex}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-aqua-300 underline underline-offset-2 transition hover:text-aqua-200"
        >
          {text}
        </a>,
        part.slice(at + text.length),
      ];
    });
  });

  return parts;
};

const CheckboxField = ({ label, name, register, error, required = false, links }) => (
  <div className="flex flex-col gap-1">
    <label
      htmlFor={name}
      className="flex cursor-pointer items-start gap-3 rounded-lg border border-ink-500 bg-ink-900/60 p-3.5 transition hover:border-grape-500/60"
    >
      <input
        id={name}
        type="checkbox"
        {...register(name)}
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-ink-500 bg-ink-900 accent-grape-500"
      />
      {/* Anchors nested in a label are "interactive content", which the HTML
          spec excludes from the label's activation behaviour — so following a
          link does not also tick the box. */}
      <span className="text-sm leading-relaxed text-mist-200">
        {linkify(label, links)}
        {required && <span className="text-magenta-400"> *</span>}
      </span>
    </label>
    {error && <p className="text-xs text-red-400">{error.message}</p>}
  </div>
);

export default CheckboxField;
