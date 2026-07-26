'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import FormField from '@/components/FormField';
import SelectField from '@/components/SelectField';
import SectionCard from '@/components/SectionCard';
import CheckboxField from './CheckboxField';
import { CheckIcon, AlertIcon, TicketIcon } from '@/components/landing/Icons';
import { submitGameRegistration, DEMO_MODE } from '@/services/events/gaming';
import { ROUTES } from '@/lib/routes';
import { accentOf } from '@/lib/accents';

/* --- helpers -------------------------------------------------------------- */

/* Read a dotted path out of RHF's nested error object. */
const at = (obj, path) =>
  path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj);

/* Write a dotted path, creating arrays for numeric segments along the way. */
const setPath = (target, path, value) => {
  const parts = path.split('.');
  let cur = target;
  parts.forEach((part, i) => {
    if (i === parts.length - 1) {
      cur[part] = value;
      return;
    }
    if (cur[part] === undefined) {
      cur[part] = /^\d+$/.test(parts[i + 1]) ? [] : {};
    }
    cur = cur[part];
  });
};

const buildDefaults = (sections) => {
  const defaults = {};
  sections.forEach((section) =>
    section.fields.forEach((field) =>
      setPath(defaults, field.name, field.type === 'checkbox' ? false : '')
    )
  );
  return defaults;
};

/* "players.2.uid" -> must not duplicate players[*].uid on any other row. */
const uniqueValidator = (field, getValues) => {
  const match = /^(.+)\.(\d+)\.(.+)$/.exec(field.name);
  if (!match) return undefined;
  const [, group, indexStr, key] = match;
  const index = Number(indexStr);

  return (value) => {
    if (!value) return true;
    const rows = getValues(group) || [];
    const normalized = String(value).trim().toLowerCase();
    const clash = rows.some(
      (row, i) =>
        i !== index &&
        String(row?.[key] ?? '').trim().toLowerCase() === normalized
    );
    return !clash || `${field.label} must be different for each player`;
  };
};

const rulesFor = (field, getValues) => {
  const extra = field.rules || {};
  const rules = { ...extra };
  const validators = {};

  if (typeof extra.validate === 'function') validators.custom = extra.validate;
  else if (extra.validate) Object.assign(validators, extra.validate);

  if (field.required) {
    rules.required =
      field.type === 'checkbox'
        ? 'You must accept this to continue'
        : `${field.label} is required`;
  } else if (rules.pattern) {
    // An optional field left blank must stay valid, so its pattern only runs
    // once something has actually been typed (the substitute row relies on this).
    const { value: regex, message } = rules.pattern;
    delete rules.pattern;
    validators.optionalPattern = (value) => !value || regex.test(value) || message;
  }

  if (field.unique) {
    const unique = uniqueValidator(field, getValues);
    if (unique) validators.unique = unique;
  }

  if (Object.keys(validators).length > 0) rules.validate = validators;
  return rules;
};

/* --- form ----------------------------------------------------------------- */

const GameRegistrationForm = ({ game }) => {
  const a = accentOf(game.accent);
  const { sections } = game.registration;

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: useMemo(() => buildDefaults(sections), [sections]),
    mode: 'onTouched',
  });

  const registerField = useMemo(() => {
    const ruleMap = {};
    sections.forEach((section) =>
      section.fields.forEach((field) => {
        ruleMap[field.name] = rulesFor(field, getValues);
      })
    );
    return (name) => register(name, ruleMap[name]);
  }, [sections, register, getValues]);

  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [reference, setReference] = useState(null);

  const onSubmit = async (values) => {
    setLoading(true);
    setSubmitError(null);
    try {
      const res = await submitGameRegistration(game, values);
      setReference(res.referenceId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startOver = () => {
    setReference(null);
    setSubmitError(null);
    reset(buildDefaults(sections));
  };

  if (reference) {
    return (
      <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-6 text-center sm:p-10">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
          <CheckIcon className="h-7 w-7" />
        </div>
        <h3 className="text-xl font-bold text-emerald-300">
          {game.name} registration submitted!
        </h3>
        <p className="mt-2 text-sm text-emerald-200/80">Your reference number is</p>
        <p className="mt-3 inline-block rounded-md border border-white/10 bg-ink-900 px-4 py-2 font-mono text-lg font-bold text-white shadow">
          {reference}
        </p>
        <p className="mx-auto mt-4 max-w-md text-sm text-emerald-200/80">
          Save this number. Bring it, your student ID and the entry fee
          ({game.tournament.entryFee}) to the registration desk on match day.
        </p>

        {/* Remove this block once a real backend is storing registrations. */}
        {DEMO_MODE && (
          <p className="mx-auto mt-5 flex max-w-md items-start gap-2 rounded-lg border border-gold-400/30 bg-gold-400/10 p-3 text-left text-xs text-gold-200">
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Demo mode — this entry is not stored anywhere yet. Connect the
              registration API before opening the form to real participants.
            </span>
          </p>
        )}

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={startOver}
            className="rounded-lg border border-emerald-400/40 px-5 py-2.5 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-400/10"
          >
            Register another entry
          </button>
          <Link
            href={ROUTES.gaming}
            className="rounded-lg border border-ink-500 px-5 py-2.5 text-sm font-semibold text-mist-200 transition hover:bg-white/5"
          >
            Back to Gaming Fest
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div
        className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm text-mist-200 ${a.borderSoft} ${a.bgFaint}`}
      >
        <TicketIcon className={`mt-0.5 h-4 w-4 shrink-0 ${a.text}`} />
        <span>
          Entry fee is <strong className="font-semibold text-white">{game.tournament.entryFee}</strong>,
          collected on-site at the registration desk — no payment is taken through
          this website. Registration closes on{' '}
          <strong className="font-semibold text-white">{game.tournament.deadline}</strong>.
        </span>
      </div>

      {submitError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {submitError}
        </div>
      )}

      {sections.map((section) => (
        <SectionCard
          key={section.key}
          title={section.title}
          subtitle={section.subtitle}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {section.fields.map((field) => {
              const error = at(errors, field.name);
              const span = field.full || field.type === 'checkbox' ? 'md:col-span-2' : '';

              if (field.type === 'checkbox') {
                return (
                  <div key={field.name} className={span}>
                    <CheckboxField
                      label={field.label}
                      name={field.name}
                      register={registerField}
                      error={error}
                      required={field.required}
                    />
                  </div>
                );
              }

              if (field.type === 'select') {
                return (
                  <div key={field.name} className={span}>
                    <SelectField
                      label={field.label}
                      name={field.name}
                      options={field.options}
                      register={registerField}
                      error={error}
                      required={field.required}
                      placeholder={field.placeholder}
                    />
                  </div>
                );
              }

              return (
                <div key={field.name} className={span}>
                  <FormField
                    label={field.label}
                    name={field.name}
                    type={field.type || 'text'}
                    placeholder={field.placeholder}
                    register={registerField}
                    error={error}
                    required={field.required}
                    autoComplete={field.autoComplete}
                    hint={field.hint}
                  />
                </div>
              );
            })}
          </div>
        </SectionCard>
      ))}

      <div className="flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-between">
        <Link
          href={ROUTES.gaming}
          className="rounded-lg border border-ink-500 px-5 py-2.5 text-sm font-semibold text-mist-200 transition hover:bg-white/5"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gold-400 px-7 py-3 text-sm font-bold text-ink-950 shadow-glow-gold transition hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
        >
          {loading && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-900 border-t-transparent" />
          )}
          {loading ? 'Submitting...' : `Submit ${game.shortName} registration`}
        </button>
      </div>
    </form>
  );
};

export default GameRegistrationForm;
