import { BD_PHONE_RE, EMAIL_RE, PHONE_HINT } from '@/lib/patterns';

// ---------------------------------------------------------------------------
// IT Quiz server-side validation.
//
// Same contract as the datathon validator — returns [{ field, message }] and
// an empty array means valid — so the route handler and the form's error
// mapping work unchanged.
//
// Regexes come from src/lib/patterns.js and are never re-declared here. That
// file records what happened last time they were copied: the IUPC copies
// drifted and started rejecting numbers the gaming copy accepted.
//
// Faculty, Semester and Session are free text by the owner's decision. No list
// was given, so no list is invented — a student from any university can write
// what their own institution calls it.
// ---------------------------------------------------------------------------

/* Same shape the gaming validator enforces. Wallet references are
   alphanumeric; the length range covers bKash (10) through the longer Nagad
   and Rocket forms. */
const TRANSACTION_RE = /^[A-Za-z0-9]{6,25}$/;

const text = (value) => (typeof value === 'string' ? value.trim() : '');

/**
 * @param {object} body                the submitted fields
 * @param {object} [opts]
 * @param {boolean} [opts.hasScreenshot]  whether a valid image arrived with it
 * @returns {{field: string, message: string}[]}
 */
export function validateRegistration(body, { hasScreenshot = false } = {}) {
  const errors = [];
  const b = body || {};

  const required = [
    { field: 'fullName', label: 'Full name', max: 100 },
    { field: 'universityName', label: 'University name', max: 150 },
    { field: 'academicId', label: 'Academic ID', max: 40 },
    { field: 'faculty', label: 'Faculty', max: 100 },
    { field: 'semester', label: 'Semester', max: 40 },
    { field: 'session', label: 'Session', max: 20 },
  ];

  required.forEach(({ field, label, max }) => {
    const value = text(b[field]);
    if (value.length === 0) {
      errors.push({ field, message: `${label} is required` });
    } else if (value.length > max) {
      errors.push({ field, message: `${label} cannot exceed ${max} characters` });
    }
  });

  const whatsapp = text(b.whatsapp);
  if (whatsapp.length === 0) {
    errors.push({ field: 'whatsapp', message: 'WhatsApp number is required' });
  } else if (!BD_PHONE_RE.test(whatsapp)) {
    errors.push({
      field: 'whatsapp',
      message: `Enter a valid Bangladeshi number. ${PHONE_HINT}`,
    });
  }

  /* Optional by the owner's spec — blank is valid. Only checked if typed, so
     someone without an email is not blocked, and someone who mistypes one is
     still told. */
  const email = text(b.email);
  if (email.length > 0) {
    if (!EMAIL_RE.test(email)) {
      errors.push({ field: 'email', message: 'Enter a valid email address' });
    } else if (email.length > 120) {
      errors.push({ field: 'email', message: 'Email cannot exceed 120 characters' });
    }
  }

  /* "Transaction ID OR Payment Screenshot" — either proves the ৳50 arrived,
     so exactly one is enough and neither is not. */
  const transactionId = text(b.transactionId);
  if (transactionId.length === 0 && !hasScreenshot) {
    errors.push({
      field: 'transactionId',
      message: 'Enter the transaction ID, or attach a screenshot of the payment',
    });
  } else if (transactionId.length > 0 && !TRANSACTION_RE.test(transactionId)) {
    errors.push({
      field: 'transactionId',
      message: 'Transaction ID should be 6–25 letters and numbers',
    });
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
      message: 'Please agree to the tournament rules',
    });
  }

  return errors;
}

/**
 * The submitted body as the model wants it.
 *
 * `transactionId` is left UNDEFINED when blank rather than set to ''. The
 * partial unique index in model.js covers documents where the field is a
 * string, so an empty string would collide with the next screenshot-only entry
 * and show a duplicate-key error to someone who did nothing wrong.
 */
export function normalizeRegistration(body, { screenshotId = null } = {}) {
  const b = body || {};
  const transactionId = text(b.transactionId);
  const email = text(b.email);

  return {
    fullName: text(b.fullName),
    ...(email ? { email } : {}),
    whatsapp: text(b.whatsapp),
    universityName: text(b.universityName),
    academicId: text(b.academicId),
    faculty: text(b.faculty),
    semester: text(b.semester),
    session: text(b.session),
    payment: {
      method: text(b.paymentMethod) || undefined,
      ...(transactionId ? { transactionId } : {}),
      screenshot: screenshotId,
      amount: 50,
      receiverNumber: text(b.receiverNumber) || undefined,
    },
    agreements: {
      infoCorrect: b.agreeInfo === true,
      rules: b.agreeRules === true,
    },
  };
}
