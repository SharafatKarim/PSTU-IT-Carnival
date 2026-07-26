import FormField from './FormField';
import SelectField from './SelectField';
import { PHONE_HINT } from '@/lib/patterns';

const TSHIRT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const MemberForm = ({ index, register, errors }) => {
  const memberErrors = errors?.members?.[index] || {};

  return (
    <div className="rounded-xl border border-ink-600 bg-ink-950/40 p-5">
      <h3 className="mb-4 text-base font-semibold text-mist-100">
        Member {index + 1}
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          label="Member Name"
          name={`members.${index}.name`}
          register={register}
          error={memberErrors.name}
          required
          autoComplete="name"
        />
        <FormField
          label="Member Email"
          name={`members.${index}.email`}
          type="email"
          register={register}
          error={memberErrors.email}
          required
          autoComplete="email"
        />
        <FormField
          label="Member Phone Number"
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
