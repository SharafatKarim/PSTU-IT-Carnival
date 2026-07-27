import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/server/db';
import IupcRegistration from '@/server/events/iupc/model';
import DatathonRegistration from '@/server/events/datathon/model';
import GamingRegistration from '@/server/events/gaming/model';
import ItQuizRegistration from '@/server/events/it-quiz/model';
import AdminLog from '@/server/admin/logModel';
import { sendDatathonConfirmationEmail, sendGamingApprovalEmail } from '@/lib/email';
import { getGame } from '@/data/gaming';
import { dropScreenshot } from '@/server/payments';

const allowedEmails = process.env.ADMIN_EMAILS
  ? process.env.ADMIN_EMAILS.split(',').map((email) => email.trim().toLowerCase())
  : [];

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
    const gamingTeams = await GamingRegistration.find({}).sort({ createdAt: -1 }).lean();

    /* Screenshot BYTES are never in these rows — only an ObjectId. The image
       is fetched one at a time from /api/v1/admin/screenshots/<id>, so opening
       the dashboard does not download every payment photo ever submitted. */
    return NextResponse.json({
      success: true,
      data: {
        iupc: iupcTeams,
        datathon: datathonTeams,
        'it-quiz': itQuiz,
        gaming: gamingTeams,
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

    if (action !== 'approve_payment' && action !== 'bulk_approve_payments') {
      return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
    }

    await connectDB();

    if (action === 'bulk_approve_payments') {
      if (!text || typeof text !== 'string') {
        return NextResponse.json({ success: false, message: 'Invalid or empty SMS text' }, { status: 400 });
      }

      const pendingDatathon = await DatathonRegistration.find({ paid: false });
      const pendingGaming = await GamingRegistration.find({ registrationStatus: 'pending' });

      const approvedDatathon = [];
      const approvedGaming = [];
      const failedEmails = [];

      // Bulk approve Datathon
      for (const team of pendingDatathon) {
        if (text.toLowerCase().includes(team.transactionId.toLowerCase())) {
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
        if (team.payment?.transactionId && text.toLowerCase().includes(team.payment.transactionId.toLowerCase())) {
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

      const totalCount = approvedDatathon.length + approvedGaming.length;

      // Log bulk approval
      if (totalCount > 0) {
        await AdminLog.create({
          adminEmail,
          action: 'bulk_approve_payments',
          eventType: 'general',
          details: {
            approvedDatathonCount: approvedDatathon.length,
            approvedGamingCount: approvedGaming.length,
            approvedDatathonTeams: approvedDatathon,
            approvedGamingTeams: approvedGaming,
          },
        });
      }

      let msg = `Bulk approval completed. Approved ${totalCount} team(s)/player(s) (Datathon: ${approvedDatathon.length}, Gaming: ${approvedGaming.length}).`;
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

      if (team.registrationStatus === 'paid') {
        return NextResponse.json({ success: false, message: 'Payment already approved' });
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
        });
      } catch (mailError) {
        console.error('[admin/approve-gaming] Email send failure:', mailError);
        return NextResponse.json({
          success: true,
          message: 'Payment approved, but confirmation email failed to send.',
        });
      }

      return NextResponse.json({ success: true, message: 'Gaming payment approved and confirmation email sent' });
    } else if (eventType === 'iupc') {
      const team = await IupcRegistration.findById(id);
      if (!team) {
        return NextResponse.json({ success: false, message: 'Team not found' }, { status: 404 });
      }

      team.paid = true;
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
        },
      });

      return NextResponse.json({ success: true, message: 'IUPC team marked as paid' });
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
    }

    return NextResponse.json({ success: false, message: 'Unsupported event type' }, { status: 400 });
  } catch (error) {
    console.error('[admin/registrations/PATCH] Error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
