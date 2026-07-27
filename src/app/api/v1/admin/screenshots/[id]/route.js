import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import connectDB from '@/server/db';
import { PaymentScreenshot } from '@/server/payments/screenshot';
import { ParticipantPhoto } from '@/server/uploads/photo';

// ---------------------------------------------------------------------------
// The only way to see a payment screenshot.
//
// Behind the same ADMIN_EMAILS allowlist as the dashboard, because these are
// students' financial documents. The bytes never travel with the registration
// list — the dashboard renders <img src="/api/v1/admin/screenshots/<id>">, so
// an admin only downloads the one they are actually looking at.
//
// The id is an ObjectId, which is not guessable, but that is not the control:
// the session check is.
// ---------------------------------------------------------------------------

const allowedEmails = process.env.ADMIN_EMAILS
  ? process.env.ADMIN_EMAILS.split(',').map((email) => email.trim().toLowerCase())
  : [];

async function isAdmin() {
  const session = await getServerSession();
  const email = session?.user?.email?.toLowerCase();
  return Boolean(email && allowedEmails.includes(email));
}

export async function GET(req, { params }) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Not found' },
        { status: 404 }
      );
    }

    await connectDB();

    /* `data` is select:false on both schemas, so it has to be asked for.

       One route serves both collections. The id is a unique ObjectId, so
       looking in the second only when the first misses is unambiguous — and it
       means the admin UI needs one URL shape rather than two. */
    const shot =
      (await PaymentScreenshot.findById(id).select('+data').lean()) ||
      (await ParticipantPhoto.findById(id).select('+data').lean());
    if (!shot) {
      return NextResponse.json(
        { success: false, message: 'Not found' },
        { status: 404 }
      );
    }

    return new Response(shot.data.buffer ?? shot.data, {
      status: 200,
      headers: {
        'Content-Type': shot.contentType,
        'Content-Length': String(shot.bytes),
        /* private: a shared cache must never hold one of these. */
        'Cache-Control': 'private, max-age=300',
        'Content-Disposition': 'inline',
        /* Belt and braces: even if the sniffer were fooled, the browser is
           told not to reinterpret the type. */
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('[admin/screenshots/GET] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
