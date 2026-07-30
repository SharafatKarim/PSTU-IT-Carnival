import { NextResponse } from 'next/server';
import connectDB from '@/server/db';
import Registration from '@/server/events/project-showcase/model';
import { validateRegistration, normalizeRegistration } from '@/server/events/project-showcase/validation';
import { generateRegistrationId } from '@/server/events/project-showcase/ids';
import { checkWriteLimits, clientKey } from '@/server/rateLimit';
import { verifyTurnstile } from '@/server/turnstile';
import { listTeams } from '@/server/events/project-showcase/teams';

const MAX_BODY_BYTES = 16 * 1024;

const serverError = (context, error) => {
  console.error(`[project-showcase/registrations] ${context}:`, error);
  return NextResponse.json(
    { success: false, message: 'Something went wrong. Please try again.' },
    { status: 500 }
  );
};

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20));

    const data = await listTeams({ search: search.slice(0, 100), page, limit });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return serverError('GET', error);
  }
}

export async function POST(req) {
  try {
    const limit = checkWriteLimits(req, 'project-showcase:register');
    if (!limit.ok) {
      return NextResponse.json(
        {
          success: false,
          message:
            limit.layer === 'global'
              ? 'Registrations are busy right now. Please try again in a few minutes.'
              : 'Too many registration attempts. Please try again shortly.',
        },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
      );
    }

    const declared = Number(req.headers.get('content-length') || 0);
    if (declared > MAX_BODY_BYTES) {
      return NextResponse.json(
        { success: false, message: 'Request body too large' },
        { status: 413 }
      );
    }

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

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: 'Request body must be a JSON object' },
        { status: 400 }
      );
    }

    const challenge = await verifyTurnstile(body.turnstileToken, clientKey(req));
    if (!challenge.ok) {
      return NextResponse.json(
        { success: false, message: challenge.message },
        { status: 403 }
      );
    }

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

    const doc = normalizeRegistration(body);
    const emails = doc.members.map((m) => m.email);
    const universityIds = doc.members.map((m) => m.universityId.toLowerCase());

    // Duplicate check in request members
    const duplicateEmails = emails.filter((e, i) => emails.indexOf(e) !== i);
    if (duplicateEmails.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Member emails must be unique',
          errors: [{ field: 'members', message: `Duplicate email(s): ${[...new Set(duplicateEmails)].join(', ')}` }],
        },
        { status: 400 }
      );
    }

    const duplicateUnivIds = universityIds.filter((s, i) => universityIds.indexOf(s) !== i);
    if (duplicateUnivIds.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'University IDs must be unique across members',
          errors: [{ field: 'members', message: `Duplicate ID(s): ${[...new Set(duplicateUnivIds)].join(', ')}` }],
        },
        { status: 400 }
      );
    }

    // Database unique constraint checks
    const existingTeam = await Registration.findOne({ teamName: doc.teamName });
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

    const existingTx = await Registration.findOne({ transactionId: doc.transactionId });
    if (existingTx) {
      return NextResponse.json(
        {
          success: false,
          message: 'This Transaction ID is already used',
          errors: [{ field: 'transactionId', message: 'Transaction ID must be unique' }],
        },
        { status: 409 }
      );
    }

    const existingEmails = await Registration.findOne({
      'members.email': { $in: emails },
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

    const existingUnivId = await Registration.findOne({
      'members.universityId': { $in: universityIds },
    });
    if (existingUnivId) {
      return NextResponse.json(
        {
          success: false,
          message: 'One or more university IDs are already registered',
          errors: [{ field: 'members', message: 'A student with this ID is already on another team' }],
        },
        { status: 409 }
      );
    }

    const registrationId = await generateRegistrationId();
    const created = await Registration.create({
      ...doc,
      registrationId,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Registration submitted successfully. Waiting for admin approval.',
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
    return serverError('POST', error);
  }
}
