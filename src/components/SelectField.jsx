const SelectField = ({
  label,
  name,
  options,
  register,
  error,
  required = false,
  placeholder = 'Select...',
}) => {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-mist-200">
        {label}
        {required && <span className="text-magenta-400"> *</span>}
      </label>
      <select
        id={name}
        defaultValue=""
        {...register(name)}
        className={`w-full rounded-lg border bg-ink-900/60 px-3 py-2 text-sm text-white outline-none transition focus:ring-2 ${
          error
            ? 'border-red-500/50 focus:ring-red-500/30'
            : 'border-ink-500 focus:border-grape-500 focus:ring-grape-500/30'
        }`}
      >
        <option value="" disabled className="bg-ink-900 text-mist-400">
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-ink-900 text-white">
            {opt}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400">{error.message}</p>}
    </div>
  );
};

export default SelectField;
