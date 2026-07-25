import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Registration from '@/models/Registration';
import { validateRegistration } from '@/lib/validation';
import { generateRegistrationId } from '@/lib/registrationId';

export async function POST(req) {
  try {
    await connectDB();

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    // 1. Validation
    const validationErrors = validateRegistration(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validationErrors,
        },
        { status: 400 }
      );
    }

    const { teamName, varsityName, coach, members } = body;

    const memberEmails = members.map((m) => m.email.toLowerCase());
    const memberHandles = members.map((m) => m.codeforcesHandle.toLowerCase());

    // 2. Duplicate Checks in current request
    const duplicateEmails = memberEmails.filter(
      (e, i) => memberEmails.indexOf(e) !== i || e === coach.email.toLowerCase()
    );
    if (duplicateEmails.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Member emails must be unique and different from the coach email',
          errors: [{ field: 'members', message: `Duplicate email(s): ${[...new Set(duplicateEmails)].join(', ')}` }],
        },
        { status: 400 }
      );
    }

    const duplicateHandles = memberHandles.filter(
      (h, i) => memberHandles.indexOf(h) !== i
    );
    if (duplicateHandles.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Codeforces handles must be unique across members',
          errors: [{ field: 'members', message: `Duplicate handle(s): ${[...new Set(duplicateHandles)].join(', ')}` }],
        },
        { status: 400 }
      );
    }

    // 3. Database unique constraint checks
    const existingTeam = await Registration.findOne({ teamName });
    if (existingTeam) {
      return NextResponse.json(
        {
          success: false,
          message: 'A team with this name is already registered',
          errors: [{ field: 'teamName', message: 'Team name already exists' }],
        },
        { status: 409 }
      );
    }

    const existingEmails = await Registration.findOne({
      'members.email': { $in: memberEmails },
    });
    if (existingEmails) {
      return NextResponse.json(
        {
          success: false,
          message: 'One or more member emails are already registered',
          errors: [{ field: 'members', message: 'A member with this email is already registered' }],
        },
        { status: 409 }
      );
    }

    const existingHandle = await Registration.findOne({
      'members.codeforcesHandle': { $in: memberHandles },
    });
    if (existingHandle) {
      return NextResponse.json(
        {
          success: false,
          message: 'One or more Codeforces handles are already registered',
          errors: [{ field: 'members', message: 'A Codeforces handle is already registered' }],
        },
        { status: 409 }
      );
    }

    // 4. Generate ID & Create
    const registrationId = await generateRegistrationId();

    const created = await Registration.create({
      teamName,
      varsityName,
      coach,
      members,
      registrationId,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Registration completed successfully',
        data: { registrationId: created.registrationId },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error && error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0] || 'field';
      return NextResponse.json(
        {
          success: false,
          message: `Duplicate value for ${field}`,
          errors: [{ field, message: `${field} must be unique` }],
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
