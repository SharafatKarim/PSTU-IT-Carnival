import { BD_PHONE_RE, EMAIL_RE, TEAM_NAME_RE, PHONE_HINT } from '@/lib/patterns';

const text = (value) => (typeof value === 'string' ? value.trim() : '');

const attempted = (member) =>
  ['name', 'email', 'phone', 'universityName', 'universityId']
    .some((key) => text(member?.[key]).length > 0);

const validateMember = (member, index, errors) => {
  const at = (field) => `members[${index}].${field}`;

  const name = text(member.name);
  if (name.length === 0) {
    errors.push({ field: at('name'), message: 'Full name is required' });
  } else if (name.length > 100) {
    errors.push({ field: at('name'), message: 'Name cannot exceed 100 characters' });
  }

  const email = text(member.email);
  if (!EMAIL_RE.test(email)) {
    errors.push({ field: at('email'), message: 'Enter a valid email address' });
  }

  const phone = text(member.phone);
  if (!BD_PHONE_RE.test(phone)) {
    errors.push({ field: at('phone'), message: `Phone must be a valid Bangladeshi number. ${PHONE_HINT}` });
  }

  const universityName = text(member.universityName);
  if (universityName.length === 0) {
    errors.push({ field: at('universityName'), message: 'University name is required' });
  }

  const universityId = text(member.universityId);
  if (universityId.length === 0) {
    errors.push({ field: at('universityId'), message: 'University ID is required' });
  } else if (universityId.length > 50) {
    errors.push({ field: at('universityId'), message: 'University ID cannot exceed 50 characters' });
  }
};

export function validateRegistration(body) {
  const errors = [];
  const b = body || {};

  const teamName = text(b.teamName);
  if (teamName.length < 3 || teamName.length > 100) {
    errors.push({ field: 'teamName', message: 'Team name must be between 3 and 100 characters' });
  } else if (!TEAM_NAME_RE.test(teamName)) {
    errors.push({
      field: 'teamName',
      message: 'Team name may only contain letters, numbers and underscores — no spaces',
    });
  }

  const transactionId = text(b.transactionId);
  if (transactionId.length === 0) {
    errors.push({ field: 'transactionId', message: 'Transaction ID is required' });
  }

  const rows = Array.isArray(b.members) ? b.members.slice(0, 3) : [];
  if (rows.length === 0 || !attempted(rows[0])) {
    errors.push({ field: 'members', message: 'At least one member is required' });
    return errors;
  }

  const real = rows.filter((row, i) => i === 0 || attempted(row));
  real.forEach((row, i) => validateMember(row, i, errors));

  // Check duplicate emails in the same team
  const emails = real.map((r) => text(r.email).toLowerCase()).filter(Boolean);
  const uniqueEmails = new Set(emails);
  if (uniqueEmails.size !== emails.length) {
    errors.push({
      field: 'members',
      message: 'Each team member must have a unique email address',
    });
  }

  if (b.agreeInfo !== true) {
    errors.push({ field: 'agreeInfo', message: 'Please confirm that the information you entered is correct' });
  }
  if (b.agreeRules !== true) {
    errors.push({ field: 'agreeRules', message: 'Please agree to the rules' });
  }

  return errors;
}

export function normalizeRegistration(body) {
  const b = body || {};
  const rows = (Array.isArray(b.members) ? b.members.slice(0, 3) : []).filter(
    (row, i) => i === 0 || attempted(row)
  );

  const members = rows.map((row, i) => ({
    isTeamLeader: i === 0,
    name: text(row.name),
    email: text(row.email).toLowerCase(),
    phone: text(row.phone),
    universityName: text(row.universityName),
    universityId: text(row.universityId),
  }));

  return {
    teamName: text(b.teamName),
    members,
    transactionId: text(b.transactionId),
    paid: false,
  };
}
