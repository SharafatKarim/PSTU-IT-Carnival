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
      <label htmlFor={name} className="text-sm font-medium text-navy-800">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <select
        id={name}
        defaultValue=""
        {...register(name)}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-navy-900 outline-none transition focus:ring-2 focus:ring-navy-400 ${
          error ? 'border-red-400 focus:ring-red-200' : 'border-navy-200'
        }`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error.message}</p>}
    </div>
  );
};

export default SelectField;
