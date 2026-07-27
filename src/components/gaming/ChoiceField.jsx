'use client';

// ---------------------------------------------------------------------------
// A radio group rendered as tappable cards.
//
// Used for the Team / Individual question on the battle royale forms. A native
// <select> would work, but this choice changes which half of the form appears
// — it deserves to be the most visible thing on the page, and on a phone two
// large targets beat a dropdown.
//
// Real <input type="radio"> elements under the hood, so keyboard navigation,
// screen readers and react-hook-form all behave normally.
// ---------------------------------------------------------------------------

const ChoiceField = ({
  label,
  name,
  options,
  register,
  error,
  required = false,
  value,
  accent,
}) => {
  /* One register() call for the whole group — react-hook-form collects the
     refs of every radio sharing the name. */
  const field = register(name);

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-medium text-mist-200">
        {label}
        {required && <span className="text-magenta-400"> *</span>}
      </legend>

      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const selected = value === option.value;

          return (
            <label
              key={option.value}
              className={`group relative flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                selected
                  ? `${accent.border} ${accent.bgSoft}`
                  : 'border-ink-500 bg-ink-900/40 hover:border-ink-400 hover:bg-ink-900/70'
              }`}
            >
              <input
                type="radio"
                value={option.value}
                {...field}
                className="sr-only"
              />

              {/* Drawn rather than a styled native control: the native radio
                  cannot be recoloured consistently across browsers. */}
              <span
                aria-hidden="true"
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                  selected ? accent.border : 'border-ink-400'
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full transition ${
                    selected ? accent.dot : 'bg-transparent'
                  }`}
                />
              </span>

              <span className="min-w-0">
                <span
                  className={`block text-sm font-bold ${
                    selected ? 'text-white' : 'text-mist-200'
                  }`}
                >
                  {option.label}
                </span>
                {option.hint && (
                  <span className="mt-0.5 block text-xs leading-relaxed text-mist-400">
                    {option.hint}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>

      {error && <p className="mt-1 text-xs text-red-400">{error.message}</p>}
    </fieldset>
  );
};

export default ChoiceField;
