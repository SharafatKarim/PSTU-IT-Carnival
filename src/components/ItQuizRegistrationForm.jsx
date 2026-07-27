'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import FormField from './FormField';
import FileField from './FileField';
import AutocompleteField from './AutocompleteField';
import SectionCard from './SectionCard';
import CheckboxField from './gaming/CheckboxField';
import TurnstileWidget, { isTurnstileConfigured } from './TurnstileWidget';
import { CheckIcon, AlertIcon } from './landing/Icons';
import { ROUTES } from '@/lib/routes';
import { getEventDetail } from '@/data/events';
import { searchUniversities } from '@/data/universities';
import { BD_PHONE_RE, EMAIL_RE, PHONE_HINT } from '@/lib/patterns';

// ---------------------------------------------------------------------------
// IT Quiz registration — one person, three sections, exactly as specified.
//
// Two things here are different from every other form on the site.
//
// 1. Email is OPTIONAL. Someone without one is contacted on WhatsApp, which is
//    why that field is required and this is not. The validation only runs when
//    something has been typed, so a blank box submits cleanly.
//
// 2. Payment is "transaction ID OR screenshot". Neither field can be marked
//    required on its own; the pair is checked together, on both sides. The
//    screenshot is shrunk in the browser before it is sent — see
//    lib/downscale.js — because the audience is on mobile data.
// ---------------------------------------------------------------------------

const ENDPOINT = '/api/v1/events/it-quiz/registrations';

