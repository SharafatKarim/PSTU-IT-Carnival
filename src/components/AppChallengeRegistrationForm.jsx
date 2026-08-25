'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import FormField from './FormField';
import SectionCard from './SectionCard';
import CheckboxField from './gaming/CheckboxField';
import TurnstileWidget, { isTurnstileConfigured } from './TurnstileWidget';
import { CheckIcon, AlertIcon } from './landing/Icons';
import { ROUTES } from '@/lib/routes';
import { getEventDetail } from '@/data/events';
import { EMAIL_RE } from '@/lib/patterns';

const ENDPOINT = '/api/v1/events/app-challenge/registrations';

export default function AppChallengeRegistrationForm() {
  const event = getEventDetail('app-challenge');

  const [step, setStep] = useState('form');
  const [successData, setSuccessData] = useState(null);
  const [serverError, setServerError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [captchaToken, setCaptchaToken] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      appName: '',
      shortAbstract: '',
      fullName: '',
      studentId: '',
      email: '',
      agreeInfo: false,
      agreeRules: false,
    },
  });

  const onCaptchaToken = useCallback((token) => setCaptchaToken(token), []);

  const onSubmit = async (data) => {
    setStep('submitting');
    setServerError('');
    setFieldErrors({});

    const payload = {
      ...data,
      turnstileToken: captchaToken,
    };

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setSuccessData(result.data);
        setStep('success');
        return;
      }

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
        <div className="rounded-2xl border border-emerald-400/30 bg-ink-900/70 p-8 text-center shadow-card">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
            <CheckIcon className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-2xl font-extrabold text-white">
            Registration Submitted
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-mist-300">
            Your entry for App Challenge has been successfully recorded.
          </p>

          <div className="my-8 rounded-xl border border-ink-600 bg-ink-950/80 p-6">
            <span className="block text-xs font-bold uppercase tracking-widest text-mist-400">
              Your Registration ID
            </span>
            <span className="mt-2 block select-all font-mono text-3xl font-extrabold text-white">
              {successData?.registrationId}
            </span>
            <p className="mt-3 text-xs leading-relaxed text-mist-400">
              Save this ID. Keep it handy on the event day along with your live app demonstration and pptx presentation.
            </p>
          </div>

          <Link
            href={ROUTES.event('app-challenge')}
            className="inline-flex items-center gap-2 rounded-xl bg-magenta-500 px-6 py-3 text-sm font-bold text-white shadow-glow-magenta transition hover:bg-magenta-400"
          >
            Back to App Challenge
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Register for App Challenge
        </h1>
        <p className="mt-2 text-sm text-mist-300">
          Free Registration · Sponsored by <span className="font-semibold text-magenta-300">BDAPPS</span>
        </p>
      </div>

      {serverError && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />
          <div>{serverError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <SectionCard title="App Details" description="Information about your mobile application">
          <div className="grid gap-4 sm:grid-cols-1">
            <FormField
              label="App's Name"
              name="appName"
              required
              error={errorFor('appName')}
              register={(n) => register(n, { required: "App's name is required" })}
              placeholder="e.g. Smart Campus Assistant"
            />
            <div>
              <label className="block text-xs font-semibold text-mist-300 mb-1.5">
                Short Abstract <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={4}
                {...register('shortAbstract', { required: 'Short abstract is required' })}
                placeholder="Briefly describe what your mobile app does, its core features, and technology stack..."
                className="w-full rounded-xl border border-ink-600 bg-ink-950/80 px-4 py-3 text-sm text-white placeholder:text-mist-500 focus:border-magenta-400 focus:outline-none focus:ring-1 focus:ring-magenta-400"
              />
              {errorFor('shortAbstract') && (
                <p className="mt-1 text-xs text-red-400">{errorFor('shortAbstract').message}</p>
              )}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Developer Information" description="Your personal and academic details">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Full Name"
              name="fullName"
              required
              error={errorFor('fullName')}
              register={(n) => register(n, { required: 'Full name is required' })}
              placeholder="Your full name"
            />
            <FormField
              label="Student ID"
              name="studentId"
              required
              error={errorFor('studentId')}
              register={(n) => register(n, { required: 'Student ID is required' })}
              placeholder="e.g. 2102001"
            />
          </div>
          <div className="mt-4">
            <FormField
              label="Email Address"
              name="email"
              type="email"
              required
              error={errorFor('email')}
              register={(n) =>
                register(n, {
                  required: 'Email address is required',
                  pattern: { value: EMAIL_RE, message: 'Enter a valid email address' },
                })
              }
              placeholder="your.email@example.com"
            />
          </div>
        </SectionCard>

        <SectionCard title="Confirmation & Rules">
          <div className="space-y-3">
            <CheckboxField
              label="I confirm that all information provided is accurate and my app is fully functional and ready for live demonstration."
              name="agreeInfo"
              register={(n) =>
                register(n, {
                  required: 'Please confirm information correctness',
                })
              }
              error={errorFor('agreeInfo')}
            />
            <CheckboxField
              label="I agree to the App Challenge rules, including presenting a live demonstration and PPTX presentation onsite."
              name="agreeRules"
              register={(n) =>
                register(n, {
                  required: 'Please agree to event rules',
                })
              }
              error={errorFor('agreeRules')}
            />
          </div>
        </SectionCard>

        {isTurnstileConfigured && (
          <div className="my-4 flex justify-center">
            <TurnstileWidget onVerify={onCaptchaToken} />
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={step === 'submitting' || awaitingCaptcha}
            className="w-full rounded-xl bg-magenta-500 py-3.5 text-sm font-bold text-white shadow-glow-magenta transition hover:bg-magenta-400 disabled:opacity-50 sm:w-auto sm:px-8"
          >
            {step === 'submitting' ? 'Submitting...' : 'Submit Registration'}
          </button>
        </div>
      </form>
    </div>
  );
}
