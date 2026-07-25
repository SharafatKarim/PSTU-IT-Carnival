'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import FormField from './FormField';
import SectionCard from './SectionCard';
import MemberForm from './MemberForm';
import ReviewSection from './ReviewSection';
import { CheckIcon, CalendarIcon } from './landing/Icons';
import { createRegistration } from '../services/api';

const BD_PHONE_RE = /^(?:\+?880)?1[3-9]\d{8}$/;

const T_SHIRT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const STEPS = [
  { key: 'team', label: 'Team & Coach' },
  { key: 'members', label: 'Members' },
  { key: 'review', label: 'Review' },
];

// Field names validated before leaving each input step (review has none).
const STEP_FIELDS = [
  ['teamName', 'varsityName', 'coach.name', 'coach.email', 'coach.phone'],
  [0, 1, 2].flatMap((i) => [
    `members.${i}.name`,
    `members.${i}.email`,
    `members.${i}.phone`,
    `members.${i}.codeforcesHandle`,
    `members.${i}.tshirtSize`,
  ]),
];

const emptyMember = () => ({
  name: '',
  email: '',
  phone: '',
  codeforcesHandle: '',
  tshirtSize: '',
});

const defaultValues = {
  teamName: '',
  varsityName: '',
  coach: { name: '', email: '', phone: '' },
  members: [emptyMember(), emptyMember(), emptyMember()],
};

const buildRules = (getValues) => ({
  teamName: {
    required: 'Team name is required',
    minLength: { value: 3, message: 'Team name must be at least 3 characters' },
    maxLength: { value: 100, message: 'Team name cannot exceed 100 characters' },
  },
  varsityName: {
    required: 'Varsity name is required',
    maxLength: { value: 150, message: 'Varsity name cannot exceed 150 characters' },
  },
  'coach.name': {
    required: 'Coach name is required',
    maxLength: { value: 100, message: 'Coach name cannot exceed 100 characters' },
  },
  'coach.email': {
    required: 'Coach email is required',
    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Please enter a valid email' },
  },
  'coach.phone': {
    required: 'Coach phone is required',
    pattern: {
      value: BD_PHONE_RE,
      message: 'Use 017XXXXXXXX or +88017XXXXXXXX',
    },
  },
  'members.0.name': memberNameRule(0),
  'members.0.email': memberEmailRule(0, getValues),
  'members.0.phone': memberPhoneRule(0),
  'members.0.codeforcesHandle': memberHandleRule(0, getValues),
  'members.0.tshirtSize': tshirtSizeRule(0),
  'members.1.name': memberNameRule(1),
  'members.1.email': memberEmailRule(1, getValues),
  'members.1.phone': memberPhoneRule(1),
  'members.1.codeforcesHandle': memberHandleRule(1, getValues),
  'members.1.tshirtSize': tshirtSizeRule(1),
  'members.2.name': memberNameRule(2),
  'members.2.email': memberEmailRule(2, getValues),
  'members.2.phone': memberPhoneRule(2),
  'members.2.codeforcesHandle': memberHandleRule(2, getValues),
  'members.2.tshirtSize': tshirtSizeRule(2),
});

function memberNameRule(i) {
  return {
    required: `Member ${i + 1} name is required`,
    maxLength: { value: 100, message: 'Name cannot exceed 100 characters' },
  };
}

function memberPhoneRule(i) {
  return {
    required: `Member ${i + 1} phone is required`,
    pattern: {
      value: BD_PHONE_RE,
      message: 'Use +88017XXXXXXXX',
    },
  };
}

function tshirtSizeRule(i) {
  return {
    required: `Member ${i + 1} t-shirt size is required`,
    validate: (v) => T_SHIRT_SIZES.includes(v) || 'Select a valid t-shirt size',
  };
}

function memberEmailRule(i, getValues) {
  return {
    required: `Member ${i + 1} email is required`,
    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Please enter a valid email' },
    validate: (v) => {
      if (!v) return true;
      const all = getValues('members') || [];
      const lower = v.toLowerCase().trim();
      const dupes = all.filter(
        (m, j) => j !== i && m?.email?.toLowerCase().trim() === lower
      );
      return dupes.length === 0 || 'Each member email must be different';
    },
  };
}

