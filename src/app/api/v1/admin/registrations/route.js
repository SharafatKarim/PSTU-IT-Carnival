import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/server/db';
import IupcRegistration from '@/server/events/iupc/model';
import DatathonRegistration from '@/server/events/datathon/model';
import GamingRegistration from '@/server/events/gaming/model';
import ItQuizRegistration from '@/server/events/it-quiz/model';
import HackathonRegistration from '@/server/events/hackathon/model';
import VolunteerRegistration from '@/server/volunteer/model';
import ProjectShowcaseRegistration from '@/server/events/project-showcase/model';
import AdminLog from '@/server/admin/logModel';
import {
  sendDatathonConfirmationEmail,
  sendGamingApprovalEmail,
  sendProjectShowcaseConfirmationEmail,
  sendIupcPaymentApprovedEmail,
  sendIupcPaymentOpenEmail,
} from '@/lib/email';
import { getGame } from '@/data/gaming';
import { dropScreenshot } from '@/server/payments';

const allowedEmails = process.env.ADMIN_EMAILS
  ? process.env.ADMIN_EMAILS.split(',').map((email) => email.trim().toLowerCase())
  : [];

/* Does this SMS text quote this transaction ID?
 *
 * As a WHOLE TOKEN, not a substring. `text.includes(id)` looked equivalent and
 * was not: a team that submitted "BKB123" would be approved by an SMS carrying
 * somebody else's "BKB123XYZ", and a short reference like "100" matches the
 * amount in nearly every message. Either one hands out a free approval to
 * whoever guesses the shortest string, which is the opposite of what pasting a
 * bank SMS is meant to prove.
 *
 * Splitting on non-alphanumerics is enough: wallet references are alphanumeric
 * and always arrive delimited by spaces or punctuation ("TrxID BKB123XYZ.").
 * Comparison is case-insensitive because the stored value is uppercased. */
const smsQuotes = (text, transactionId) => {
  if (!transactionId) return false;
  const wanted = String(transactionId).trim().toLowerCase();
  if (!wanted) return false;

  /* An all-digit "reference" is refused for AUTO-approval, whatever it matches.
     Tokenising alone still let two things through, because both stand alone in
     a wallet SMS: the amount, and the sender's own number. Quote your own
     11-digit number as your transaction ID, send the committee 10 taka, and the
     message they paste to approve that transfer would have approved your unpaid
     entry as well.
     Real bKash and Nagad references carry letters (8N70QAM3P4), so this costs
     nothing. It only withholds the automatic path: an admin can still approve
     such a row by hand, having actually looked at it. */
  if (!/[a-z]/.test(wanted)) return false;

  return String(text)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .includes(wanted);
};

/* An entry that owed nothing when it was submitted. `amount` is written
   server-side from the tournament's fee, so this is the record of what was
   actually due — not a guess from the current config. Legacy rows saved before
   `amount` existed read as undefined and are treated as paid entries, which is
   what they were. */
const isFreeGamingEntry = (team) => team?.payment?.amount === 0;

/* Correspondence for a team goes to its leader alone — one mail per team, not
   three. Stored explicitly on the member rather than inferred from position,
   with the first row as the fallback for any legacy document written before
   the flag existed. */
const leaderOf = (team) =>
  (team.members || []).find((m) => m.isTeamLeader) || (team.members || [])[0];

async function getAdminEmail() {
  const session = await getServerSession();
  const email = session?.user?.email?.toLowerCase();
  if (email && allowedEmails.includes(email)) {
    return email;
  }
  return null;
}

