'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useForm, useWatch } from 'react-hook-form';
import FormField from '@/components/FormField';
import SelectField from '@/components/SelectField';
import SectionCard from '@/components/SectionCard';
import TurnstileWidget, { isTurnstileConfigured } from '@/components/TurnstileWidget';
import CheckboxField from './CheckboxField';
import FileField from '@/components/FileField';
import ChoiceField from './ChoiceField';
import { CheckIcon, AlertIcon, TicketIcon } from '@/components/landing/Icons';
import { submitGameRegistration } from '@/services/events/gaming';
import {
  visibleSections,
  feeFor,
  isFreeEntry,
  playersRequired,
  PAYMENT_METHODS,
  GAMING_PAYMENT,
} from '@/data/gaming';
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

const emptyValue = (field) => {
  if (field.defaultValue !== undefined) return field.defaultValue;
  return field.type === 'checkbox' ? false : '';
};

/* Defaults for EVERY section, including the ones currently hidden — a section
   that appears later still needs its fields seeded. */
const buildDefaults = (sections) => {
  const defaults = {};
  sections.forEach((section) =>
    (section.fields || []).forEach((field) =>
      setPath(defaults, field.name, emptyValue(field))
    )
  );
  return defaults;
};

/* Titles may be a string or a function of the current answers, so one section
   can serve both entry types. */
const resolve = (value, values) =>
  typeof value === 'function' ? value(values) : value;