function memberHandleRule(i, getValues) {
  return {
    required: `Member ${i + 1} Codeforces handle is required`,
    minLength: { value: 2, message: 'Handle must be at least 2 characters' },
    maxLength: { value: 50, message: 'Handle cannot exceed 50 characters' },
    validate: (v) => {
      if (!v) return true;
      const all = getValues('members') || [];
      const lower = v.toLowerCase().trim();
      const dupes = all.filter(
        (m, j) => j !== i && m?.codeforcesHandle?.toLowerCase().trim() === lower
      );
      return dupes.length === 0 || 'Each Codeforces handle must be different';
    },
  };
}

const StepIndicator = ({ current }) => (
  <div className="mt-6">
    <ol className="flex items-center">
      {STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li
            key={s.key}
            className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold transition ${
                  done
                    ? 'bg-gold-400 text-ink-950'
                    : active
                      ? 'bg-carnival text-white shadow-glow-grape ring-2 ring-grape-400/50'
                      : 'border border-ink-500 bg-ink-700 text-mist-400'
                }`}
              >
                {done ? <CheckIcon className="h-4 w-4" /> : i + 1}
              </span>
              <span
                className={`hidden text-sm font-semibold sm:inline ${
                  active
                    ? 'text-white'
                    : done
                      ? 'text-gold-300'
                      : 'text-mist-400'
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                className={`mx-3 h-0.5 flex-1 rounded-full ${
                  done ? 'bg-gold-400/60' : 'bg-ink-600'
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  </div>
);

const RegistrationForm = ({ onBack }) => {
  const {
    register,
    getValues,
    trigger,
    formState: { errors },
  } = useForm({ defaultValues, mode: 'onTouched', shouldUnregister: false });

  // getValues is stable, so the rules object is built once, not per field.
  const rules = useMemo(() => buildRules(getValues), [getValues]);
  const registerWithRules = (name) =>
    rules[name] ? register(name, rules[name]) : register(name);

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [registrationId, setRegistrationId] = useState(null);
  const [done, setDone] = useState(false);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const goNext = async () => {
    const valid = await trigger(STEP_FIELDS[step]);
    if (!valid) return;
    setServerError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    scrollTop();
  };

  const goBack = () => {
    setServerError(null);
    setStep((s) => Math.max(s - 1, 0));
    scrollTop();
  };

  const onConfirmSubmit = async () => {
    setLoading(true);
    setServerError(null);
    try {
      const payload = getValues();
      const res = await createRegistration(payload);
      setRegistrationId(res.data.registrationId);
      setDone(true);
      scrollTop();
    } catch (err) {
      const data = err?.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        setServerError({
          message: data.message || 'Validation failed',
          details: data.errors,
        });
      } else {
        setServerError({
          message: data?.message || err.message || 'Something went wrong',
          details: [],
        });
      }
      scrollTop();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="relative overflow-hidden bg-ink-950 text-white">
        <div className="absolute inset-0 bg-hero" />
        <div className="absolute inset-0 bg-grid bg-[size:44px_44px] opacity-40" />
        <div className="relative mx-auto max-w-4xl px-4 py-10 sm:py-14">
          <button
            type="button"
            onClick={onBack}
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-mist-200 transition hover:text-white"
          >
            <span aria-hidden="true">←</span> Back to home
          </button>
          <p className="text-xs font-semibold uppercase tracking-widest text-aqua-400">
            Patuakhali Science and Technology University
          </p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            <span className="text-white">PSTU </span>
            <span className="text-gradient-title">IT Carnival</span>
            <span className="text-white"> 2026</span>
          </h1>
          <p className="mt-2 text-lg font-medium text-mist-200">
            IUPC (South Zone) — Pre-Registration
          </p>
        </div>
      </header>

      <main className="mx-auto -mt-8 max-w-4xl px-4 pb-16 sm:-mt-10">
        <div className="rounded-2xl border border-ink-600 bg-ink-800/70 p-6 shadow-card backdrop-blur sm:p-8">
          {done ? (
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-6 text-center sm:p-8">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
                <CheckIcon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-emerald-300">
                Registration submitted!
              </h3>
              <p className="mt-2 text-sm text-emerald-200/80">
                Your registration ID is
              </p>
              <p className="mt-2 inline-block rounded-md border border-white/10 bg-ink-900 px-4 py-2 font-mono text-lg font-bold text-white shadow">
                {registrationId}
              </p>
              <p className="mt-4 text-sm text-emerald-200/80">
                Please save this ID for future reference.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={onBack}
                  className="rounded-lg border border-emerald-400/40 px-5 py-2.5 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-400/10"
                >
                  Return to home
                </button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  IUPC Pre-Registration Form
                </h2>
                <p className="mt-1 text-sm text-mist-300">
                  {step === 0 &&
                    'Start with your team and coach details for the IUPC (South Zone) contest.'}
                  {step === 1 &&
                    'Add your three team members. Emails and Codeforces handles must be unique.'}
                  {step === 2 &&
                    'Review everything below, then confirm to complete your pre-registration.'}
                </p>
              </div>

              <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-aqua-400/25 bg-aqua-400/[0.07] px-4 py-3 text-sm text-mist-200">
                <CalendarIcon className="mt-0.5 h-4 w-4 shrink-0 text-aqua-300" />
                <span>
                  The IUPC (South Zone) contest will be held on{' '}
                  <strong className="font-semibold text-white">
                    13 August 2026
                  </strong>{' '}
                  at CSE–FBA Building, PSTU.
                </span>
              </div>

              <StepIndicator current={step} />

              {serverError && (
                <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                  <p className="font-semibold">{serverError.message}</p>
                  {serverError.details?.length > 0 && (
                    <ul className="mt-2 list-inside list-disc">
                      {serverError.details.map((e, i) => (
                        <li key={i}>
                          <span className="font-medium">{e.field}:</span>{' '}
                          {e.message}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (step < STEPS.length - 1) goNext();
                }}
                className="mt-8 space-y-6"
              >
                {step === 0 && (
                  <>
                    <SectionCard title="Team Information">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField
                           label="Team Name"
                           name="teamName"
                           placeholder="e.g. Code Wizards"
                           register={registerWithRules}
                           error={errors.teamName}
                           required
                           autoComplete="off"
                        />
                        <FormField
                           label="Varsity Name"
                           name="varsityName"
                           placeholder="e.g. Patuakhali Science and Technology University"
                           register={registerWithRules}
                           error={errors.varsityName}
                           required
                           autoComplete="organization"
                        />
                      </div>
                    </SectionCard>

                    <SectionCard title="Coach Information">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField
                          label="Coach Name"
                          name="coach.name"
                          placeholder="e.g. Dr. Karim"
                          register={registerWithRules}
                          error={errors.coach?.name}
                          required
                          autoComplete="name"
                        />
                        <FormField
                          label="Coach Email"
                          name="coach.email"
                          type="email"
                          placeholder="coach@example.com"
                          register={registerWithRules}
                          error={errors.coach?.email}
                          required
                          autoComplete="email"
                        />
                        <FormField
                          label="Coach Phone Number"
                          name="coach.phone"
                          placeholder="017XXXXXXXX or +88017XXXXXXXX"
                          register={registerWithRules}
                          error={errors.coach?.phone}
                          required
                          autoComplete="tel"
                        />
                      </div>
                    </SectionCard>
                  </>
                )}

                {step === 1 && (
                  <SectionCard
                    title="Team Members"
                    subtitle="Each team must have exactly 3 members. Use the form below for each one."
                  >
                    <div className="space-y-5">
                      {[0, 1, 2].map((i) => (
                        <MemberForm
                          key={i}
                          index={i}
                          register={registerWithRules}
                          errors={errors}
                        />
                      ))}
                    </div>
                  </SectionCard>
                )}

                {step === 2 && (
                  <SectionCard title="Review Your Details">
                    <ReviewSection data={getValues()} />
                  </SectionCard>
                )}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={step === 0 ? onBack : goBack}
                    className="rounded-lg border border-ink-500 px-5 py-2.5 text-sm font-semibold text-mist-200 transition hover:bg-white/5"
                  >
                    {step === 0 ? 'Cancel' : 'Back'}
                  </button>

                  <div className="flex items-center gap-3 sm:justify-end">
                    <span className="hidden text-xs text-mist-500 sm:inline">
                      Step {step + 1} of {STEPS.length}
                    </span>
                    {step < STEPS.length - 1 ? (
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-lg bg-gold-400 px-6 py-2.5 text-sm font-bold text-ink-950 shadow-glow-gold transition hover:bg-gold-300"
                      >
                        {step === 0 ? 'Continue' : 'Continue to review'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={onConfirmSubmit}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold-400 px-6 py-2.5 text-sm font-bold text-ink-950 shadow-glow-gold transition hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {loading && (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-900 border-t-transparent" />
                        )}
                        {loading ? 'Submitting...' : 'Confirm & submit'}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-mist-500">
          © 2026 PSTU IT Carnival
        </p>
      </main>
    </div>
  );
};

export default RegistrationForm;
