const FormField = ({
  label,
  name,
  type = 'text',
  placeholder,
  register,
  error,
  required = false,
  autoComplete,
  hint,
}) => {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-mist-200">
        {label}
        {required && <span className="text-magenta-400"> *</span>}
      </label>
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        {...register(name)}
        className={`w-full rounded-lg border bg-ink-900/60 px-3 py-2 text-sm text-white placeholder-mist-500 outline-none transition focus:ring-2 ${
          error
            ? 'border-red-500/50 focus:ring-red-500/30'
            : 'border-ink-500 focus:border-grape-500 focus:ring-grape-500/30'
        }`}
      />
      {error ? (
        <p className="text-xs text-red-400">{error.message}</p>
      ) : (
        hint && <p className="text-xs text-mist-500">{hint}</p>
      )}
    </div>
  );
};

export default FormField;