export async function GET(req) {
  try {
    const adminEmail = await getAdminEmail();
    if (!adminEmail) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const iupcTeams = await IupcRegistration.find({}).sort({ createdAt: -1 }).lean();
    const datathonTeams = await DatathonRegistration.find({}).sort({ createdAt: -1 }).lean();
    const itQuiz = await ItQuizRegistration.find({}).sort({ createdAt: -1 }).lean();
    const hackathon = await HackathonRegistration.find({}).sort({ createdAt: -1 }).lean();
    const gamingTeams = await GamingRegistration.find({}).sort({ createdAt: -1 }).lean();
    const volunteers = await VolunteerRegistration.find({}).sort({ createdAt: -1 }).lean();
    const projectShowcase = await ProjectShowcaseRegistration.find({}).sort({ createdAt: -1 }).lean();

    /* Screenshot BYTES are never in these rows — only an ObjectId. The image
       is fetched one at a time from /api/v1/admin/screenshots/<id>, so opening
       the dashboard does not download every payment photo ever submitted. */
    return NextResponse.json({
      success: true,
      data: {
        iupc: iupcTeams,
        datathon: datathonTeams,
        'it-quiz': itQuiz,
        hackathon,
        gaming: gamingTeams,
        volunteer: volunteers,
        'project-showcase': projectShowcase,
      },
    });
  } catch (error) {
    console.error('[admin/registrations/GET] Error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const adminEmail = await getAdminEmail();
    if (!adminEmail) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, eventType, action, text } = body;

    const ACTIONS = [
      'approve_payment',
      'bulk_approve_payments',
      'notify_payment',
    ];
    if (!ACTIONS.includes(action)) {
      return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
    }

    await connectDB();

    /* Tells one team's leader that the fee is due, and records that we did.
     *
     * One team per request, by design. The sweep that did the whole list from
     * here has been removed: it reported teams as notified whose mail nobody
     * received, and a stamp that lies is worse than no stamp, because it tells
     * the next coordinator the job is done. The list goes out from a mail
     * client now — see the export in the panel — and this endpoint is for the
     * one-off, where a single send either works or says why it did not.
     *
     * Repeat sends are allowed. A leader saying the mail never arrived is a
     * support request, not an abuse case.
     *
     * The stamp is only written when the message actually left. send() returns
     * false with no SMTP configured, and marking a team notified because
     * EMAIL_USER was unset would hide the one failure nobody would notice. */
    if (action === 'notify_payment') {
      const team = await IupcRegistration.findById(id);
      if (!team) {
        return NextResponse.json({ success: false, message: 'Team not found' }, { status: 404 });
      }
      if (team.registrationStatus === 'paid') {
        return NextResponse.json(
          { success: false, message: 'This team has already paid — nothing to announce.' },
          { status: 400 }
        );
      }

      const leader = leaderOf(team);
      if (!leader?.email) {
        return NextResponse.json(
          { success: false, message: 'This team has no team leader email on record.' },
          { status: 400 }
        );
      }

      let sent;
      try {
        sent = await sendIupcPaymentOpenEmail({
          to: leader.email,
          leaderName: leader.name,
          teamName: team.teamName,
          registrationId: team.registrationId,
          varsityName: team.varsityName,
        });
      } catch (mailError) {
        console.error(`[admin/notify-iupc] Email failed for ${leader.email}:`, mailError);
        return NextResponse.json(
          { success: false, message: `Could not email ${leader.email}. Try again.` },
          { status: 502 }
        );
      }

      if (!sent) {
        return NextResponse.json(
          { success: false, message: 'Email is not configured on this server — nothing was sent.' },
          { status: 503 }
        );
      }

      team.paymentNotifiedAt = new Date();
      await team.save();

      await AdminLog.create({
        adminEmail,
        action: 'notify_payment',
        eventType: 'iupc',
        details: {
          teamId: team._id,
          teamName: team.teamName,
          registrationId: team.registrationId,
          notifiedEmail: leader.email,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Payment announcement sent to ${leader.email}`,
        data: { paymentNotifiedAt: team.paymentNotifiedAt },
      });
    }

    if (action === 'bulk_approve_payments') {
      if (!text || typeof text !== 'string') {
        return NextResponse.json({ success: false, message: 'Invalid or empty SMS text' }, { status: 400 });
      }

      const pendingDatathon = await DatathonRegistration.find({ paid: false });
      const pendingGaming = await GamingRegistration.find({ registrationStatus: 'pending' });
      /* Only teams that actually reported a transfer. A team still sitting at
         'pre-registered' has quoted nothing, so there is nothing to match. */
      const pendingIupc = await IupcRegistration.find({
        registrationStatus: 'payment-submitted',
      });

      const approvedDatathon = [];
      const approvedGaming = [];
      const approvedIupc = [];
      const failedEmails = [];

      // Bulk approve Datathon
      for (const team of pendingDatathon) {
        if (smsQuotes(text, team.transactionId)) {
          team.paid = true;
          await team.save();

          const leader = team.members.find((m) => m.isTeamLeader);
          if (leader && leader.kaggleEmail) {
            try {
              await sendDatathonConfirmationEmail(
                leader.kaggleEmail,
                team.teamName,
                team.registrationId,
                leader.name
              );
            } catch (mailError) {
              console.error(`[admin/bulk-approve] Failed to send email to ${leader.kaggleEmail}:`, mailError);
              failedEmails.push(team.teamName);
            }
          }
          approvedDatathon.push(team.teamName);
        }
      }

      // Bulk approve Gaming
      for (const team of pendingGaming) {
        /* A free tournament's entries owe nothing and carry no transaction ID,
           so an SMS sweep has nothing it could match them against and must
           never confirm one — PUBG is approved by hand. Skipped explicitly
           rather than left to fall through the transaction-ID test below, so
           the intent survives the next edit to this loop.

           Keyed on the amount STORED with the entry, not on today's fee: if
           PUBG ever charges again, entries taken while it was free still owe
           nothing and must stay out of the sweep. */
        if (isFreeGamingEntry(team)) continue;

        if (smsQuotes(text, team.payment?.transactionId)) {
          team.registrationStatus = 'paid';
          team.verifiedAt = new Date();
          await team.save();

          const gameConf = getGame(team.game) || { name: team.game.toUpperCase() };
          try {
            await sendGamingApprovalEmail({
              to: team.contact.email,
              name: team.contact.name,
              gameName: gameConf.name,
              registrationId: team.registrationId,
              teamName: team.teamName,
            });
          } catch (mailError) {
            console.error(`[admin/bulk-approve-gaming] Email failed for ${team.contact.email}:`, mailError);
            failedEmails.push(team.teamName || team.contact?.name || team.registrationId);
          }

          approvedGaming.push(team.teamName || team.contact?.name || team.registrationId);
        }
      }

      // Bulk approve IUPC entry fees
      for (const team of pendingIupc) {
        if (!smsQuotes(text, team.payment?.transactionId)) continue;

        team.registrationStatus = 'paid';
        team.verifiedAt = new Date();
        await team.save();

        const leader = leaderOf(team);
        if (leader?.email) {
          try {
            await sendIupcPaymentApprovedEmail({
              to: leader.email,
              leaderName: leader.name,
              teamName: team.teamName,
              registrationId: team.registrationId,
              amount: team.payment?.amount,
              transactionId: team.payment?.transactionId,
            });
          } catch (mailError) {
            console.error(`[admin/bulk-approve-iupc] Email failed for ${leader.email}:`, mailError);
            failedEmails.push(team.teamName);
          }
        }

        approvedIupc.push(team.teamName);
      }

      const totalCount =
        approvedDatathon.length + approvedGaming.length + approvedIupc.length;

      // Log bulk approval
      if (totalCount > 0) {
        await AdminLog.create({
          adminEmail,
          action: 'bulk_approve_payments',
          eventType: 'general',
          details: {
            approvedDatathonCount: approvedDatathon.length,
            approvedGamingCount: approvedGaming.length,
            approvedIupcCount: approvedIupc.length,
            approvedDatathonTeams: approvedDatathon,
            approvedGamingTeams: approvedGaming,
            approvedIupcTeams: approvedIupc,
          },
        });
      }

      let msg = `Bulk approval completed. Approved ${totalCount} team(s)/player(s) (Datathon: ${approvedDatathon.length}, Gaming: ${approvedGaming.length}, IUPC: ${approvedIupc.length}).`;
      if (failedEmails.length > 0) {
        msg += ` Email failed for: ${failedEmails.join(', ')}`;
      }

      return NextResponse.json({
        success: true,
        message: msg,
        data: {
          approvedCount: totalCount,
          approvedDatathon,
          approvedGaming,
          approvedIupc,
        },
      });
    }

    if (eventType === 'datathon') {
      const team = await DatathonRegistration.findById(id);
      if (!team) {
        return NextResponse.json({ success: false, message: 'Team not found' }, { status: 404 });
      }

      if (team.paid) {
        return NextResponse.json({ success: false, message: 'Payment already approved' });
      }

      team.paid = true;
      await team.save();

      // Log individual Datathon approval
      await AdminLog.create({
        adminEmail,
        action: 'approve_payment',
        eventType: 'datathon',
        details: {
          teamId: team._id,
          teamName: team.teamName,
          registrationId: team.registrationId,
        },
      });

      const leader = team.members.find((m) => m.isTeamLeader);
      if (leader && leader.kaggleEmail) {
        try {
          await sendDatathonConfirmationEmail(
            leader.kaggleEmail,
            team.teamName,
            team.registrationId,
            leader.name
          );
        } catch (mailError) {
          console.error('[admin/approve] Email send failure:', mailError);
          return NextResponse.json({
            success: true,
            message: 'Payment approved, but confirmation email failed to send.',
          });
        }
      }

      return NextResponse.json({ success: true, message: 'Payment approved and confirmation email sent' });
    } else if (eventType === 'gaming') {
      const team = await GamingRegistration.findById(id);
      if (!team) {
        return NextResponse.json({ success: false, message: 'Team not found' }, { status: 404 });
      }

      /* Free entries take the same manual path as paid ones — an admin still
         confirms each by hand — but nothing about them was a payment, so the
         wording of the log, the email and the response all switch. */
      const free = isFreeGamingEntry(team);

      if (team.registrationStatus === 'paid') {
        return NextResponse.json({
          success: false,
          message: free ? 'Registration already confirmed' : 'Payment already approved',
        });
      }

      team.registrationStatus = 'paid';
      team.verifiedAt = new Date();
      /* The screenshot existed to prove this payment. It has now done that, so
         it is deleted rather than kept — see src/server/payments/screenshot.js
         for why students' financial documents are not retained. */
      await dropScreenshot(team.payment?.screenshot);
      if (team.payment) team.payment.screenshot = null;
      await team.save();

      // Log individual Gaming approval
      await AdminLog.create({
        adminEmail,
        action: 'approve_payment',
        eventType: 'gaming',
        details: {
          teamId: team._id,
          teamName: team.teamName || 'Solo Entrant',
          registrationId: team.registrationId,
          game: team.game,
          /* The action enum stays 'approve_payment' for every gaming row; this
             is what tells the audit trail no money was involved. */
          free,
        },
      });

      const gameConf = getGame(team.game) || { name: team.game.toUpperCase() };
      try {
        await sendGamingApprovalEmail({
          to: team.contact.email,
          name: team.contact.name,
          gameName: gameConf.name,
          registrationId: team.registrationId,
          teamName: team.teamName,
          free,
        });
      } catch (mailError) {
        console.error('[admin/approve-gaming] Email send failure:', mailError);
        return NextResponse.json({
          success: true,
          message: free
            ? 'Registration confirmed, but the confirmation email failed to send.'
            : 'Payment approved, but confirmation email failed to send.',
        });
      }

      return NextResponse.json({
        success: true,
        message: free
          ? 'Registration confirmed and confirmation email sent'
          : 'Gaming payment approved and confirmation email sent',
      });
    } else if (eventType === 'iupc') {
      const team = await IupcRegistration.findById(id);
      if (!team) {
        return NextResponse.json({ success: false, message: 'Team not found' }, { status: 404 });
      }

      if (team.registrationStatus === 'paid') {
        return NextResponse.json({ success: false, message: 'Payment already approved' });
      }

      /* This wrote `team.paid = true`, a field the IUPC schema does not have —
         Mongoose drops unknown paths in strict mode, so the save succeeded, the
         panel reported success and the team stayed unpaid. The status enum is
         where this lives, same as the gaming rows. */
      team.registrationStatus = 'paid';
      team.verifiedAt = new Date();
      await team.save();

      // Log individual IUPC payment toggle
      await AdminLog.create({
        adminEmail,
        action: 'iupc_paid_toggle',
        eventType: 'iupc',
        details: {
          teamId: team._id,
          teamName: team.teamName,
          registrationId: team.registrationId,
          transactionId: team.payment?.transactionId,
        },
      });

      const iupcLeader = leaderOf(team);
      if (iupcLeader?.email) {
        try {
          await sendIupcPaymentApprovedEmail({
            to: iupcLeader.email,
            leaderName: iupcLeader.name,
            teamName: team.teamName,
            registrationId: team.registrationId,
            amount: team.payment?.amount,
            transactionId: team.payment?.transactionId,
          });
        } catch (mailError) {
          console.error('[admin/approve-iupc] Email send failure:', mailError);
          return NextResponse.json({
            success: true,
            message: 'Team marked as paid, but the confirmation email failed to send.',
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: 'IUPC team marked as paid and the team leader has been emailed',
      });
    } else if (eventType === 'it-quiz') {
      const entry = await ItQuizRegistration.findById(id);
      if (!entry) {
        return NextResponse.json({ success: false, message: 'Registration not found' }, { status: 404 });
      }
      if (entry.paid) {
        return NextResponse.json({ success: false, message: 'Payment already approved' });
      }

      entry.paid = true;
      /* The screenshot existed to prove this payment. It has now done that, so
         it is deleted rather than kept — see src/server/payments/screenshot.js
         for why students' financial documents are not retained. */
      await dropScreenshot(entry.payment?.screenshot);
      entry.payment.screenshot = null;
      await entry.save();

      /* Same audit trail the other three approvals write. The screenshot is
         gone after this, so the log is the only remaining record that someone
         looked at it and accepted the payment. */
      await AdminLog.create({
        adminEmail,
        action: 'approve_payment',
        eventType: 'it-quiz',
        details: {
          teamId: entry._id,
          teamName: entry.fullName,
          registrationId: entry.registrationId,
        },
      });

      return NextResponse.json({ success: true, message: 'Payment approved' });
    } else if (eventType === 'project-showcase') {
      const entry = await ProjectShowcaseRegistration.findById(id);
      if (!entry) {
        return NextResponse.json({ success: false, message: 'Registration not found' }, { status: 404 });
      }
      if (entry.paid) {
        return NextResponse.json({ success: false, message: 'Payment already approved' });
      }

      entry.paid = true;
      await entry.save();

      try {
        const leader = entry.members.find((m) => m.isTeamLeader) || entry.members[0];
        if (leader && leader.email) {
          await sendProjectShowcaseConfirmationEmail(
            leader.email,
            entry.teamName,
            entry.registrationId,
            leader.name
          );
        }
      } catch (err) {
        console.error('[admin/registrations/PATCH] Project Showcase email error:', err);
      }

      await AdminLog.create({
        adminEmail,
        action: 'approve_payment',
        eventType: 'project-showcase',
        details: {
          teamId: entry._id,
          teamName: entry.teamName,
          registrationId: entry.registrationId,
        },
      });

      return NextResponse.json({ success: true, message: 'Payment approved' });
    }

    return NextResponse.json({ success: false, message: 'Unsupported event type' }, { status: 400 });
  } catch (error) {
    console.error('[admin/registrations/PATCH] Error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
