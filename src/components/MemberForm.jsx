import FormField from './FormField';
import SelectField from './SelectField';
import { PHONE_HINT } from '@/lib/patterns';
import { TSHIRT_SIZES } from '@/lib/sizes';



/* The first member is the team leader — the one address the committee writes
   to. Saying so on the form matters: whoever fills in row one is who receives
   every update, so it needs to be a deliberate choice rather than whoever the
   typist happened to list first. */
const MemberForm = ({ index, register, errors }) => {
  const memberErrors = errors?.members?.[index] || {};
  const isLeader = index === 0;
  const who = isLeader ? 'Team Leader' : 'Member';

  return (
    <div
      className={`rounded-xl border p-5 ${
        isLeader
          ? 'border-aqua-400/40 bg-aqua-400/[0.06]'
          : 'border-ink-600 bg-ink-950/40'
      }`}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <h3 className="text-base font-semibold text-mist-100">
          {isLeader ? 'Team Leader' : `Member ${index + 1}`}
        </h3>
        {isLeader && (
          <span className="rounded-full border border-aqua-400/40 bg-aqua-400/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-aqua-300">
            Receives all updates
          </span>
        )}
      </div>
      {isLeader && (
        <p className="-mt-2 mb-4 text-xs leading-relaxed text-mist-400">
          Every email about this registration goes to the team leader only, so
          use an address they check.
        </p>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          label={`${who} Name`}
          name={`members.${index}.name`}
          register={register}
          error={memberErrors.name}
          required
          autoComplete="name"
        />
        <FormField
          label={`${who} Email`}
          name={`members.${index}.email`}
          type="email"
          register={register}
          error={memberErrors.email}
          required
          autoComplete="email"
        />
        <FormField
          label={`${who} Phone Number`}
          name={`members.${index}.phone`}
          register={register}
          error={memberErrors.phone}
          hint={PHONE_HINT}
          required
          autoComplete="tel"
        />
        <FormField
          label="Student ID"
          name={`members.${index}.studentId`}
          register={register}
          error={memberErrors.studentId}
          hint="As printed on your university ID card"
          required
        />
        <div className="md:col-span-2">
          <SelectField
            label="T-Shirt Size"
            name={`members.${index}.tshirtSize`}
            options={TSHIRT_SIZES}
            register={register}
            error={memberErrors.tshirtSize}
            required
            placeholder="Select t-shirt size"
          />
        </div>
      </div>
    </div>
  );
};

export default MemberForm;
