'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import FormField from './FormField';
import SectionCard from './SectionCard';
import TurnstileWidget, { isTurnstileConfigured } from './TurnstileWidget';
import { CheckIcon, AlertIcon, ArrowRightIcon } from './landing/Icons';
import { ROUTES } from '@/lib/routes';
import { getEventDetail } from '@/data/events';
import { BD_PHONE_RE, EMAIL_RE, PHONE_HINT } from '@/lib/patterns';

export default function ProjectShowcaseRegistrationForm() {
  const event = getEventDetail('project-showcase');
  const [step, setStep] = useState('form'); // 'form' | 'submitting' | 'success' | 'error'
  const [successData, setSuccessData] = useState(null);
  const [serverError, setServerError] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);
  const [hasSecondMember, setHasSecondMember] = useState(false);
  const [hasThirdMember, setHasThirdMember] = useState(false);

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
      agreeInfo: false,
      agreeRules: false,
      members: [
        { name: '', universityName: '', universityId: '', phone: '', email: '' },
        { name: '', universityName: '', universityId: '', phone: '', email: '' },
        { name: '', universityName: '', universityId: '', phone: '', email: '' },
      ],
    },
  });

  const member1 = watch('members.0');
  const member2 = watch('members.1');
  const member3 = watch('members.2');

  const onCaptchaToken = useCallback((token) => {
    setCaptchaToken(token);
  }, []);

  const onSubmit = async (data) => {
    setStep('submitting');
    setServerError('');

    // Filter members based on team size selection
    const membersList = [data.members[0]];
    if (hasSecondMember) {
      membersList.push(data.members[1]);
      if (hasThirdMember) {
        membersList.push(data.members[2]);
      }
    }

    const submitData = {
      teamName: data.teamName,
      transactionId: data.transactionId,
      turnstileToken: captchaToken,
      members: membersList,
      agreeInfo: data.agreeInfo,
      agreeRules: data.agreeRules,
    };

    try {
      const res = await fetch('/api/v1/events/project-showcase/registrations', {
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
            Your registration for Project Showcasing has been successfully submitted and is waiting for payment approval.
          </p>

          <div className="my-8 rounded-xl border border-grape-400/40 bg-ink-950/80 p-6">
            <span className="block text-xs font-bold uppercase tracking-widest text-grape-300">Your Registration ID</span>
            <span className="mt-2 block font-mono text-3xl font-extrabold text-gold-300 select-all">
              {successData?.registrationId || 'PSTU-PROJ-2026-XXXX'}
            </span>
            <p className="mt-3 text-xs text-mist-400">
              Please save this ID. Your registration is currently pending admin payment verification. Once approved, it will be listed in the public registered teams directory.
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

  // Calculate required amount based on member choices (50 BDT per person)
  const feeAmount = hasSecondMember ? (hasThirdMember ? 150 : 100) : 50;
  const receiverNumber = event?.entry?.receiverNumber || '+8801734322148';

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Project Showcasing Registration</h1>
        <p className="mt-3 text-base text-mist-300">
          Send BDT <strong className="text-white">{feeAmount}</strong> to <strong className="text-white">{receiverNumber}</strong> (bKash personal only) and fill in the details below.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
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
              placeholder="e.g. Innovators_PSTU"
              required
              register={(n) => register(n, { required: 'Team name is required' })}
              error={errors.teamName}
              hint="Only letters, numbers, and underscores (no spaces)."
            />
            <FormField
              label="bKash Transaction ID"
              name="transactionId"
              placeholder="e.g. T4X7H90J"
              required
              register={(n) => register(n, { required: 'Transaction ID is required' })}
              error={errors.transactionId}
              hint={`Enter the BDT ${feeAmount} transaction ID.`}
            />
          </div>
        </SectionCard>

        <SectionCard title="Person 1 (Team Leader)">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              label="Full Name"
              name="members.0.name"
              required
              register={(n) => register(n, { required: 'Name is required' })}
              error={errors.members?.[0]?.name}
            />
            <FormField
              label="University Name"
              name="members.0.universityName"
              placeholder="Enter university name"
              required
              register={(n) => register(n, { required: 'University name is required' })}
              error={errors.members?.[0]?.universityName}
            />
            <FormField
              label="Student/University ID"
              name="members.0.universityId"
              required
              register={(n) => register(n, { required: 'Student ID is required' })}
              error={errors.members?.[0]?.universityId}
            />
            <FormField
              label="Phone Number"
              name="members.0.phone"
              placeholder="01XXXXXXXXX"
              required
              register={(n) => register(n, {
                required: 'Phone number is required',
                validate: (v) => BD_PHONE_RE.test(v.trim()) || `Enter a valid Bangladeshi phone number. ${PHONE_HINT}`
              })}
              error={errors.members?.[0]?.phone}
              hint={PHONE_HINT}
            />
            <FormField
              label="Email Address"
              name="members.0.email"
              placeholder="email@example.com"
              required
              register={(n) => register(n, {
                required: 'Email address is required',
                validate: (v) => EMAIL_RE.test(v.trim()) || 'Enter a valid email address'
              })}
              error={errors.members?.[0]?.email}
            />
          </div>
        </SectionCard>

        <div className="rounded-2xl border border-ink-600 bg-ink-800/40 p-5 space-y-4">
          <label className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-white select-none">
            <input
              type="checkbox"
              checked={hasSecondMember}
              onChange={(e) => {
                setHasSecondMember(e.target.checked);
                if (!e.target.checked) setHasThirdMember(false);
              }}
              className="h-4 w-4 rounded border-ink-500 bg-ink-950 text-aqua-500 focus:ring-aqua-500/30"
            />
            Add Second Team Member (Optional)
          </label>

          {hasSecondMember && (
            <label className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-white select-none pl-6">
              <input
                type="checkbox"
                checked={hasThirdMember}
                onChange={(e) => setHasThirdMember(e.target.checked)}
                className="h-4 w-4 rounded border-ink-500 bg-ink-950 text-aqua-500 focus:ring-aqua-500/30"
              />
              Add Third Team Member (Optional)
            </label>
          )}
        </div>

        {hasSecondMember && (
          <SectionCard title="Person 2">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                label="Full Name"
                name="members.1.name"
                required={hasSecondMember}
                register={(n) => register(n, { required: hasSecondMember ? 'Name is required' : false })}
                error={errors.members?.[1]?.name}
              />
              <FormField
                label="University Name"
                name="members.1.universityName"
                placeholder="Enter university name"
                required={hasSecondMember}
                register={(n) => register(n, { required: hasSecondMember ? 'University name is required' : false })}
                error={errors.members?.[1]?.universityName}
              />
              <FormField
                label="Student/University ID"
                name="members.1.universityId"
                required={hasSecondMember}
                register={(n) => register(n, { required: hasSecondMember ? 'Student ID is required' : false })}
                error={errors.members?.[1]?.universityId}
              />
              <FormField
                label="Phone Number"
                name="members.1.phone"
                placeholder="01XXXXXXXXX"
                required={hasSecondMember}
                register={(n) => register(n, {
                  required: hasSecondMember ? 'Phone number is required' : false,
                  validate: (v) => !hasSecondMember || BD_PHONE_RE.test(v.trim()) || `Enter a valid Bangladeshi phone number. ${PHONE_HINT}`
                })}
                error={errors.members?.[1]?.phone}
                hint={PHONE_HINT}
              />
              <FormField
                label="Email Address"
                name="members.1.email"
                placeholder="email@example.com"
                required={hasSecondMember}
                register={(n) => register(n, {
                  required: hasSecondMember ? 'Email address is required' : false,
                  validate: (v) => !hasSecondMember || EMAIL_RE.test(v.trim()) || 'Enter a valid email address'
                })}
                error={errors.members?.[1]?.email}
              />
            </div>
          </SectionCard>
        )}

        {hasSecondMember && hasThirdMember && (
          <SectionCard title="Person 3">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                label="Full Name"
                name="members.2.name"
                required={hasThirdMember}
                register={(n) => register(n, { required: hasThirdMember ? 'Name is required' : false })}
                error={errors.members?.[2]?.name}
              />
              <FormField
                label="University Name"
                name="members.2.universityName"
                placeholder="Enter university name"
                required={hasThirdMember}
                register={(n) => register(n, { required: hasThirdMember ? 'University name is required' : false })}
                error={errors.members?.[2]?.universityName}
              />
              <FormField
                label="Student/University ID"
                name="members.2.universityId"
                required={hasThirdMember}
                register={(n) => register(n, { required: hasThirdMember ? 'Student ID is required' : false })}
                error={errors.members?.[2]?.universityId}
              />
              <FormField
                label="Phone Number"
                name="members.2.phone"
                placeholder="01XXXXXXXXX"
                required={hasThirdMember}
                register={(n) => register(n, {
                  required: hasThirdMember ? 'Phone number is required' : false,
                  validate: (v) => !hasThirdMember || BD_PHONE_RE.test(v.trim()) || `Enter a valid Bangladeshi phone number. ${PHONE_HINT}`
                })}
                error={errors.members?.[2]?.phone}
                hint={PHONE_HINT}
              />
              <FormField
                label="Email Address"
                name="members.2.email"
                placeholder="email@example.com"
                required={hasThirdMember}
                register={(n) => register(n, {
                  required: hasThirdMember ? 'Email address is required' : false,
                  validate: (v) => !hasThirdMember || EMAIL_RE.test(v.trim()) || 'Enter a valid email address'
                })}
                error={errors.members?.[2]?.email}
              />
            </div>
          </SectionCard>
        )}

        <SectionCard title="Confirmation">
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer text-sm text-mist-300">
              <input
                type="checkbox"
                {...register('agreeInfo', { required: 'Please confirm your information is correct' })}
                className="mt-1 h-4 w-4 rounded border-ink-500 bg-ink-950 text-aqua-500 focus:ring-aqua-500/30"
              />
              <span>
                I confirm that the information provided is correct. <span className="text-red-500 font-bold">*</span>
                {errors.agreeInfo && <span className="block mt-1 text-xs text-red-400">{errors.agreeInfo.message}</span>}
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer text-sm text-mist-300">
              <input
                type="checkbox"
                {...register('agreeRules', { required: 'Please agree to the rules' })}
                className="mt-1 h-4 w-4 rounded border-ink-500 bg-ink-950 text-aqua-500 focus:ring-aqua-500/30"
              />
              <span>
                I agree to follow all tournament rules and decisions made by the organizers. <span className="text-red-500 font-bold">*</span>
                {errors.agreeRules && <span className="block mt-1 text-xs text-red-400">{errors.agreeRules.message}</span>}
              </span>
            </label>
          </div>
        </SectionCard>

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
