import { BD_PHONE_RE, EMAIL_RE, TEAM_NAME_RE, PHONE_HINT } from '@/lib/patterns';

const tshirtSizes = ['S', 'M', 'L', 'XL', 'XXL'];

export function validateRegistration(body) {
  const errors = [];
  const { teamName, varsityName, coach, members } = body || {};

  if (!teamName || typeof teamName !== 'string' || teamName.trim().length < 3 || teamName.trim().length > 100) {
    errors.push({ field: 'teamName', message: 'Team name must be 3-100 characters' });
  } else if (!TEAM_NAME_RE.test(teamName.trim())) {
    errors.push({
      field: 'teamName',
      message:
        'Team name may only contain letters, numbers and underscores — no spaces',
    });
  }
  if (!varsityName || typeof varsityName !== 'string' || varsityName.trim().length === 0 || varsityName.trim().length > 150) {
    errors.push({ field: 'varsityName', message: 'Varsity name is required and cannot exceed 150 characters' });
  }

  // Coach validation
  if (!coach) {
    errors.push({ field: 'coach', message: 'Coach information is required' });
  } else {
    if (!coach.name || typeof coach.name !== 'string' || coach.name.trim().length === 0 || coach.name.trim().length > 100) {
      errors.push({ field: 'coach.name', message: 'Coach name cannot exceed 100 characters' });
    }
    if (!coach.email || typeof coach.email !== 'string' || !EMAIL_RE.test(coach.email.trim())) {
      errors.push({ field: 'coach.email', message: 'Please provide a valid coach email' });
    }
    if (!coach.phone || typeof coach.phone !== 'string' || !BD_PHONE_RE.test(coach.phone.trim())) {
      errors.push({ field: 'coach.phone', message: `Coach phone must be a valid Bangladeshi number. ${PHONE_HINT}` });
    }
  }

  // Members validation
  if (!members || !Array.isArray(members) || members.length !== 3) {
    errors.push({ field: 'members', message: 'Exactly 3 team members are required' });
  } else {
    members.forEach((m, idx) => {
      if (!m || typeof m !== 'object') {
        errors.push({ field: `members[${idx}]`, message: 'Member details are invalid' });
        return;
      }
      if (!m.name || typeof m.name !== 'string' || m.name.trim().length === 0 || m.name.trim().length > 100) {
        errors.push({ field: `members[${idx}].name`, message: 'Member name is required and cannot exceed 100 characters' });
      }
      if (!m.email || typeof m.email !== 'string' || !EMAIL_RE.test(m.email.trim())) {
        errors.push({ field: `members[${idx}].email`, message: 'Please provide a valid member email' });
      }
      if (!m.phone || typeof m.phone !== 'string' || !BD_PHONE_RE.test(m.phone.trim())) {
        errors.push({ field: `members[${idx}].phone`, message: `Phone must be a valid Bangladeshi number. ${PHONE_HINT}` });
      }
      if (!m.studentId || typeof m.studentId !== 'string' || m.studentId.trim().length < 2 || m.studentId.trim().length > 50) {
        errors.push({ field: `members[${idx}].studentId`, message: 'Student ID must be 2-50 characters' });
      }
      if (!m.tshirtSize || typeof m.tshirtSize !== 'string' || !tshirtSizes.includes(m.tshirtSize.trim())) {
        errors.push({ field: `members[${idx}].tshirtSize`, message: 'T-shirt size must be one of S, M, L, XL, XXL' });
      }
    });
  }

  return errors;
}
