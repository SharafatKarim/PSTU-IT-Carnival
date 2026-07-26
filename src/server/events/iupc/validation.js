const bdPhoneRegex = /^(?:\+?880)?1[3-9]\d{8}$/;
const tshirtSizes = ['S', 'M', 'L', 'XL', 'XXL'];
// Team names carry the varsity short form and use underscores, never spaces.
const teamNameRegex = /^[A-Za-z0-9_]+$/;

export function validateRegistration(body) {
  const errors = [];
  const { teamName, varsityName, coach, members } = body || {};

  if (!teamName || typeof teamName !== 'string' || teamName.trim().length < 3 || teamName.trim().length > 100) {
    errors.push({ field: 'teamName', message: 'Team name must be 3-100 characters' });
  } else if (!teamNameRegex.test(teamName.trim())) {
    errors.push({
      field: 'teamName',
      message:
        'Team name may only contain letters, numbers and underscores — no spaces (e.g. PSTU_Array_Of_Hope)',
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
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!coach.email || typeof coach.email !== 'string' || !emailRegex.test(coach.email.trim())) {
      errors.push({ field: 'coach.email', message: 'Please provide a valid coach email' });
    }
    if (!coach.phone || typeof coach.phone !== 'string' || !bdPhoneRegex.test(coach.phone.trim())) {
      errors.push({ field: 'coach.phone', message: 'Coach phone must be a valid Bangladeshi number (e.g. 017XXXXXXXX or +88017XXXXXXXX)' });
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
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!m.email || typeof m.email !== 'string' || !emailRegex.test(m.email.trim())) {
        errors.push({ field: `members[${idx}].email`, message: 'Please provide a valid member email' });
      }
      if (!m.phone || typeof m.phone !== 'string' || !bdPhoneRegex.test(m.phone.trim())) {
        errors.push({ field: `members[${idx}].phone`, message: 'Phone must be a valid Bangladeshi number (e.g. 017XXXXXXXX or +88017XXXXXXXX)' });
      }
      if (!m.codeforcesHandle || typeof m.codeforcesHandle !== 'string' || m.codeforcesHandle.trim().length < 2 || m.codeforcesHandle.trim().length > 50) {
        errors.push({ field: `members[${idx}].codeforcesHandle`, message: 'Codeforces handle must be 2-50 characters' });
      }
      if (!m.tshirtSize || typeof m.tshirtSize !== 'string' || !tshirtSizes.includes(m.tshirtSize.trim())) {
        errors.push({ field: `members[${idx}].tshirtSize`, message: 'T-shirt size must be one of S, M, L, XL, XXL' });
      }
    });
  }

  return errors;
}
