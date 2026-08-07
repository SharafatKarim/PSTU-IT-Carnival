import nodemailer from 'nodemailer';
import { getEventDetail, IUPC_PAYMENT, iupcPaymentTotal } from '@/data/events';

// ---------------------------------------------------------------------------
// Registration confirmation mail.
//
// Two events send one, and they must look like the same festival: the shell
// below (styles, header, footer, the registration-ID panel) is shared, and each
// sender supplies only its own body copy.
//
// Inline styles and a <style> block both, because mail clients disagree about
// which they honour — Gmail strips most of the block, Outlook ignores much of
// the rest. Keep any change working in plain HTML; nothing here can rely on
// modern CSS.
// ---------------------------------------------------------------------------

const SITE = 'itcarnival26.pstu.ac.bd';
const BRAND = 'PSTU IT Carnival 2026';

/* Read from the data rather than written here. The date was spelled out in the
   IUPC confirmation email, so extending the deadline meant remembering that
   this file existed — and an email that contradicts the site is worse than one
   that omits the date. */
const IUPC_DEADLINE = getEventDetail('iupc')?.tournament?.deadline || '';

/**
 * Creates and returns the nodemailer SMTP transporter configured for Gmail.
 */
function getTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn('[email] EMAIL_USER or EMAIL_PASS environment variables are missing. Emails will not be sent.');
    return null;
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use STARTTLS on port 587
    auth: { user, pass },
    connectionTimeout: 15000, // 15 seconds connection timeout
    greetingTimeout: 15000,
    socketTimeout: 15000,
  });
}

/* Anything interpolated into the HTML comes from a registration form, so it is
   attacker-controlled text. Escape it — a team name containing a tag would
   otherwise break the layout of every copy of this mail. */
const esc = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * The carnival-branded shell every confirmation shares.
 *
 * @param {object} opts
 * @param {string} opts.title      <title>, and what the header reads under
 * @param {string} opts.heading    the h2 above the body copy
 * @param {string} opts.idLabel    caption on the highlighted ID panel
 * @param {string} opts.id         the registration ID itself
 * @param {string} opts.idNote     small print under the ID
 * @param {string} opts.body       body HTML — already escaped by the caller
 */