export default function ItQuizRegistrationForm() {
  const event = getEventDetail('it-quiz');
  const entry = event?.entry;

  const [step, setStep] = useState('form');
  const [successData, setSuccessData] = useState(null);
  const [serverError, setServerError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [captchaToken, setCaptchaToken] = useState(null);
  const [screenshot, setScreenshot] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      whatsapp: '',
      universityName: '',
      academicId: '',
      faculty: '',
      semester: '',
      session: '',
      paymentMethod: entry?.methods?.[0] || 'bKash',
      transactionId: '',
      agreeInfo: false,
      agreeRules: false,
    },
  });

  const universityName = watch('universityName');
  const transactionId = watch('transactionId');

  const onCaptchaToken = useCallback((token) => setCaptchaToken(token), []);

  const onSubmit = async (data) => {
    /* Checked here as well as on the server so someone who filled in neither
       is told before a 3 MB upload, not after it. */
    if (!data.transactionId.trim() && !screenshot) {
      setServerError(
        'Enter the transaction ID, or attach a screenshot of the payment.'
      );
      return;
    }

    setStep('submitting');
    setServerError('');
    setFieldErrors({});

    const payload = {
      ...data,
      receiverNumber: entry?.receiverNumber || '',
      turnstileToken: captchaToken,
    };

    try {
      /* Multipart only when there is a file. Without one this stays a plain
         JSON post, which keeps the small-body path and its tighter size cap. */
      let res;
      if (screenshot) {
        const form = new FormData();
        form.append('payload', JSON.stringify(payload));
        form.append('screenshot', screenshot);
        res = await fetch(ENDPOINT, { method: 'POST', body: form });
      } else {
        res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const result = await res.json();
      if (res.ok && result.success) {
        setSuccessData(result.data);
        setStep('success');
        return;
      }

      /* Field errors land on their field; anything else goes to the banner. */
      if (Array.isArray(result.errors)) {
        setFieldErrors(
          Object.fromEntries(result.errors.map((e) => [e.field, e.message]))
        );
      }
      setServerError(result.message || 'Please check the highlighted fields.');
      setStep('form');
    } catch {
      setServerError('Network error. Please try again.');
      setStep('form');
    }
  };

  const awaitingCaptcha = isTurnstileConfigured && !captchaToken;
  const errorFor = (name) =>
    errors[name] || (fieldErrors[name] ? { message: fieldErrors[name] } : undefined);

  if (step === 'success') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
        {/* Emerald, not gold. Gold on this site means "this is a button" — the
            datathon success panel breaks that rule and this one does not. */}
        <div className="rounded-2xl border border-emerald-400/30 bg-ink-900/70 p-8 text-center shadow-card">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
            <CheckIcon className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-2xl font-extrabold text-white">
            Registration submitted
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-mist-300">
            Your IT Quiz entry is in. It is confirmed once we have checked the
            payment.
          </p>

          <div className="my-8 rounded-xl border border-ink-600 bg-ink-950/80 p-6">
            <span className="block text-xs font-bold uppercase tracking-widest text-mist-400">
              Your registration ID
            </span>
            <span className="mt-2 block select-all font-mono text-3xl font-extrabold text-white">
              {successData?.registrationId}
            </span>
            <p className="mt-3 text-xs leading-relaxed text-mist-400">
              Save this. It is your reference for anything to do with your entry.
            </p>
          </div>

          <Link
            href={ROUTES.event('it-quiz')}
            className="inline-flex items-center gap-2 rounded-xl bg-gold-400 px-6 py-3 text-sm font-bold text-ink-950 shadow-glow-gold transition hover:bg-gold-300"
          >
            Back to IT Quiz
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          IT Quiz registration
        </h1>
        <p className="mt-3 max-w-[62ch] text-base leading-relaxed text-mist-300">
          Individual entry. {entry?.feeLabel || '৳50 per participant'}.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {serverError && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400"
          >
            <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />
            <p>{serverError}</p>
          </div>
        )}

        <SectionCard
          title="Personal information"
          subtitle="Step 1 of 3"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Full Name"
              name="fullName"
              required
              placeholder="As it appears on your student ID"
              register={(n) => register(n, {
                  required: 'Full name is required',
                  maxLength: { value: 100, message: 'Cannot exceed 100 characters' },
                })}
              error={errorFor('fullName')}
            />

            <FormField
              label="Email Address"
              name="email"
              type="email"
              placeholder="Optional"
              autoComplete="email"
              hint="Optional — we will use WhatsApp if you leave this blank."
              register={(n) => register(n, {
                  validate: (value) =>
                    !value?.trim() ||
                    EMAIL_RE.test(value.trim()) ||
                    'Enter a valid email address',
                })}
              error={errorFor('email')}
            />

            <FormField
              label="WhatsApp Number"
              name="whatsapp"
              required
              placeholder="01XXXXXXXXX"
              autoComplete="tel"
              hint={PHONE_HINT}
              register={(n) => register(n, {
                  required: 'WhatsApp number is required',
                  validate: (value) =>
                    BD_PHONE_RE.test(value.trim()) ||
                    `Enter a valid Bangladeshi number. ${PHONE_HINT}`,
                })}
              error={errorFor('whatsapp')}
            />

            {/* Suggestions, not a closed list — a student from an unlisted
                university can still type their own. */}
            <AutocompleteField
              label="University Name"
              name="universityName"
              required
              value={universityName}
              search={searchUniversities}
              onSelect={(option) =>
                setValue('universityName', option.name, { shouldValidate: true })
              }
              register={(n) => register(n, { required: 'University name is required' })}
              error={errorFor('universityName')}
            />

            <FormField
              label="Academic ID"
              name="academicId"
              required
              placeholder="Your student ID"
              register={(n) => register(n, { required: 'Academic ID is required' })}
              error={errorFor('academicId')}
            />

            {/* Free text by the owner's decision — no faculty, semester or
                session list was given, so none is invented. */}
            <FormField
              label="Faculty"
              name="faculty"
              required
              placeholder="e.g. Computer Science and Engineering"
              register={(n) => register(n, { required: 'Faculty is required' })}
              error={errorFor('faculty')}
            />

            <FormField
              label="Semester"
              name="semester"
              required
              placeholder="e.g. 5th"
              register={(n) => register(n, { required: 'Semester is required' })}
              error={errorFor('semester')}
            />

            <FormField
              label="Session"
              name="session"
              required
              placeholder="e.g. 2021-22"
              register={(n) => register(n, { required: 'Session is required' })}
              error={errorFor('session')}
            />
          </div>
        </SectionCard>

        <SectionCard
          title={`Payment — ${entry?.feeLabel || '৳50'}`}
          subtitle="Step 2 of 3"
        >
          {entry?.receiverNumber ? (
            <p className="mb-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-mist-300">
              Send <strong className="text-white">৳{entry.fee}</strong> to{' '}
              <strong className="text-white tabular-nums">
                {entry.receiverNumber}
              </strong>
              , then give us either the transaction ID or a screenshot.
            </p>
          ) : (
            /* The number has not been published. Saying so is the only honest
               option — a form that asks for a transaction ID without telling
               anyone where to send the money is worse than one that waits. */
            <p className="mb-4 flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-mist-300">
              <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-mist-400" />
              <span>The payment number has not been published yet.</span>
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Transaction ID"
              name="transactionId"
              placeholder="e.g. 9F2K7XQ1LM"
              hint="Either this or a screenshot — you do not need both."
              register={register}
              error={errorFor('transactionId')}
            />

            <FileField
              label="Payment Screenshot"
              name="screenshot"
              onChange={setScreenshot}
              error={fieldErrors.screenshot}
              hint={
                transactionId?.trim()
                  ? 'Optional — you have given a transaction ID.'
                  : 'Required unless you enter a transaction ID above.'
              }
            />
          </div>
        </SectionCard>

        <SectionCard title="Confirmation" subtitle="Step 3 of 3">
          <div className="space-y-3">
            <CheckboxField
              label="I confirm that the information provided is correct."
              name="agreeInfo"
              register={(n) => register(n, {
                  required: 'Please confirm your information is correct',
                })}
              error={errorFor('agreeInfo')}
            />
            <CheckboxField
              label="I agree to follow all tournament rules and decisions made by the organizers."
              name="agreeRules"
              register={(n) => register(n, { required: 'Please agree to the rules' })}
              error={errorFor('agreeRules')}
            />
          </div>
        </SectionCard>

        <TurnstileWidget onToken={onCaptchaToken} />

        <button
          type="submit"
          disabled={step === 'submitting' || awaitingCaptcha}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold-400 px-6 py-3.5 text-sm font-bold text-ink-950 shadow-glow-gold transition hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {step === 'submitting'
            ? 'Submitting…'
            : awaitingCaptcha
              ? 'Waiting for the check…'
              : 'Submit registration'}
        </button>
      </form>
    </div>
  );
}
