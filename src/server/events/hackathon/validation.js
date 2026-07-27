import { BD_PHONE_RE, EMAIL_RE, TEAM_NAME_RE, PHONE_HINT } from '@/lib/patterns';
import { TSHIRT_SIZES } from '@/lib/sizes';

// ---------------------------------------------------------------------------
// Hackathon pre-registration validation.
//
// Same contract as the other validators: [{ field, message }], empty means
// valid. Regexes come from src/lib/patterns.js and are never re-declared —
// that file records what happened last time they were copied.
//
// The shape that makes this different from the datathon: the second member is
// OPTIONAL. A row is only validated if the entrant actually started filling it
// in, so a team of one submits cleanly while a half-filled second member is
// still caught rather than silently dropped.
// ---------------------------------------------------------------------------

const text = (value) => (typeof value === 'string' ? value.trim() : '');

/* Which member rows the entrant actually attempted. An untouched second row
   arrives as a set of empty strings and is not an error — it is a team of one.
   A row with ANY field filled is a row they meant to submit, so it gets the
   full check and a missing field is reported. */
const attempted = (member) =>
  ['fullName', 'email', 'whatsapp', 'universityName', 'department', 'tshirtSize']
    .some((key) => text(member?.[key]).length > 0);

const validateMember = (member, index, errors, { hasPhoto }) => {
  const at = (field) => `members[${index}].${field}`;

  const name = text(member.fullName);
  if (name.length === 0) errors.push({ field: at('fullName'), message: 'Full name is required' });
  else if (name.length > 100) errors.push({ field: at('fullName'), message: 'Name cannot exceed 100 characters' });

  const email = text(member.email);
  if (!EMAIL_RE.test(email)) {
    errors.push({ field: at('email'), message: 'Enter a valid email address' });
  }

  const phone = text(member.whatsapp);
  if (!BD_PHONE_RE.test(phone)) {
    errors.push({
      field: at('whatsapp'),
      message: `Enter a valid Bangladeshi number. ${PHONE_HINT}`,
    });
  }

  const university = text(member.universityName);
  if (university.length === 0) errors.push({ field: at('universityName'), message: 'University name is required' });
  else if (university.length > 150) errors.push({ field: at('universityName'), message: 'University name cannot exceed 150 characters' });

  const department = text(member.department);
  if (department.length === 0) errors.push({ field: at('department'), message: 'Department is required' });
  else if (department.length > 100) errors.push({ field: at('department'), message: 'Department cannot exceed 100 characters' });

  const size = text(member.tshirtSize);
  if (!TSHIRT_SIZES.includes(size)) {
    errors.push({
      field: at('tshirtSize'),
      message: `T-shirt size must be one of: ${TSHIRT_SIZES.join(', ')}`,
    });
  }

  /* The photo goes on a badge and a certificate, so a member without one is a
     member the committee cannot print for. */
  if (!hasPhoto) {
    errors.push({ field: at('photo'), message: 'A photo is required for this member' });
  }
};

/**
 * @param {object} body
 * @param {object} [opts]
 * @param {boolean[]} [opts.photos]  which member index arrived with an image
 */
export function validateRegistration(body, { photos = [] } = {}) {
  const errors = [];
  const b = body || {};

  const teamName = text(b.teamName);
  if (teamName.length < 3 || teamName.length > 100) {
    errors.push({ field: 'teamName', message: 'Team name must be 3–100 characters' });
  } else if (!TEAM_NAME_RE.test(teamName)) {
    errors.push({
      field: 'teamName',
      message: 'Team name may only contain letters, numbers and underscores — no spaces',
    });
  }

  const rows = Array.isArray(b.members) ? b.members.slice(0, 2) : [];
  if (rows.length === 0 || !attempted(rows[0])) {
    errors.push({ field: 'members', message: 'At least one member is required' });
    return errors;
  }

  const real = rows.filter((row, i) => i === 0 || attempted(row));
  real.forEach((row, i) => validateMember(row, i, errors, { hasPhoto: Boolean(photos[i]) }));

  /* Two people on one team cannot be the same person. */
  if (real.length === 2) {
    const emails = real.map((r) => text(r.email).toLowerCase());
    if (emails[0] && emails[0] === emails[1]) {
      errors.push({
        field: 'members[1].email',
        message: 'Both members cannot use the same email address',
      });
    }
  }

  if (b.agreeInfo !== true) {
    errors.push({ field: 'agreeInfo', message: 'Please confirm that the information you entered is correct' });
  }
  if (b.agreeRules !== true) {
    errors.push({ field: 'agreeRules', message: 'Please agree to the rules' });
  }

  return errors;
}

/** The submitted body as the model wants it. */
export function normalizeRegistration(body, { photoIds = [] } = {}) {
  const b = body || {};
  const rows = (Array.isArray(b.members) ? b.members.slice(0, 2) : []).filter(
    (row, i) => i === 0 || attempted(row)
  );

  const members = rows.map((row, i) => ({
    isTeamLeader: i === 0,
    fullName: text(row.fullName),
    email: text(row.email).toLowerCase(),
    whatsapp: text(row.whatsapp),
    universityName: text(row.universityName),
    department: text(row.department),
    tshirtSize: text(row.tshirtSize),
    photo: photoIds[i] || null,
  }));

  return {
    teamName: text(b.teamName),
    members,
    memberEmails: members.map((m) => m.email),
    agreements: {
      infoCorrect: b.agreeInfo === true,
      rules: b.agreeRules === true,
    },
  };
}

/** How many member rows the entrant actually filled in — the route needs this
    to know how many photo parts to expect. */
export function memberCount(body) {
  const rows = Array.isArray(body?.members) ? body.members.slice(0, 2) : [];
  return rows.filter((row, i) => i === 0 || attempted(row)).length;
}
