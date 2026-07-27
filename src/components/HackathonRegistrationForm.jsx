'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import FormField from './FormField';
import FileField from './FileField';
import SelectField from './SelectField';
import AutocompleteField from './AutocompleteField';
import SectionCard from './SectionCard';
import CheckboxField from './gaming/CheckboxField';
import TurnstileWidget, { isTurnstileConfigured } from './TurnstileWidget';
import { CheckIcon, AlertIcon } from './landing/Icons';
import { ROUTES } from '@/lib/routes';
import { getEventDetail } from '@/data/events';
import { searchUniversities } from '@/data/universities';
import { TSHIRT_SIZES } from '@/lib/sizes';
import { BD_PHONE_RE, EMAIL_RE, TEAM_NAME_RE, PHONE_HINT } from '@/lib/patterns';

// ---------------------------------------------------------------------------
// Hackathon pre-registration — a team of one or two.
//
// Phase 1 is free, so this form asks for no payment details at all. What makes
// it different from every other form here is the SECOND MEMBER: optional, and
// revealed by a toggle rather than always on screen. An empty second row would
// otherwise read as six more required fields.
//
// Each member needs a photo, and it goes on their badge and certificate — so
// unlike a payment screenshot it is kept, not deleted after checking. The files
// are shrunk in the browser before upload; see lib/downscale.js.
// ---------------------------------------------------------------------------

const ENDPOINT = '/api/v1/events/hackathon/registrations';

const MemberFields = ({ index, register, setValue, watch, errorFor, onPhoto, photoError }) => {
  const prefix = `members.${index}`;
  const university = watch(`${prefix}.universityName`);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField
        label="Full Name"
        name={`${prefix}.fullName`}
        required
        placeholder="As it appears on your student ID"
        register={(n) => register(n, { required: 'Full name is required' })}
        error={errorFor(`${prefix}.fullName`)}
      />
      <FormField
        label="Email Address"
        name={`${prefix}.email`}
        type="email"
        required
        placeholder="you@example.com"
        autoComplete="email"
        register={(n) =>
          register(n, {
            required: 'Email is required',
            validate: (v) => EMAIL_RE.test(v?.trim() || '') || 'Enter a valid email address',
          })
        }
        error={errorFor(`${prefix}.email`)}
      />
      <FormField
        label="WhatsApp Number"
        name={`${prefix}.whatsapp`}
        required
        placeholder="01XXXXXXXXX"
        autoComplete="tel"
        hint={PHONE_HINT}
        register={(n) =>
          register(n, {
            required: 'WhatsApp number is required',
            validate: (v) =>
              BD_PHONE_RE.test(v?.trim() || '') ||
              `Enter a valid Bangladeshi number. ${PHONE_HINT}`,
          })
        }
        error={errorFor(`${prefix}.whatsapp`)}
      />
      <AutocompleteField
        label="University Name"
        name={`${prefix}.universityName`}
        required
        value={university}
        search={searchUniversities}
        onSelect={(option) =>
          setValue(`${prefix}.universityName`, option.name, { shouldValidate: true })
        }
        register={(n) => register(n, { required: 'University name is required' })}
        error={errorFor(`${prefix}.universityName`)}
      />
      <FormField
        label="Department"
        name={`${prefix}.department`}
        required
        placeholder="e.g. Computer Science and Engineering"
        register={(n) => register(n, { required: 'Department is required' })}
        error={errorFor(`${prefix}.department`)}
      />
      <SelectField
        label="T-Shirt Size"
        name={`${prefix}.tshirtSize`}
        options={TSHIRT_SIZES}
        required
        placeholder="Pick a size"
        register={(n) => register(n, { required: 'T-shirt size is required' })}
        error={errorFor(`${prefix}.tshirtSize`)}
      />
      <div className="sm:col-span-2">
        <FileField
          label="Picture"
          name={`${prefix}.photo`}
          required
          onChange={onPhoto}
          error={photoError}
          hint="Goes on your badge and certificate. A clear head-and-shoulders photo — JPG, PNG or WebP, up to 5 MB."
        />
      </div>
    </div>
  );
};

