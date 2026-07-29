'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import FormField from './FormField';
import SectionCard from './SectionCard';
import TurnstileWidget, { isTurnstileConfigured } from './TurnstileWidget';
import { CheckIcon, CalendarIcon, AlertIcon, ArrowRightIcon } from './landing/Icons';
import { ROUTES } from '@/lib/routes';
import { getEventDetail } from '@/data/events';
import { BD_PHONE_RE, EMAIL_RE, PHONE_HINT } from '@/lib/patterns';

export default function DatathonRegistrationForm() {
  const event = getEventDetail('datathon');
  const [step, setStep] = useState('form'); // 'form' | 'submitting' | 'success' | 'error'
  const [successData, setSuccessData] = useState(null);
  const [serverError, setServerError] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);
  const [hasSecondMember, setHasSecondMember] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      teamName: '',
      transactionId: '',
      members: [
        { name: '', universityName: '', universityId: '', phone: '', kaggleEmail: '', kaggleUsername: '' },
        { name: '', universityName: '', universityId: '', phone: '', kaggleEmail: '', kaggleUsername: '' },
      ],
    },
  });

  const member1 = watch('members.0');
  const member2 = watch('members.1');

  const onCaptchaToken = useCallback((token) => {
    setCaptchaToken(token);
  }, []);

  const onSubmit = async (data) => {
    setStep('submitting');
    setServerError('');

    // Filter out second member if not selected
    const submitData = {
      teamName: data.teamName,
      transactionId: data.transactionId,
      turnstileToken: captchaToken,
      members: hasSecondMember ? [data.members[0], data.members[1]] : [data.members[0]],
    };

    try {
      const res = await fetch('/api/v1/events/datathon/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setSuccessData(result.data);
        setStep('success');
      } else {
        setServerError(result.message || 'Something went wrong. Please check your inputs.');
        setStep('form');
      }
    } catch (e) {
      setServerError('Network error. Please try again.');
      setStep('form');
    }
  };

  const awaitingCaptcha = isTurnstileConfigured && !captchaToken;

  if (step === 'success') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
        <div className="rounded-2xl border border-gold-400/40 bg-ink-900/70 p-8 text-center shadow-glow-gold">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold-400/10 text-gold-300">
            <CheckIcon className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-2xl font-extrabold text-white">Registration Submitted!</h2>
          <p className="mt-2 text-sm text-mist-300 leading-relaxed">
            Your registration for the Datathon has been successfully submitted and is waiting for payment approval.
          </p>

          <div className="my-8 rounded-xl border border-grape-400/40 bg-ink-950/80 p-6">
            <span className="block text-xs font-bold uppercase tracking-widest text-grape-300">Your Registration ID</span>
            <span className="mt-2 block font-mono text-3xl font-extrabold text-gold-300 select-all">
              {successData?.registrationId || 'PSTU-DATA-2026-XXXX'}
            </span>
            <p className="mt-3 text-xs text-mist-400">
              Please save this ID. Your registration is currently pending admin payment verification. Once approved, you will receive an official confirmation email.
            </p>
          </div>

          <Link
            href={ROUTES.home}
            className="inline-flex items-center gap-2 rounded-xl bg-gold-400 px-6 py-3 text-sm font-bold text-ink-950 shadow-md transition hover:bg-gold-300"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Datathon Registration</h1>
        <p className="mt-3 text-base text-mist-300">
          Send BDT 300 to <strong className="text-white">+8801921067682</strong> (bKash personal) and fill in the details below.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {serverError && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            <AlertIcon className="h-5 w-5 shrink-0 mt-0.5" />
            <p>{serverError}</p>
          </div>
        )}

        <SectionCard title="Team Details">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              label="Team Name"
              name="teamName"
              placeholder="e.g. Data_Warriors"
              required
              register={register}
              error={errors.teamName}
              hint="Only letters, numbers, and underscores (no spaces)."
            />
            <FormField
              label="bKash Transaction ID"
              name="transactionId"
              placeholder="e.g. BKB123XYZ"
              required
              register={register}
              error={errors.transactionId}
              hint="Enter the BDT 300 transaction ID."
            />
          </div>
        </SectionCard>

        <SectionCard title="First Member (Team Leader)">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              label="Full Name"
              name="members.0.name"
              required
              register={register}
              error={errors.members?.[0]?.name}
            />
            <FormField
              label="University Name"
              name="members.0.universityName"
              placeholder="Enter your university"
              required
              register={register}
              error={errors.members?.[0]?.universityName}
            />
            <FormField
              label="Student/University ID"
              name="members.0.universityId"
              required
              register={register}
              error={errors.members?.[0]?.universityId}
            />
            <FormField
              label="Phone Number"
              name="members.0.phone"
              placeholder="01XXXXXXXXX"
              required
              register={register}
              error={errors.members?.[0]?.phone}
              hint={PHONE_HINT}
            />
            <FormField
              label="Kaggle Email"
              name="members.0.kaggleEmail"
              placeholder="email@example.com"
              required
              register={register}
              error={errors.members?.[0]?.kaggleEmail}
              hint="Kaggle account email address"
            />
            <FormField
              label="Kaggle Username"
              name="members.0.kaggleUsername"
              placeholder="e.g. janesmith"
              required
              register={register}
              error={errors.members?.[0]?.kaggleUsername}
              hint="Your public Kaggle username"
            />
          </div>
        </SectionCard>

        <div className="rounded-2xl border border-ink-600 bg-ink-800/40 p-5">
          <label className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-white select-none">
            <input
              type="checkbox"
              checked={hasSecondMember}
              onChange={(e) => setHasSecondMember(e.target.checked)}
              className="h-4 w-4 rounded border-ink-500 bg-ink-950 text-grape-500 focus:ring-grape-500/30"
            />
            Add Second Team Member (Optional)
          </label>
        </div>

        {hasSecondMember && (
          <SectionCard title="Second Member">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                label="Full Name"
                name="members.1.name"
                required
                register={register}
                error={errors.members?.[1]?.name}
              />
              <FormField
                label="University Name"
                name="members.1.universityName"
                placeholder="Enter university name"
                required={hasSecondMember}
                register={register}
                error={errors.members?.[1]?.universityName}
              />
              <FormField
                label="Student/University ID"
                name="members.1.universityId"
                required
                register={register}
                error={errors.members?.[1]?.universityId}
              />
              <FormField
                label="Phone Number"
                name="members.1.phone"
                placeholder="01XXXXXXXXX"
                required
                register={register}
                error={errors.members?.[1]?.phone}
                hint={PHONE_HINT}
              />
              <FormField
                label="Kaggle Email"
                name="members.1.kaggleEmail"
                placeholder="email@example.com"
                required
                register={register}
                error={errors.members?.[1]?.kaggleEmail}
              />
              <FormField
                label="Kaggle Username"
                name="members.1.kaggleUsername"
                placeholder="e.g. johnsmith"
                required
                register={register}
                error={errors.members?.[1]?.kaggleUsername}
              />
            </div>
          </SectionCard>
        )}

        <div className="flex flex-col items-center gap-4 py-4">
          {isTurnstileConfigured && (
            <div className="h-[65px]">
              <TurnstileWidget onToken={onCaptchaToken} />
            </div>
          )}

          <button
            type="submit"
            disabled={step === 'submitting' || awaitingCaptcha}
            className="group inline-flex items-center gap-2 rounded-xl bg-gold-400 px-8 py-4 text-sm font-bold text-ink-950 shadow-md transition hover:bg-gold-300 disabled:opacity-50"
          >
            {step === 'submitting' ? 'Submitting...' : 'Submit Registration'}
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
