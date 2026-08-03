import { NextResponse } from 'next/server';
import connectDB from '@/server/db';
import { universityCounts } from '@/server/events/iupc/teams';

// ---------------------------------------------------------------------------
// How many teams pre-registered, per university.
//
// PRIVACY: aggregate counts only — no team names, no members, nothing that
// identifies a person. The team directory already publishes which universities
// entered, so this adds a number and nothing else.
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    await connectDB();
    const universities = await universityCounts();
    return NextResponse.json({ success: true, data: { universities } });
  } catch (error) {
    console.error('[iupc/universities] GET:', error);
    return NextResponse.json(
      { success: false, message: 'Could not load registration counts.' },
      { status: 500 }
    );
  }
}
