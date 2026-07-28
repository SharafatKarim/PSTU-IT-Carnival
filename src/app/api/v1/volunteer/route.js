import { NextResponse } from 'next/server';
import connectDB from '@/server/db';
import VolunteerRegistration from '@/server/volunteer/model';
import { nextSequence, formatSequence } from '@/server/counters';

const fail = (message, errors = null, status = 400) =>
  NextResponse.json({ success: false, message, ...(errors && { errors }) }, { status });

export async function POST(req) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return fail('Invalid JSON body');
    }

    const { fullName, studentId, email, phone, events, tShirtSize } = body || {};

    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!cleanEmail || !cleanEmail.endsWith('@cse.pstu.ac.bd')) {
      return fail(
        'We only allow PSTU CSE students as volunteer.',
        [{ field: 'email', message: 'We only allow PSTU CSE students as volunteer.' }],
        400
      );
    }

    const errors = [];
    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      errors.push({ field: 'fullName', message: 'Full name is required' });
    }
    if (!studentId || typeof studentId !== 'string' || !studentId.trim()) {
      errors.push({ field: 'studentId', message: 'Student ID is required' });
    }
    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      errors.push({ field: 'phone', message: 'Phone number is required' });
    }
    if (!Array.isArray(events) || events.length === 0) {
      errors.push({ field: 'events', message: 'Select at least one event' });
    }

    if (errors.length > 0) {
      return fail('Validation failed', errors, 400);
    }

    await connectDB();

    const cleanStudentId = studentId.trim();
    const existing = await VolunteerRegistration.findOne({
      $or: [
        { studentId: new RegExp(`^${cleanStudentId}$`, 'i') },
        { email: cleanEmail },
      ],
    }).lean();

    if (existing) {
      return fail(
        'You have already registered as a volunteer.',
        [{ field: 'studentId', message: 'Already registered' }],
        409
      );
    }

    const seq = await nextSequence('volunteer');
    const registrationId = formatSequence('PSTU-VOL-2026', seq);

    const doc = await VolunteerRegistration.create({
      fullName: fullName.trim(),
      studentId: cleanStudentId,
      email: cleanEmail,
      phone: phone.trim(),
      events: events.map((e) => String(e).trim()),
      tShirtSize: tShirtSize ? String(tShirtSize).trim() : '',
      registrationId,
      status: 'pending',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Volunteer registration completed successfully!',
        data: {
          registrationId: doc.registrationId,
          fullName: doc.fullName,
          events: doc.events,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[api/v1/volunteer] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error while submitting volunteer registration.' },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await connectDB();
    const volunteers = await VolunteerRegistration.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, count: volunteers.length, data: volunteers });
  } catch (error) {
    console.error('[api/v1/volunteer GET] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch volunteers.' },
      { status: 500 }
    );
  }
}
