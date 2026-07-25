const CheckboxField = ({ label, name, register, error, required = false }) => (
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
      <span className="text-sm leading-relaxed text-mist-200">
        {label}
        {required && <span className="text-magenta-400"> *</span>}
      </span>
    </label>
    {error && <p className="text-xs text-red-400">{error.message}</p>}
  </div>
);

export default CheckboxField;