const shell = ({ title, heading, idLabel, id, idNote, body }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${esc(title)}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #0b061e;
          color: #d1cbe5;
          margin: 0;
          padding: 20px;
          -webkit-font-smoothing: antialiased;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #150f30;
          border: 1px solid #332663;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
        }
        .header {
          background-color: #0b061e;
          padding: 30px;
          text-align: center;
          border-bottom: 1px solid #23194c;
        }
        .header h1 {
          color: #ffffff;
          font-size: 24px;
          margin: 5px 0 0 0;
          letter-spacing: 1px;
        }
        .content {
          padding: 35px 30px;
          line-height: 1.6;
        }
        .content h2 {
          color: #ffffff;
          font-size: 20px;
          margin-top: 0;
        }
        .highlight-box {
          background: linear-gradient(135deg, #1b1340 0%, #291c60 100%);
          border: 1px solid #4a3399;
          border-radius: 12px;
          padding: 20px;
          margin: 25px 0;
          text-align: center;
        }
        .reg-id-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #a692ff;
          margin-bottom: 5px;
          font-weight: bold;
        }
        .reg-id-val {
          font-size: 28px;
          font-weight: 800;
          color: #ffd700;
          letter-spacing: 1px;
          font-family: monospace;
          margin: 0;
          text-shadow: 0 2px 10px rgba(255, 215, 0, 0.2);
        }
        .team-detail {
          margin-top: 15px;
          font-size: 14px;
          color: #b0a5cf;
        }
        .facts {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 14px;
        }
        .facts td {
          padding: 8px 0;
          border-bottom: 1px solid #23194c;
          color: #b0a5cf;
        }
        .facts td.label {
          color: #7b6d9e;
          width: 42%;
        }
        .facts td.value {
          color: #ffffff;
          font-weight: 600;
          text-align: right;
        }
        .footer {
          background-color: #0b061e;
          padding: 25px 30px;
          text-align: center;
          font-size: 12px;
          color: #7b6d9e;
          border-top: 1px solid #23194c;
        }
        .footer a {
          color: #00ffff;
          text-decoration: none;
          font-weight: 600;
        }
        .footer a:hover {
          text-decoration: underline;
        }
        .btn {
          display: inline-block;
          background-color: #ffd700;
          color: #000000;
          font-weight: bold;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 8px;
          margin-top: 15px;
          box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
        }
        .btn:hover {
          background-color: #ffea70;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${BRAND}</h1>
        </div>
        <div class="content">
          <h2>${esc(heading)}</h2>
          ${body}

          <div class="highlight-box">
            <div class="reg-id-label">${esc(idLabel)}</div>
            <div class="reg-id-val">${esc(id)}</div>
            <div class="team-detail">${esc(idNote)}</div>
          </div>
        </div>
        <div class="footer">
          <p>Organized by Patuakhali Science and Technology University</p>
          <p>Visit official website: <a href="https://${SITE}" target="_blank">${SITE}</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

/* Returns true when a message actually left, false when SMTP is not configured
   and this was a no-op. Most callers ignore it — a confirmation that silently
   does not send is the documented off state. The notify sweep does not: its
   whole purpose is to record who has been told, and marking 49 teams notified
   because EMAIL_USER was unset would be worse than sending nothing. */
async function send({ to, subject, html }) {
  const transporter = getTransporter();
  if (!transporter) return false;

  try {
    const info = await transporter.sendMail({
      from: `"${BRAND}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[email] Sent to ${to} — "${subject}". Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[email] Failed to send to ${to}:`, error);
    // Rethrow so the caller can log it against the registration it belongs to.
    throw error;
  }
}

/**
 * Sends a confirmation email to the IUPC team leader upon pre-registration.
 *
 * @param {string} toEmail - Leader's email address
 * @param {string} teamName - Name of the registered team
 * @param {string} registrationId - Generated unique registration ID
 * @param {string} leaderName - Name of the team leader
 */
/* Tells a pre-registered team that the entry fee is now due.
 *
 * Sent from the admin panel, per team or as a sweep — nothing automatic. It is
 * an announcement rather than a receipt, so it is the one IUPC mail that has to
 * carry the whole instruction: what to send, where, by when, and what to do
 * afterwards. A team leader who reads only this email must be able to pay
 * without visiting the site first, because some of them will try.
 *
 * Every figure and the deadline come from IUPC_PAYMENT, the same constant the
 * payment form and the server-side amount check read. Nothing here is typed a
 * second time: an email that quotes a different number than the form is how a
 * team ends up sending the wrong amount and blaming us for it. */
export async function sendIupcPaymentOpenEmail({
  to,
  leaderName,
  teamName,
  registrationId,
  varsityName,
}) {
  const total = iupcPaymentTotal();
  const payUrl = `https://${SITE}/events/iupc/teams`;

  const html = shell({
    title: 'IUPC Entry Fee — Final Registration Open',
    heading: 'Final registration is open',
    idLabel: 'Team Registration ID',
    id: registrationId,
    idNote: 'Find your team by this ID on the directory page.',
    body: `
          <p>Hi ${esc(leaderName)},</p>
          <p>Your team <strong>${esc(teamName)}</strong>${varsityName ? ` from <strong>${esc(varsityName)}</strong>` : ''} is pre-registered for the <strong>Inter-University Programming Contest (IUPC)</strong> at ${BRAND}.</p>
          <p><strong>Every pre-registered team has been selected.</strong> There is no shortlist and no cut — your place is held, and the entry fee is the last step to confirm it.</p>

          <table class="facts" role="presentation" cellpadding="0" cellspacing="0">
            <tr><td class="label">Entry fee</td><td class="value">BDT ${IUPC_PAYMENT.fee}</td></tr>
            <tr><td class="label">Cash-out charge</td><td class="value">BDT ${IUPC_PAYMENT.cashOutCharge}</td></tr>
            <tr><td class="label">Total to send</td><td class="value">BDT ${total}</td></tr>
            <tr><td class="label">Send to (${esc(IUPC_PAYMENT.accountType)})</td><td class="value">${esc(IUPC_PAYMENT.number)}</td></tr>
            <tr><td class="label">Accepted wallets</td><td class="value">${esc(IUPC_PAYMENT.methods.join(' / '))}</td></tr>
            <tr><td class="label">Pay before</td><td class="value">${esc(IUPC_PAYMENT.deadline)}</td></tr>
          </table>

          <p><strong>How to pay</strong></p>
          <ol>
            <li>Send <strong>BDT ${total}</strong> to <strong>${esc(IUPC_PAYMENT.number)}</strong> using &ldquo;Send Money&rdquo; &mdash; not &ldquo;Payment&rdquo; &mdash; from ${esc(IUPC_PAYMENT.methods.join(' or '))}.</li>
            <li>Open the team directory below and find <strong>${esc(teamName)}</strong>.</li>
            <li>Press <strong>Pay</strong>, then enter this email address and the transaction ID your wallet gave you.</li>
          </ol>

          <p style="text-align:center;">
            <a href="${payUrl}" class="btn" target="_blank">Pay for your team</a>
          </p>
          <p style="font-size:12px;color:#7b6d9e;text-align:center;">If the button does not work, open<br><a href="${payUrl}" style="color:#00ffff;">${payUrl}</a></p>

          <p>Your team's status becomes <strong>Awaiting check</strong> the moment you submit, and <strong>Paid</strong> once a coordinator matches your transfer against our records. You will get a confirmation email at that point — this one is not a receipt.</p>
          <p><strong>Teams that have not paid by ${esc(IUPC_PAYMENT.deadline)} may lose their slot.</strong> If you have already paid, no action is needed.</p>
          <p>Questions about the fee or a payment that has not been picked up? Reply to this email or contact the coordinators.</p>
          <p>Best regards,<br>IUPC Organizing Committee<br>${BRAND}</p>`,
  });

  return send({
    to,
    subject: `Entry fee now open — ${teamName} — pay by ${IUPC_PAYMENT.deadline}`,
    html,
  });
}

/* Sent when a coordinator matches a team's entry-fee transfer against the
   wallet statement — from the admin panel, individually or through the SMS
   sweep. Goes to the team leader alone: correspondence for a team is one mail,
   not three, which is what the isTeamLeader flag on the member exists for. */
export async function sendIupcPaymentApprovedEmail({
  to,
  leaderName,
  teamName,
  registrationId,
  amount,
  transactionId,
}) {
  /* A team approved by hand — one that paid at the desk and never touched the
     form — has no reference and no recorded amount. Printing the labels anyway
     gave it "Amount received: BDT" and an empty transaction ID, which reads as
     a broken mail rather than a cash payment. Each row appears only if there is
     something in it, and the table disappears entirely when there is not. */
  const receipt = [
    amount && `<tr><td style="padding:2px 12px 2px 0;color:#666;">Amount received</td><td style="padding:2px 0;"><strong>BDT ${esc(amount)}</strong></td></tr>`,
    transactionId && `<tr><td style="padding:2px 12px 2px 0;color:#666;">Transaction ID</td><td style="padding:2px 0;"><strong>${esc(transactionId)}</strong></td></tr>`,
  ]
    .filter(Boolean)
    .join('');

  const html = shell({
    title: 'IUPC Entry Fee Confirmed',
    heading: 'Payment Confirmed!',
    idLabel: 'Team Registration ID',
    id: registrationId,
    idNote: 'Keep this ID — you will be asked for it at the contest desk.',
    body: `
          <p>Hi ${esc(leaderName)},</p>
          <p>We have matched your entry-fee payment for <strong>${esc(teamName)}</strong> against our records. Your team's place at the <strong>Inter-University Programming Contest (IUPC)</strong> is now confirmed.</p>
          ${receipt && `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0;font-size:14px;">${receipt}</table>`}
          <p>What happens next?</p>
          <ul>
            <li>Your team is on the confirmed list — no further payment is needed.</li>
            <li>Contest-day instructions, reporting time and seating go to this address.</li>
            <li>Bring your registration ID and every member's student ID card on the day.</li>
          </ul>
          <p>If anything above looks wrong, reply to this email or contact the coordinators.</p>
          <p>Best regards,<br>IUPC Organizing Committee<br>${BRAND}</p>`,
  });

  await send({
    to,
    subject: `Entry Fee Confirmed — ${teamName} — ${registrationId}`,
    html,
  });
}

export async function sendIupcConfirmationEmail(toEmail, teamName, registrationId, leaderName) {
  const html = shell({
    title: 'IUPC Pre-Registration Confirmed',
    heading: 'Pre-Registration Confirmed!',
    idLabel: 'Team Registration ID',
    id: registrationId,
    idNote:
      'Please save this ID. It will be required for all future communications and confirmation steps.',
    body: `
          <p>Hi ${esc(leaderName)},</p>
          <p>Your team <strong>${esc(teamName)}</strong> has been successfully pre-registered for the <strong>Inter-University Programming Contest (IUPC)</strong> at Patuakhali Science and Technology University.</p>
          <p>What happens next?</p>
          <ul>
            <li>Pre-registration closes on <strong>${esc(IUPC_DEADLINE)}</strong>.</li>
            <li>Confirmed university-wise slot allocations will be published on our web portal shortly after pre-registration closes.</li>
            <li>Teams on the confirmed slots list can proceed with the final registration step and pay the entry fee of ৳3,000 per team.</li>
          </ul>
          <p>If you have any questions or need to request changes to your team structure, contact the event coordinators.</p>
          <p>Best regards,<br>IUPC Organizing Committee<br>${BRAND}</p>`,
  });

  await send({
    to: toEmail,
    subject: `IUPC Pre-Registration Confirmed - Team: ${teamName}`,
    html,
  });
}

/**
 * Sends a confirmation email for a gaming tournament registration.
 *
 * One mail per registration, addressed to players[0] — the squad leader on a
 * team entry, the entrant themselves otherwise. Players 2–4 give only a game
 * ID, so there is no other address to write to.
 *
 * @param {object} opts
 * @param {string} opts.to             recipient address
 * @param {string} opts.name           recipient's name
 * @param {object} opts.game           the game config from src/data/gaming.js
 * @param {string} opts.entryType      'team' | 'individual' | 'solo'
 * @param {string} [opts.teamName]     squad name, team entries only
 * @param {number} opts.playerCount    how many players are on this entry
 * @param {string} opts.registrationId generated unique registration ID
 * @param {object} [opts.payment]      what was submitted on the payment step
 */
export async function sendGamingConfirmationEmail({
  to,
  name,
  game,
  entryType,
  teamName,
  playerCount,
  registrationId,
  payment,
}) {
  const t = game.tournament;

  const what =
    entryType === 'team'
      ? `your squad <strong>${esc(teamName)}</strong> (${playerCount} player${playerCount === 1 ? '' : 's'})`
      : entryType === 'individual'
        ? 'your individual entry'
        : 'your entry';

  /* Solo entrants have not been told who they are playing with yet, and that
     is the single most likely question this mail will be answered with. */
  const randomTeamNote =
    entryType === 'individual'
      ? `<li>You entered on your own, so the committee will place you in a squad with other solo entrants. Your teammates are announced in the official group before the first match.</li>`
      : '';

  /* The payment lines are the receipt half of this mail — the entrant has just
     sent money to a number they were shown once, and this is the only durable
     record they get of what they paid and against which reference. */
  const facts = [
    ['Tournament', game.name],
    ['Date', t.date],
    ['Time', t.time],
    ['Venue', t.venue],
    payment?.amount != null && ['Amount paid', `৳${payment.amount}`],
    payment?.method && ['Paid with', payment.method],
    payment?.transactionId && ['Transaction ID', payment.transactionId],
    payment?.receiverNumber && ['Sent to', payment.receiverNumber],
  ]
    .filter(Boolean)
    .map(
      ([label, value]) =>
        `<tr><td class="label">${esc(label)}</td><td class="value">${esc(value)}</td></tr>`
    )
    .join('');

  const html = shell({
    title: `${game.name} Registration Confirmed`,
    heading: 'Registration Confirmed!',
    idLabel: 'Registration ID',
    id: registrationId,
    idNote: 'Save this ID — it is how the committee identifies your entry at the desk.',
    body: `
          <p>Hi ${esc(name)},</p>
          <p>${what} is registered for the <strong>${esc(game.name)}</strong> tournament at ${BRAND}.</p>
          <table class="facts">${facts}</table>
          <p>What happens next?</p>
          <ul>
            <li>Your entry is <strong>pending</strong> until the committee matches your transaction ID against the wallet statement. It shows as <strong>confirmed</strong> on the tournament's registered list once that is done.</li>
            <li>Registration closes on <strong>${esc(t.deadline)}</strong>. Details cannot be changed after that.</li>
            ${randomTeamNote}
            <li>Bring this ID and your student ID to the desk on match day.</li>
            <li>Room IDs, passwords and match times are announced in the official tournament group — we use the WhatsApp number from your form to add you.</li>
          </ul>
          <p>If anything above is wrong, reply to this email or contact the coordinators listed on the tournament page.</p>
          <p>Best regards,<br>Gaming Fest Organizing Committee<br>${BRAND}</p>`,
  });

  await send({
    to,
    subject: `${game.name} Registration Confirmed — ${registrationId}`,
    html,
  });
}

/**
 * Sent when an admin moves a gaming registration from pending to paid.
 *
 * Deliberately NOT sendGamingConfirmationEmail: that one tells the entrant
 * "your entry is pending until the committee matches your transaction ID",
 * which is precisely what has just stopped being true. Reusing it here would
 * tell an approved squad they are still waiting.
 *
 * @param {object}  args
 * @param {string}  args.to             Contact email on the registration
 * @param {string}  args.name           Contact name
 * @param {object}  args.game           Game config from src/data/gaming.js
 * @param {string}  [args.teamName]     Squad name, absent for solo entries
 * @param {string}  args.registrationId
 */
export async function sendGamingPaymentApprovedEmail({
  to,
  name,
  game,
  teamName,
  registrationId,
}) {
  const t = game.tournament;
  const who = teamName ? `your squad <strong>${esc(teamName)}</strong>` : 'your entry';

  const when = [
    t?.date && `<li>Tournament day: <strong>${esc(t.date)}</strong>${t.time ? `, ${esc(t.time)}` : ''}.</li>`,
    t?.venue && `<li>Venue: <strong>${esc(t.venue)}</strong>.</li>`,
  ]
    .filter(Boolean)
    .join('');

  const html = shell({
    title: `${game.name} Payment Confirmed`,
    heading: 'Payment Confirmed!',
    idLabel: 'Registration ID',
    id: registrationId,
    idNote: 'Bring this with you — it is how we identify you on the day.',
    body: `
          <p>Hi ${esc(name)},</p>
          <p>Your payment has been verified and ${who} is now fully confirmed for the <strong>${esc(game.name)}</strong> tournament at ${BRAND}. Nothing further is needed from you.</p>

          <p>What happens next?</p>
          <ul>
            ${when}
            <li>Your entry now shows as <strong>confirmed</strong> on the tournament's registered list.</li>
            <li>Room IDs, passwords and match times are shared with the contact on this registration before the first match.</li>
          </ul>

          <p>If anything above is wrong, reply to this email or contact the coordinators listed on the tournament page.</p>
          <p>Best regards,<br>Gaming Fest Organizing Committee<br>${BRAND}</p>`,
  });

  await send({
    to,
    subject: `${game.name} Payment Confirmed — ${registrationId}`,
    html,
  });
}

/**
 * Sends a confirmation email to the Datathon team leader upon payment approval.
 * 
 * @param {string} toEmail - Leader's email address
 * @param {string} teamName - Name of the registered team
 * @param {string} registrationId - Generated unique registration ID
 * @param {string} leaderName - Name of the team leader
 */
export async function sendDatathonConfirmationEmail(toEmail, teamName, registrationId, leaderName) {
  const transporter = getTransporter();
  if (!transporter) return;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light dark">
      <meta name="supported-color-schemes" content="light dark">
      <title>Datathon Registration Confirmed</title>
      <style>
        :root {
          color-scheme: light dark;
          supported-color-schemes: light dark;
        }
        body, table, td, p, a, li {
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
        }
        u + #body a {
          color: inherit;
          text-decoration: none;
        }
        @media only screen and (max-width: 600px) {
          .main-card {
            width: 100% !important;
          }
          .content-padding {
            padding: 20px 15px !important;
          }
          .reg-id-val {
            font-size: 22px !important;
          }
        }
      </style>
    </head>
    <body id="body" style="margin: 0; padding: 0; background-color: #0b061e; color: #d1cbe5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased;">
      
      <!-- Outer Wrapper Table -->
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0b061e; table-layout: fixed; width: 100%;">
        <tr>
          <td align="center" style="padding: 20px 10px; background-color: #0b061e;">
            
            <!-- Main Content Container -->
            <table border="0" cellpadding="0" cellspacing="0" width="100%" class="main-card" style="max-width: 600px; background-color: #150f30; border: 1px solid #332663; border-radius: 16px; overflow: hidden; border-collapse: separate;">
              
              <!-- Header -->
              <tr>
                <td align="center" style="background-color: #0b061e; padding: 30px; border-bottom: 1px solid #23194c;">
                  <h1 style="color: #ffffff !important; font-size: 24px; margin: 0; letter-spacing: 1px; font-weight: 700;">PSTU IT Carnival 2026</h1>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td class="content-padding" style="padding: 35px 30px; background-color: #150f30; color: #d1cbe5 !important; line-height: 1.6; font-size: 15px;">
                  <h2 style="color: #ffffff !important; font-size: 20px; margin-top: 0; margin-bottom: 16px;">Datathon Registration Confirmed!</h2>
                  
                  <p style="color: #d1cbe5 !important; margin: 0 0 15px 0;">Hi <strong style="color: #ffffff !important;">${
      leaderName}</strong>,</p>
                  
                  <p style="color: #d1cbe5 !important; margin: 0 0 20px 0;">
                    Your team <strong style="color: #ffffff !important;">${
      teamName}</strong> has been successfully registered for the <strong style="color: #ffffff !important;">PSTU Online Datathon 2026</strong>. We have verified your bKash payment transaction.
                  </p>

                  <!-- Highlight Box -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 25px 0;">
                    <tr>
                      <td align="center" style="background-color: #1b1340; border: 1px solid #4a3399; border-radius: 12px; padding: 20px;">
                        <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #a692ff !important; font-weight: bold; margin-bottom: 5px;">Registration ID</div>
                        <div class="reg-id-val" style="font-size: 28px; font-weight: 800; color: #ffd700 !important; letter-spacing: 1px; font-family: monospace; margin: 0;">${
      registrationId}</div>
                        <div style="margin-top: 15px; font-size: 14px; color: #b0a5cf !important;">Your registration is now fully confirmed. Please keep this ID safe for contest activities.</div>
                      </td>
                    </tr>
                  </table>

                  <p style="color: #ffffff !important; font-weight: bold; margin: 20px 0 10px 0;">Contest details:</p>
                  <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #d1cbe5 !important;">
                    <li style="margin-bottom: 8px;"><strong style="color: #ffffff !important;">Contest Start Date</strong>: August 8, 2026</li>
                    <li style="margin-bottom: 8px;"><strong style="color: #ffffff !important;">Contest Platform</strong>: Online (Submission Form released on August 11, 2026)</li>
                    <li style="margin-bottom: 8px;"><strong style="color: #ffffff !important;">Submission Deadline</strong>: August 13, 2026 (6:00 AM)</li>
                  </ul>

                  <p style="color: #d1cbe5 !important; margin: 0 0 20px 0;">
                    To ensure you don't miss any critical announcements, competition rules, or Kaggle updates, please join our official WhatsApp group below:<br/>
                    <strong>WhatsApp Group Link:</strong> <a href="https://chat.whatsapp.com/ByP45c2kLqPBwZlohyaFSS" target="_blank" style="color: #00ffff !important; text-decoration: none; font-weight: 600;">https://chat.whatsapp.com/ByP45c2kLqPBwZlohyaFSS</a><br/>
                    <strong>kaggle Compitation Link:</strong> <a href="https://www.kaggle.com/t/e71fc661c2574a239ab2ae35b00e427a " target="_blank" style="color: #00ffff !important; text-decoration: none; font-weight: 600;">https://www.kaggle.com/t/e71fc661c2574a239ab2ae35b00e427a </a><br/>
                    also share the link with your teammates and Happy coding!
                  </p>

                  <p style="color: #d1cbe5 !important; margin: 0 0 15px 0;">If you have any questions or support inquiries, feel free to contact the coordinators.</p>
                  
                  <p style="color: #d1cbe5 !important; margin: 0;">
                    Best regards,<br>
                    <span style="color: #ffffff !important; font-weight: 600;">Datathon Organizing Committee</span><br>
                    PSTU IT Carnival 2026
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td align="center" style="background-color: #0b061e; padding: 25px 30px; font-size: 12px; color: #7b6d9e !important; border-top: 1px solid #23194c;">
                  <p style="margin: 0 0 5px 0; color: #7b6d9e !important;">Organized by Patuakhali Science and Technology University</p>
                  <p style="margin: 0; color: #7b6d9e !important;">
                    Visit official website: 
                    <a href="https://itcarnival26.pstu.ac.bd" target="_blank" style="color: #00ffff !important; text-decoration: none; font-weight: 600;">itcarnival26.pstu.ac.bd</a>
                  </p>
                  
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>

    </body>
    </html>
  `;

  const mailOptions = {
    from: `"PSTU IT Carnival 2026" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Datathon Registration Confirmed - Team: ${teamName}`,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[email] Datathon Confirmation sent to ${toEmail} (Team: ${teamName}). Message ID: ${info.messageId}`);
  } catch (error) {
    console.error(`[email] Failed to send Datathon email confirmation to ${toEmail}:`, error);
    throw error;
  }
}

/**
 * Sends a payment verification / approval email for a gaming tournament registration.
 * 
 * @param {object} opts
 * @param {string} opts.to             recipient email address
 * @param {string} opts.name           recipient contact's name
 * @param {string} opts.gameName       the display name of the game (e.g. PUBG Mobile)
 * @param {string} opts.registrationId generated unique registration ID
 * @param {string} [opts.teamName]     squad name, team entries only
 */
/* Sent when an admin confirms a gaming entry by hand.
 *
 * `free` switches every mention of money out of it. A free tournament (PUBG
 * from 30 July 2026) is still confirmed one entry at a time by a human, but
 * telling that entrant we "verified your payment" would describe a transfer
 * they were never asked to make. */
export async function sendGamingApprovalEmail({
  to,
  name,
  gameName,
  registrationId,
  teamName,
  free = false,
}) {
  const html = shell({
    title: free ? `${gameName} Registration Confirmed` : `${gameName} Payment Verified`,
    heading: free ? 'Registration Confirmed!' : 'Payment Approved!',
    idLabel: 'Registration ID',
    id: registrationId,
    idNote: 'Keep this ID safe — you will need it at the desk on match day.',
    body: `
          <p>Hi ${esc(name)},</p>
          ${
            free
              ? `<p>Your entry to the <strong>${esc(gameName)}</strong> tournament at ${BRAND} has been checked and confirmed by the organizing committee.</p>
          ${teamName ? `<p>Your squad <strong>${esc(teamName)}</strong> is in.</p>` : ''}
          <p>${esc(gameName)} is free to enter, so there is nothing to pay — your place is secured and your registration status is now <strong>Confirmed</strong>.</p>`
              : `<p>We have successfully verified your payment for the <strong>${esc(gameName)}</strong> tournament at ${BRAND}.</p>
          ${teamName ? `<p>Your squad <strong>${esc(teamName)}</strong> has been successfully approved.</p>` : ''}
          <p>Your registration status is now officially updated to <strong>Confirmed (Paid)</strong>.</p>`
          }
          <p>What happens next?</p>
          <ul>
            <li>You and your teammates will be added to the official WhatsApp match coordination group using the phone numbers provided.</li>
            <li>Bring your Registration ID and student ID card to the desk on match day.</li>
          </ul>
          <p>If you have any questions or require support, contact the event coordinators.</p>
          <p>Best regards,<br>Gaming Fest Organizing Committee<br>${BRAND}</p>`,
  });

  await send({
    to,
    subject: free
      ? `Registration Confirmed — ${gameName} — ${registrationId}`
      : `Payment Approved — ${gameName} — ${registrationId}`,
    html,
  });
}

/**
 * Sends a confirmation email to the Project Showcasing team leader upon payment approval.
 * 
 * @param {string} toEmail - Leader's email address
 * @param {string} teamName - Name of the registered team
 * @param {string} registrationId - Generated unique registration ID
 * @param {string} leaderName - Name of the team leader
 */
export async function sendProjectShowcaseConfirmationEmail(toEmail, teamName, registrationId, leaderName) {
  const html = shell({
    title: 'Project Showcasing Registration Confirmed',
    heading: 'Payment Confirmed!',
    idLabel: 'Registration ID',
    id: registrationId,
    idNote: 'Keep this ID safe — it identifies your project team on the event day.',
    body: `
          <p>Hi ${esc(leaderName)},</p>
          <p>Your team <strong>${esc(teamName)}</strong> has been successfully registered for the <strong>Project Showcasing</strong> event at ${BRAND}. We have verified your payment.</p>
          <p>What happens next?</p>
          <ul>
            <li>The exhibition and judging will take place on <strong>13 August 2026</strong> starting from <strong>2:00 PM onwards</strong>.</li>
            <li>Venue: <strong>PME Lab</strong>.</li>
            <li>Make sure to arrive early with your functional hardware setup, laptops, required cables, and extension cords.</li>
            <li>Offline presence of at least one team member is mandatory.</li>
          </ul>
          <p>If you have any questions, reply to this email or contact the event coordinators.</p>
          <p>Best regards,<br>Project Showcasing Committee<br>${BRAND}</p>`,
  });

  await send({
    to: toEmail,
    subject: `Project Showcasing Confirmed — ${registrationId}`,
    html,
  });
}


