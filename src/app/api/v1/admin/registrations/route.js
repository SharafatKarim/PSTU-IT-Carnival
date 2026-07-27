import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/server/db';
import IupcRegistration from '@/server/events/iupc/model';
import DatathonRegistration from '@/server/events/datathon/model';
import GamingRegistration from '@/server/events/gaming/model';
import { getGame } from '@/data/gaming';
import {
  sendDatathonConfirmationEmail,
  sendGamingPaymentApprovedEmail,
} from '@/lib/email';

/* Gaming entrants are only mailed for these tournaments. Nothing is sent on
   registration for any game — the one message is this approval — and for now
   only PUBG Mobile sends even that. Add a slug here to switch another on. */
const GAMING_EMAIL_ON_APPROVAL = ['pubg-mobile'];

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
    const { id, eventType, action } = body;

    if (!id || !eventType || action !== 'approve_payment') {
      return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
    }

    await connectDB();

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

      // Trigger Datathon confirmation email to the leader
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
          // Return success true still, since the database update succeeded.
          return NextResponse.json({
            success: true,
            message: 'Payment approved, but confirmation email failed to send.',
          });
        }
      }

      return NextResponse.json({ success: true, message: 'Payment approved and confirmation email sent' });
    } else if (eventType === 'iupc') {
      // If IUPC gets approved/paid in dashboard, support that too
      const team = await IupcRegistration.findById(id);
      if (!team) {
        return NextResponse.json({ success: false, message: 'Team not found' }, { status: 404 });
      }

      team.paid = true;
      await team.save();
      return NextResponse.json({ success: true, message: 'IUPC team marked as paid' });
    } else if (eventType === 'gaming') {
      const entry = await GamingRegistration.findById(id);
      if (!entry) {
        return NextResponse.json({ success: false, message: 'Registration not found' }, { status: 404 });
      }

      /* Guard the transition, not just the end state: re-approving would send
         a second "payment confirmed" mail for the same entry. */
      if (entry.registrationStatus === 'paid') {
        return NextResponse.json({ success: false, message: 'Payment already approved' });
      }

      /* The gaming model carries one field for this fact — registrationStatus
         — with no `paid` boolean, by design. */
      entry.registrationStatus = 'paid';
      entry.verifiedAt = new Date();
      await entry.save();

      if (!GAMING_EMAIL_ON_APPROVAL.includes(entry.game)) {
        return NextResponse.json({
          success: true,
          message: `Payment approved. No email is sent for ${entry.game}.`,
        });
      }

      const game = getGame(entry.game);
      if (!game || !entry.contact?.email) {
        return NextResponse.json({
          success: true,
          message: 'Payment approved, but no contact email was available to notify.',
        });
      }

      try {
        await sendGamingPaymentApprovedEmail({
          to: entry.contact.email,
          name: entry.contact.name,
          game,
          teamName: entry.teamName,
          registrationId: entry.registrationId,
        });
      } catch (mailError) {
        /* The status change is already committed and is the thing that
           matters; say so rather than implying the approval failed. */
        console.error('[admin/approve] Gaming email send failure:', mailError);
        return NextResponse.json({
          success: true,
          message: 'Payment approved, but confirmation email failed to send.',
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Payment approved and confirmation email sent',
      });
    }

    return NextResponse.json({ success: false, message: 'Unsupported event type' }, { status: 400 });
  } catch (error) {
    console.error('[admin/registrations/PATCH] Error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