export default function HackathonRegistrationForm() {
  const event = getEventDetail('hackathon');

  const [step, setStep] = useState('form');
  const [successData, setSuccessData] = useState(null);
  const [serverError, setServerError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [captchaToken, setCaptchaToken] = useState(null);
  const [hasSecondMember, setHasSecondMember] = useState(false);
  const [photos, setPhotos] = useState([null, null]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      teamName: '',
      members: [
        { fullName: '', email: '', whatsapp: '', universityName: '', department: '', tshirtSize: '' },
        { fullName: '', email: '', whatsapp: '', universityName: '', department: '', tshirtSize: '' },
      ],
      agreeInfo: false,
      agreeRules: false,
    },
  });

  const onCaptchaToken = useCallback((token) => setCaptchaToken(token), []);

  const setPhoto = (index) => (file) =>
    setPhotos((prev) => prev.map((p, i) => (i === index ? file : p)));

  /* react-hook-form nests errors as members[0].email; the server returns them
     flat under the same string. Reading both keeps one lookup for the field. */
  const errorFor = (path) => {
    const [, index, key] = path.match(/^members\.(\d+)\.(\w+)$/) || [];
    const local = index !== undefined ? errors.members?.[index]?.[key] : errors[path];
    const server = fieldErrors[index !== undefined ? `members[${index}].${key}` : path];
    return local || (server ? { message: server } : undefined);
  };

  const onSubmit = async (data) => {
    const count = hasSecondMember ? 2 : 1;

    for (let i = 0; i < count; i += 1) {
      if (!photos[i]) {
        setServerError(`Add a picture for member ${i + 1}.`);
        return;
      }
    }

    setStep('submitting');
    setServerError('');
    setFieldErrors({});

    const payload = {
      teamName: data.teamName,
      members: data.members.slice(0, count),
      agreeInfo: data.agreeInfo,
      agreeRules: data.agreeRules,
      turnstileToken: captchaToken,
    };

    const form = new FormData();
    form.append('payload', JSON.stringify(payload));
    /* Indexed by member, so the server never has to match a file to a person
       by filename. */
    for (let i = 0; i < count; i += 1) form.append(`photo${i}`, photos[i]);

    try {
      const res = await fetch(ENDPOINT, { method: 'POST', body: form });
      const result = await res.json();

      if (res.ok && result.success) {
        setSuccessData(result.data);
        setStep('success');
        return;
      }

      if (Array.isArray(result.errors)) {
        setFieldErrors(Object.fromEntries(result.errors.map((e) => [e.field, e.message])));
      }
      setServerError(result.message || 'Please check the highlighted fields.');
      setStep('form');
    } catch {
      setServerError('Network error. Please try again.');
      setStep('form');
    }
  };

  const awaitingCaptcha = isTurnstileConfigured && !captchaToken;

  if (step === 'success') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
        <div className="rounded-2xl border border-emerald-400/30 bg-ink-900/70 p-8 text-center shadow-card">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
            <CheckIcon className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-2xl font-extrabold text-white">
            Pre-registration submitted
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-mist-300">
            Your team is in. Watch your email — the problem statement comes in two
            messages after pre-registration closes on 4 August.
          </p>

          <div className="my-8 rounded-xl border border-ink-600 bg-ink-950/80 p-6">
            <span className="block text-xs font-bold uppercase tracking-widest text-mist-400">
              Your registration ID
            </span>
            <span className="mt-2 block select-all font-mono text-3xl font-extrabold text-white">
              {successData?.registrationId}
            </span>
            <p className="mt-3 text-xs leading-relaxed text-mist-400">
              Save this. It is how the committee identifies your team.
            </p>
          </div>

          <Link
            href={ROUTES.event('hackathon')}
            className="inline-flex items-center gap-2 rounded-xl bg-gold-400 px-6 py-3 text-sm font-bold text-ink-950 shadow-glow-gold transition hover:bg-gold-300"
          >
            Back to Hackathon
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Hackathon pre-registration
        </h1>
        <p className="mt-3 max-w-[62ch] text-base leading-relaxed text-mist-300">
          Free, and nothing is paid at this stage. One or two members — the
          ৳2,000 applies later, at final registration, and only to shortlisted
          teams.
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

        <SectionCard title="Team" subtitle="Step 1 of 3">
          <FormField
            label="Team Name"
            name="teamName"
            required
            placeholder="e.g. PSTU_Array_Of_Hope"
            hint="Letters, numbers and underscores — no spaces. It must be unique, so have a backup ready."
            register={(n) =>
              register(n, {
                required: 'Team name is required',
                minLength: { value: 3, message: 'At least 3 characters' },
                maxLength: { value: 100, message: 'Cannot exceed 100 characters' },
                validate: (v) =>
                  TEAM_NAME_RE.test(v?.trim() || '') ||
                  'Letters, numbers and underscores only — no spaces',
              })
            }
            error={errorFor('teamName')}
          />
        </SectionCard>

        <SectionCard title="Member 1 — team leader" subtitle="Step 2 of 3">
          <MemberFields
            index={0}
            register={register}
            setValue={setValue}
            watch={watch}
            errorFor={errorFor}
            onPhoto={setPhoto(0)}
            photoError={fieldErrors['members[0].photo']}
          />
        </SectionCard>

        {/* Revealed rather than always shown: an empty second member reads as
            six more required fields, and a team of one is allowed. */}
        {hasSecondMember ? (
          <SectionCard title="Member 2" subtitle="Optional">
            <MemberFields
              index={1}
              register={register}
              setValue={setValue}
              watch={watch}
              errorFor={errorFor}
              onPhoto={setPhoto(1)}
              photoError={fieldErrors['members[1].photo']}
            />
            <button
              type="button"
              onClick={() => {
                setHasSecondMember(false);
                setPhoto(1)(null);
              }}
              className="mt-5 rounded-lg border border-ink-500 px-4 py-2 text-sm font-semibold text-mist-200 transition hover:bg-white/5 hover:text-white"
            >
              Remove second member
            </button>
          </SectionCard>
        ) : (
          <button
            type="button"
            onClick={() => setHasSecondMember(true)}
            className="w-full rounded-2xl border border-dashed border-ink-500 px-6 py-5 text-sm font-semibold text-mist-300 transition hover:border-grape-500 hover:text-white"
          >
            + Add a second member (optional)
          </button>
        )}

        <SectionCard title="Confirmation" subtitle="Step 3 of 3">
          <div className="space-y-3">
            <CheckboxField
              label="I confirm that the information provided is correct."
              name="agreeInfo"
              register={(n) => register(n, { required: 'Please confirm your information is correct' })}
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
              : 'Submit pre-registration'}
        </button>
      </form>
    </div>
  );
}
