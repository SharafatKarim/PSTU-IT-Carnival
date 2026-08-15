import { EMAIL_RE } from '@/lib/patterns';

const text = (value) => (typeof value === 'string' ? value.trim() : '');

export function validateRegistration(body) {
  const errors = [];
  const b = body || {};

  const required = [
    { field: 'appName', label: "App's name", max: 150 },
    { field: 'shortAbstract', label: 'Short abstract', max: 2000 },
    { field: 'fullName', label: 'Full name', max: 100 },
    { field: 'studentId', label: 'Student ID', max: 50 },
  ];

  required.forEach(({ field, label, max }) => {
    const value = text(b[field]);
    if (value.length === 0) {
      errors.push({ field, message: `${label} is required` });
    } else if (value.length > max) {
      errors.push({ field, message: `${label} cannot exceed ${max} characters` });
    }
  });

  const email = text(b.email);
  if (email.length === 0) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!EMAIL_RE.test(email)) {
    errors.push({ field: 'email', message: 'Enter a valid email address' });
  } else if (email.length > 120) {
    errors.push({ field: 'email', message: 'Email cannot exceed 120 characters' });
  }

  if (b.agreeInfo !== true) {
    errors.push({
      field: 'agreeInfo',
      message: 'Please confirm that the information you entered is correct',
    });
  }

  if (b.agreeRules !== true) {
    errors.push({
      field: 'agreeRules',
      message: 'Please agree to the event rules',
    });
  }

  return errors;
}

export function normalizeRegistration(body) {
  const b = body || {};

  return {
    appName: text(b.appName),
    shortAbstract: text(b.shortAbstract),
    fullName: text(b.fullName),
    studentId: text(b.studentId),
    email: text(b.email),
    agreements: {
      infoCorrect: b.agreeInfo === true,
      rules: b.agreeRules === true,
    },
    paid: true,
  };
}