/* "players.2.gameId" -> must not duplicate players[*].gameId on any other row. */
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
        : field.type === 'choice'
          ? 'Please choose one'
          : `${field.label} is required`;
  } else if (rules.pattern) {
    // An optional field left blank must stay valid, so its pattern only runs
    // once something has actually been typed.
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

/* --- pieces --------------------------------------------------------------- */

/* A section may carry a notice instead of fields (the "we will form a random
   squad for you" warning), or alongside them. */
const Notice = ({ notice, accent }) => (
  <div
    className={`flex items-start gap-3 rounded-xl border p-4 ${accent.borderSoft} ${accent.bgFaint}`}
  >
    <AlertIcon className={`mt-0.5 h-5 w-5 shrink-0 ${accent.text}`} />
    <div>
      {notice.title && (
        <p className="text-sm font-bold text-white">{notice.title}</p>
      )}
      <p className="mt-1 text-sm leading-relaxed text-mist-300">{notice.text}</p>
    </div>
  </div>
);

const PAYMENT_METHOD_LABEL = PAYMENT_METHODS.join(' · ');

/* Where a checkbox label's `to` token points. Resolved here rather than in
   src/data/gaming.js because routes.js imports that file — building hrefs
   there would close the cycle.

   Both targets are sections of the game's own detail page, which is where the
   rules and the coordinators actually live. Nothing links to a terms or
   privacy route, because the site does not have one. */
const LABEL_LINKS = {
  rules: (game) => `${ROUTES.game(game.slug)}#rules`,
  contact: (game) => `${ROUTES.game(game.slug)}#contact`,
};

const resolveLinks = (field, game) =>
  field.links
    ?.map(({ text, to }) => ({ text, href: LABEL_LINKS[to]?.(game) }))
    .filter((link) => link.href);

/* The "send it here" panel above the payment fields. The amount is derived
   from the entry type, so a squad is told ৳100 and an individual ৳25 rather
   than both being shown a per-player figure to multiply themselves. */
const PayTo = ({ game, entryType, account, accent }) => {
  const amount = feeFor(game, entryType);
  const heads = playersRequired(game, entryType);

  return (
    <div
      className={`mb-6 overflow-hidden rounded-xl border ${accent.borderSoft} ${accent.bgFaint}`}
    >
      <div className="grid gap-px bg-white/5 sm:grid-cols-3">
        <div className="bg-ink-900/60 px-4 py-3.5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-mist-500">
            Amount to send
          </p>
          <p className={`mt-1 text-xl font-extrabold ${accent.text}`}>৳{amount}</p>
          {/* Same fallback feeFor() uses — a game can publish its fee before
              it publishes its date, so the per-player figure is not always on
              the tournament block. */}
          <p className="mt-0.5 text-[11px] text-mist-500">
            ৳{game.tournament?.feePerPlayer ?? game.feePerPlayer} × {heads}{' '}
            player{heads === 1 ? '' : 's'}
          </p>
        </div>

        <div className="bg-ink-900/60 px-4 py-3.5 sm:col-span-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-mist-500">
            Send to {account.accountType ? `(${account.accountType})` : ''}
          </p>
          <p className="mt-1 select-all font-mono text-xl font-extrabold text-white">
            {account.number}
          </p>
          <p className="mt-0.5 text-[11px] text-mist-500">
            Accepted: {account.methods ? account.methods.join(' · ') : PAYMENT_METHOD_LABEL}
          </p>
        </div>
      </div>

      {account.instructions && (
        <p className="border-t border-white/5 px-4 py-3 text-xs leading-relaxed text-mist-300">
          {account.instructions}
        </p>
      )}
    </div>
  );
};

/* --- form ----------------------------------------------------------------- */

const GameRegistrationForm = ({ game }) => {
  const a = accentOf(game.accent);
  const allSections = game.registration.sections;

  const {
    register,
    handleSubmit,
    getValues,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: useMemo(() => buildDefaults(allSections), [allSections]),
    mode: 'onTouched',
    /* Fields belonging to a hidden section unregister when it unmounts, so an
       individual entrant is neither validated against the squad roster nor
       submits empty rows for it. Forms with no conditional sections never
       unmount anything, so nothing changes for them. */
    shouldUnregister: true,
  });

  /* The only answer that changes the shape of the form. Watching this one
     field rather than the whole form keeps typing from re-rendering every
     section on every keystroke. */
  const entryType = useWatch({ control, name: 'entryType' });
  const values = useMemo(() => ({ entryType }), [entryType]);
  const sections = useMemo(
    () => visibleSections(game, values),
    [game, values]
  );

  /* eFootball fixes its entry type in the data and never asks; the amount due
     still has to be worked out from something. */
  const resolvedEntryType = game.registration.entryType || entryType;

  /* A constant, not a lookup — see the note on GAMING_PAYMENT in
     src/data/gaming.js. This route touches no database at all. */
  const account = game.payment || GAMING_PAYMENT;

  /* Rules are built from every section, not just the visible ones: a section
     that appears mid-fill must already have its rules ready. */
  const registerField = useMemo(() => {
    const ruleMap = {};
    allSections.forEach((section) =>
      (section.fields || []).forEach((field) => {
        ruleMap[field.name] = rulesFor(field, getValues);
      })
    );
    return (name) => register(name, ruleMap[name]);
  }, [allSections, register, getValues]);

  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [reference, setReference] = useState(null);
  const [token, setToken] = useState(null);
  /* Held outside react-hook-form: the file that gets sent is the one
     lib/downscale.js produced, not the one the input holds. */
  const [screenshot, setScreenshot] = useState(null);

  /* Whether this tournament asks for one at all, so a missing file is caught
     before the upload rather than by the server. */
  const screenshotField = useMemo(
    () =>
      allSections
        .flatMap((section) => section.fields || [])
        .find((field) => field.type === 'file'),
    [allSections]
  );

  const onToken = useCallback((value) => setToken(value), []);

  const onSubmit = async (formValues) => {
    if (isTurnstileConfigured && !token) {
      setSubmitError('Please complete the verification challenge before submitting.');
      return;
    }

    if (screenshotField?.required && !screenshot) {
      setSubmitError(`${screenshotField.label} is required.`);
      return;
    }

    setLoading(true);
    setSubmitError(null);
    try {
      const res = await submitGameRegistration(
        game,
        {
          ...formValues,
          /* eFootball never asks — its entry type is fixed in the data. */
          entryType: game.registration.entryType || formValues.entryType,
          turnstileToken: token,
        },
        screenshot
      );
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
    setToken(null);
    setScreenshot(null);
    reset(buildDefaults(allSections));
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
        <p className="mt-2 text-sm text-emerald-200/80">Your registration ID is</p>
        <p className="mt-3 inline-block rounded-md border border-white/10 bg-ink-900 px-4 py-2 font-mono text-lg font-bold text-white shadow">
          {reference}
        </p>
        <p className="mx-auto mt-4 max-w-md text-sm text-emerald-200/80">
          A confirmation has been emailed to you. Your entry is{' '}
          <strong className="font-semibold text-emerald-200">pending</strong>{' '}
          until the committee matches your transaction ID against the wallet
          statement — it shows as confirmed on the registered list once that is
          done. Save this ID and bring it with your student ID.
        </p>

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
      {/* A tournament can take entries before its date is published — Ludo
          does. The fee is always known (feeFor falls back to the game's own
          feePerPlayer); the deadline is only mentioned when there is one, and
          reading it unguarded crashed the build. */}
      <div
        className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm text-mist-200 ${a.borderSoft} ${a.bgFaint}`}
      >
        <TicketIcon className={`mt-0.5 h-4 w-4 shrink-0 ${a.text}`} />
        <span>
          {isFreeEntry(game) ? (
            <>
              Entry is{' '}
              <strong className="font-semibold text-white">free</strong> — there
              is nothing to pay and no Payment step on this form.
            </>
          ) : (
            <>
              Entry fee is{' '}
              <strong className="font-semibold text-white">
                {game.tournament?.entryFee || `৳${feeFor(game, entryType)}`}
              </strong>
              . Pay it before you submit — the Payment step below tells you where
              to send it.
            </>
          )}
          {game.tournament?.deadline && (
            <>
              {' '}
              Registration closes on{' '}
              <strong className="font-semibold text-white">
                {game.tournament?.deadline}
              </strong>
              .
            </>
          )}
        </span>
      </div>

      {submitError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {submitError}
        </div>
      )}

      {sections.map((section) => {
        const fields = section.fields || [];

        /* Notice-only sections are a standalone banner — wrapping a single
           warning in a titled card would give it more furniture than
           content. */
        if (fields.length === 0) {
          return section.notice ? (
            <Notice key={section.key} notice={section.notice} accent={a} />
          ) : null;
        }

        return (
          <SectionCard
            key={section.key}
            title={resolve(section.title, values)}
            subtitle={resolve(section.subtitle, values)}
          >
            {section.notice && (
              <div className="mb-5">
                <Notice notice={section.notice} accent={a} />
              </div>
            )}

            {section.payment && (
              <PayTo
                game={game}
                entryType={resolvedEntryType}
                account={account}
                accent={a}
              />
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {fields.map((field) => {
                const error = at(errors, field.name);
                const span =
                  field.full || field.type === 'checkbox' || field.type === 'choice'
                    ? 'md:col-span-2'
                    : '';

                if (field.type === 'checkbox') {
                  return (
                    <div key={field.name} className={span}>
                      <CheckboxField
                        label={field.label}
                        name={field.name}
                        register={registerField}
                        error={error}
                        required={field.required}
                        links={resolveLinks(field, game)}
                      />
                    </div>
                  );
                }

                if (field.type === 'choice') {
                  return (
                    <div key={field.name} className={span}>
                      <ChoiceField
                        label={field.label}
                        name={field.name}
                        options={field.options}
                        register={registerField}
                        error={error}
                        required={field.required}
                        value={entryType}
                        accent={a}
                      />
                    </div>
                  );
                }

                /* The screenshot never goes through react-hook-form: the file
                   that gets submitted is the SHRUNK one, not the one picked,
                   so it is held in its own state and appended to the multipart
                   body by the submit handler. */
                if (field.type === 'file') {
                  return (
                    <div key={field.name} className={span}>
                      <FileField
                        label={field.label}
                        name={field.name}
                        onChange={setScreenshot}
                        error={error}
                        required={field.required}
                        hint={field.hint}
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
        );
      })}

      {isTurnstileConfigured && (
        <div className="rounded-2xl border border-ink-600 bg-ink-900/40 p-6 shadow-card sm:p-8">
          <TurnstileWidget onToken={onToken} />
        </div>
      )}

      <div className="flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-between">
        <Link
          href={ROUTES.game(game.slug)}
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
