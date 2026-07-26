import { NextResponse } from 'next/server';
import connectDB from '@/server/db';

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({
      success: true,
      message: 'Database connection is active and healthy.',
    });
  } catch (error) {
    /* The driver's message quotes the host, port and — when MONGO_URI carries
       credentials — the user. This endpoint is public, so it says only that
       the check failed; the detail goes to the container log. */
    console.error('[health] database connection failed:', error);
    return NextResponse.json(
      { success: false, message: 'Database connection failed.' },
      { status: 500 }
    );
  }
}
