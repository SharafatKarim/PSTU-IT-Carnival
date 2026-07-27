// ---------------------------------------------------------------------------
// SMTP check for the registration confirmation mail.
//
// Runs the same code path the API uses, without touching the database, without
// creating a registration and without spending any of the rate-limit budget —
// so a credential problem is diagnosed in seconds instead of by submitting
// forms and reading container logs.
//
// Run it through scripts/test-email.sh, which executes this inside the web
// container where nodemailer and the EMAIL_* variables live.
//
//   ./scripts/test-email.sh                 # verify the login only
//   ./scripts/test-email.sh you@gmail.com   # verify, then send a real message
//
// Never takes the password as an argument: it comes from the environment, so
// it stays out of shell history and process listings.
// ---------------------------------------------------------------------------

import nodemailer from 'nodemailer';

const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;
const recipient = process.argv[2];

const mask = (value) =>
  !value ? '(unset)' : `${value.slice(0, 2)}${'*'.repeat(Math.max(0, value.length - 4))}${value.slice(-2)}`;

console.log('  EMAIL_USER :', user || '(unset)');
console.log('  EMAIL_PASS :', pass ? `${mask(pass)}  [${pass.length} chars]` : '(unset)');

if (!user || !pass) {
  console.error('\n  FAIL: both EMAIL_USER and EMAIL_PASS must be set.');
  console.error('  Put them in .env, then: docker compose up -d --force-recreate web');
  process.exit(1);
}

/* Google shows the app password as "abcd efgh ijkl mnop". The spaces are
   presentation only — pasted verbatim they usually still authenticate, but the
   length is the giveaway that one was copied with them, so say so. */
if (/\s/.test(pass)) {
  console.warn('  NOTE: the password contains spaces. Google displays app passwords');
  console.warn('        in groups of four; store it without spaces to be safe.');
}
if (pass.replace(/\s/g, '').length !== 16) {
  console.warn(
    `  NOTE: an app password is 16 characters; this one is ${pass.replace(/\s/g, '').length}.`
  );
  console.warn('        A normal account password will be rejected by Gmail SMTP.');
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: { user, pass },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 15000,
});

console.log('\n  connecting to smtp.gmail.com:587 …');
try {
  await transporter.verify();
  console.log('  OK: connected and authenticated.');
} catch (error) {
  console.error('  FAIL:', error.message);
  const hint = {
    EAUTH:
      'Credentials rejected. Use a Google App Password (16 chars), not the\n        account password, and make sure 2-Step Verification is on:\n        https://myaccount.google.com/apppasswords',
    ETIMEDOUT:
      'No answer from Gmail. Port 587 outbound is probably blocked — many\n        campus and ISP networks do this. Try another network.',
    ECONNECTION: 'Could not open the connection. Check DNS and outbound access.',
    ESOCKET: 'TLS negotiation failed. Check the clock and any TLS interception.',
  }[error.code];
  if (hint) console.error('  HINT:', hint);
  process.exit(1);
}

if (!recipient) {
  console.log('\n  Login works. Pass an address to send a real test message:');
  console.log('    ./scripts/test-email.sh you@example.com');
  process.exit(0);
}

console.log(`\n  sending a test message to ${recipient} …`);
const info = await transporter.sendMail({
  from: `"PSTU IT Carnival 2026" <${user}>`,
  to: recipient,
  subject: 'SMTP test — PSTU IT Carnival',
  text: 'If you are reading this, the carnival site can send mail. No registration was created.',
});
console.log('  OK: accepted by Gmail. Message ID:', info.messageId);
console.log('  accepted:', info.accepted.join(', ') || '(none)');
if (info.rejected?.length) console.log('  rejected:', info.rejected.join(', '));
console.log('\n  Check the inbox, and the spam folder if it is not there.');
