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
    return NextResponse.json(
      {
        success: false,
        message: 'Database connection failed.',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
