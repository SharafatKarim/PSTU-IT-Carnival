import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/server/db';
import IupcRegistration from '@/server/events/iupc/model';
import DatathonRegistration from '@/server/events/datathon/model';
import { sendDatathonConfirmationEmail } from '@/lib/email';
import ItQuizRegistration from '@/server/events/it-quiz/model';
import GamingRegistration from '@/server/events/gaming/model';
import { dropScreenshot } from '@/server/payments';

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
    const itQuiz = await ItQuizRegistration.find({}).sort({ createdAt: -1 }).lean();
    const gaming = await GamingRegistration.find({}).sort({ createdAt: -1 }).lean();

    /* Screenshot BYTES are never in these rows — only an ObjectId. The image
       is fetched one at a time from /api/v1/admin/screenshots/<id>, so opening
       the dashboard does not download every payment photo ever submitted. */
    return NextResponse.json({
      success: true,
      data: {
        iupc: iupcTeams,
        datathon: datathonTeams,
        'it-quiz': itQuiz,
        gaming,
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

      return NextResponse.json({ success: true, message: 'Payment approved' });
    } else if (eventType === 'gaming') {
      const entry = await GamingRegistration.findById(id);
      if (!entry) {
        return NextResponse.json({ success: false, message: 'Registration not found' }, { status: 404 });
      }
      if (entry.payment?.verified) {
        return NextResponse.json({ success: false, message: 'Payment already approved' });
      }

      entry.payment.verified = true;
      entry.payment.verifiedAt = new Date();
      await dropScreenshot(entry.payment?.screenshot);
      entry.payment.screenshot = null;
      await entry.save();

      return NextResponse.json({ success: true, message: 'Payment approved' });
    }

    return NextResponse.json({ success: false, message: 'Unsupported event type' }, { status: 400 });
  } catch (error) {
    console.error('[admin/registrations/PATCH] Error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
