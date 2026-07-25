'use client';

import { useEffect, useId, useRef, useState } from 'react';

/* Text input that suggests from a list while staying free-text: anything not
   on the list can still be typed. Implements the combobox keyboard contract —
   Down/Up to move, Enter to pick, Escape to dismiss. */
const AutocompleteField = ({
  label,
  name,
  placeholder,
  register,
  error,
  hint,
  required = false,
  autoComplete = 'off',
  /* (query) => [{ name, short }] */
  search,
  /* called with the chosen option */
  onSelect,
  value = '',
}) => {
  const listId = useId();
  const wrapRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [matches, setMatches] = useState([]);

  const { onChange: rhfOnChange, onBlur: rhfOnBlur, ...field } = register(name);

  useEffect(() => {
    const onPointerDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const refresh = (query) => {
    const next = search(query);
    setMatches(next);
    setActive(next.length > 0 ? 0 : -1);
    setOpen(next.length > 0);
  };

  const choose = (option) => {
    setOpen(false);
    setActive(-1);
    onSelect?.(option);
  };

  const onKeyDown = (e) => {
    if (!open) {
      if (e.key === 'ArrowDown') {
        refresh(e.currentTarget.value);
        e.preventDefault();
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      setActive((i) => (i + 1) % matches.length);
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      setActive((i) => (i - 1 + matches.length) % matches.length);
      e.preventDefault();
    } else if (e.key === 'Enter' && active >= 0) {
      choose(matches[active]);
      e.preventDefault();
    } else if (e.key === 'Escape') {
      setOpen(false);
      e.preventDefault();
    }
  };

  return (
    <div className="flex flex-col gap-1" ref={wrapRef}>
      <label htmlFor={name} className="text-sm font-medium text-mist-200">
        {label}
        {required && <span className="text-magenta-400"> *</span>}
      </label>

      <div className="relative">
        <input
          {...field}
          id={name}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          autoComplete={autoComplete}
          placeholder={placeholder}
          onChange={(e) => {
            rhfOnChange(e);
            refresh(e.target.value);
          }}
          onFocus={(e) => refresh(e.target.value)}
          onBlur={(e) => rhfOnBlur(e)}
          onKeyDown={onKeyDown}
          className={`w-full rounded-lg border bg-ink-900/60 px-3 py-2 text-sm text-white placeholder-mist-500 outline-none transition focus:ring-2 ${
            error
              ? 'border-red-500/50 focus:ring-red-500/30'
              : 'border-ink-500 focus:border-grape-500 focus:ring-grape-500/30'
          }`}
        />

        {open && (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-ink-500 bg-ink-900 py-1 shadow-card"
          >
            {matches.map((option, i) => (
              <li
                key={option.name}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                /* pointerdown fires before blur, so the click is not lost. */
                onPointerDown={(e) => {
                  e.preventDefault();
                  choose(option);
                }}
                onMouseEnter={() => setActive(i)}
                className={`flex cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm transition ${
                  i === active ? 'bg-grape-600/30 text-white' : 'text-mist-200'
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{option.name}</span>
                  {option.district && (
                    <span className="block truncate text-xs text-mist-400">
                      {option.district}
                    </span>
                  )}
                </span>
                <span className="shrink-0 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[11px] font-bold text-aqua-300">
                  {option.short}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error ? (
        <p className="text-xs text-red-400">{error.message}</p>
      ) : (
        hint && <p className="text-xs text-mist-400">{hint}</p>
      )}
    </div>
  );
};

export default AutocompleteField;
