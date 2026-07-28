import {BD_PHONE_RE, EMAIL_RE, PHONE_HINT} from '@/lib/patterns';
export const TEAM_NAME_RE = /^[a-zA-Z0-9_\s\u0980-\u09FF]+$/;

export function validateRegistration(body) {
  const errors = [];
  const {teamName, transactionId, members} = body || {};

  if (!teamName || typeof teamName !== 'string' || teamName.trim().length < 3 ||
      teamName.trim().length > 100) {
    errors.push(
        {field: 'teamName', message: 'Team name must be 3-100 characters'});
  } else if (!TEAM_NAME_RE.test(teamName.trim())) {
    errors.push({
      field: 'teamName',
      message:
          'Team name may only contain letters, numbers and underscores — no spaces',
    });
  }

  if (!transactionId || typeof transactionId !== 'string' ||
      transactionId.trim().length === 0) {
    errors.push(
        {field: 'transactionId', message: 'Transaction ID is required'});
  }

  // Members validation
  if (!members || !Array.isArray(members) || members.length < 1 ||
      members.length > 2) {
    errors.push({field: 'members', message: 'A team must have 1 or 2 members'});
  } else {
    members.forEach((m, idx) => {
      if (!m || typeof m !== 'object') {
        errors.push(
            {field: `members[${idx}]`, message: 'Member details are invalid'});
        return;
      }
      if (!m.name || typeof m.name !== 'string' || m.name.trim().length === 0 ||
          m.name.trim().length > 100) {
        errors.push({
          field: `members[${idx}].name`,
          message: 'Member name is required and cannot exceed 100 characters'
        });
      }
      if (!m.universityName || typeof m.universityName !== 'string' ||
          m.universityName.trim().length === 0) {
        errors.push({
          field: `members[${idx}].universityName`,
          message: 'University name is required'
        });
      }
      if (!m.universityId || typeof m.universityId !== 'string' ||
          m.universityId.trim().length === 0 ||
          m.universityId.trim().length > 50) {
        errors.push({
          field: `members[${idx}].universityId`,
          message: 'University ID is required'
        });
      }
      if (!m.phone || typeof m.phone !== 'string' ||
          !BD_PHONE_RE.test(m.phone.trim())) {
        errors.push({
          field: `members[${idx}].phone`,
          message: `Phone must be a valid Bangladeshi number. ${PHONE_HINT}`
        });
      }
      if (!m.kaggleEmail || typeof m.kaggleEmail !== 'string' ||
          !EMAIL_RE.test(m.kaggleEmail.trim())) {
        errors.push({
          field: `members[${idx}].kaggleEmail`,
          message: 'Please provide a valid Kaggle email'
        });
      }
      if (!m.kaggleUsername || typeof m.kaggleUsername !== 'string' ||
          m.kaggleUsername.trim().length === 0) {
        errors.push({
          field: `members[${idx}].kaggleUsername`,
          message: 'Kaggle username is required'
        });
      }
    });
  }

  return errors;
}
