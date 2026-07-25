import FormField from './FormField';
import SelectField from './SelectField';

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
          placeholder="e.g. Rahim Uddin"
          register={register}
          error={memberErrors.name}
          required
          autoComplete="name"
        />
        <FormField
          label="Member Email"
          name={`members.${index}.email`}
          type="email"
          placeholder="member@example.com"
          register={register}
          error={memberErrors.email}
          required
          autoComplete="email"
        />
        <FormField
          label="Member Phone Number"
          name={`members.${index}.phone`}
          placeholder="017XXXXXXXX or +88017XXXXXXXX"
          register={register}
          error={memberErrors.phone}
          required
          autoComplete="tel"
        />
        <FormField
          label="Codeforces Handle"
          name={`members.${index}.codeforcesHandle`}
          placeholder="e.g. tourist"
          register={register}
          error={memberErrors.codeforcesHandle}
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
