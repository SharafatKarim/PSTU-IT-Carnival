import nodemailer from 'nodemailer';

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

/**
 * Sends a confirmation email to the IUPC team leader upon pre-registration.
 * 
 * @param {string} toEmail - Leader's email address
 * @param {string} teamName - Name of the registered team
 * @param {string} registrationId - Generated unique registration ID
 * @param {string} leaderName - Name of the team leader
 */
export async function sendIupcConfirmationEmail(toEmail, teamName, registrationId, leaderName) {
  const transporter = getTransporter();
  if (!transporter) return;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>IUPC Pre-Registration Confirmed</title>
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
          <h1>PSTU IT Carnival 2026</h1>
        </div>
        <div class="content">
          <h2>Pre-Registration Confirmed!</h2>
          <p>Hi ${leaderName},</p>
          <p>Your team <strong>${teamName}</strong> has been successfully pre-registered for the <strong>Inter-University Programming Contest (IUPC)</strong> at Patuakhali Science and Technology University.</p>
          
          <div class="highlight-box">
            <div class="reg-id-label">Team Registration ID</div>
            <div class="reg-id-val">${registrationId}</div>
            <div class="team-detail">Please save this ID. It will be required for all future communications and confirmation steps.</div>
          </div>

          <p>What happens next?</p>
          <ul>
            <li>Pre-registration closes on <strong>31 July 2026</strong>.</li>
            <li>Confirmed university-wise slot allocations will be published on our web portal shortly after pre-registration closes.</li>
            <li>Teams on the confirmed slots list can proceed with the final registration step and pay the entry fee of ৳3,000 per team.</li>
          </ul>

          <p>If you have any questions or need to request changes to your team structure, contact the event coordinators.</p>
          <p>Best regards,<br>IUPC Organizing Committee<br>PSTU IT Carnival 2026</p>
        </div>
        <div class="footer">
          <p>Organized by Patuakhali Science and Technology University</p>
          <p>Visit official website: <a href="https://itcarnival26.pstu.ac.bd" target="_blank">itcarnival26.pstu.ac.bd</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"PSTU IT Carnival 2026" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `IUPC Pre-Registration Confirmed - Team: ${teamName}`,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[email] Confirmation sent to ${toEmail} (Team: ${teamName}). Message ID: ${info.messageId}`);
  } catch (error) {
    console.error(`[email] Failed to send email confirmation to ${toEmail}:`, error);
    // Rethrow to let the caller know it failed, or let them catch it.
    throw error;
  }
}
