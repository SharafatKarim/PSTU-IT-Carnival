import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/server/db';
import IupcRegistration from '@/server/events/iupc/model';
import DatathonRegistration from '@/server/events/datathon/model';
import GamingRegistration from '@/server/events/gaming/model';
import { sendDatathonConfirmationEmail, sendGamingApprovalEmail } from '@/lib/email';
import { getGame } from '@/data/gaming';

const allowedEmails = process.env.ADMIN_EMAILS
  ? process.env.ADMIN_EMAILS.split(',').map((email) => email.trim().toLowerCase())
  : [];

async function verifyAdmin(req) {
  const session = await getServerSession();
  const email = session?.user?.email?.toLowerCase();
  if (!email || !allowedEmails.includes(email)) {
    return false;
  }
  return true;
}

export async function GET(req) {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const iupcTeams = await IupcRegistration.find({}).sort({ createdAt: -1 }).lean();
    const datathonTeams = await DatathonRegistration.find({}).sort({ createdAt: -1 }).lean();
    const gamingTeams = await GamingRegistration.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      data: {
        iupc: iupcTeams,
        datathon: datathonTeams,
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
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
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
      return NextResponse.json({ success: true, message: 'IUPC team marked as paid' });
    }

    return NextResponse.json({ success: false, message: 'Unsupported event type' }, { status: 400 });
  } catch (error) {
    console.error('[admin/registrations/PATCH] Error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
