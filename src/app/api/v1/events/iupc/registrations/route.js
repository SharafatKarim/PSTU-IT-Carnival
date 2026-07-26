import { NextResponse } from 'next/server';
import connectDB from '@/server/db';
import Registration from '@/server/events/iupc/model';
import { validateRegistration } from '@/server/events/iupc/validation';
import { generateRegistrationId } from '@/server/events/iupc/ids';
import { listTeams } from '@/server/events/iupc/teams';
import { checkWriteLimits, clientKey } from '@/server/rateLimit';
import { verifyTurnstile } from '@/server/turnstile';

/* A registration is ~1 KB. Anything far larger is not a real submission, so
   reject it before parsing rather than buffering it into memory. */
const MAX_BODY_BYTES = 16 * 1024;

/* Never hand a raw driver error to the client — connection failures quote the
   host, port and sometimes the credentials from MONGO_URI. Log it, return a
   flat message. */
const serverError = (context, error) => {
  console.error(`[iupc/registrations] ${context}:`, error);
  return NextResponse.json(
    { success: false, message: 'Something went wrong. Please try again.' },
    { status: 500 }
  );
};

/* Public team directory. Returns an allow-listed projection only — see the
   PRIVACY note in src/server/events/iupc/teams.js before widening it. */
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    /* Capped so the endpoint cannot be used to pull the whole table at once. */
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20));

    /* Long search strings cost a collection scan and buy nothing. */
    const data = await listTeams({ search: search.slice(0, 100), page, limit });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return serverError('GET', error);
  }
}

export async function POST(req) {
  try {
    /* Throttle before touching the database, so a flood costs us nothing. */
    const limit = checkWriteLimits(req, 'iupc:register');
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

    /* A JSON array passes typeof 'object'; the destructure below would then
       silently yield undefined for every field. */
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: 'Request body must be a JSON object' },
        { status: 400 }
      );
    }

    /* No-op unless TURNSTILE_SECRET_KEY is configured. */
    const challenge = await verifyTurnstile(body.turnstileToken, clientKey(req));
    if (!challenge.ok) {
      return NextResponse.json(
        { success: false, message: challenge.message },
        { status: 403 }
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
    const memberStudentIds = members.map((m) => m.studentId.toLowerCase());

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

    const duplicateStudentIds = memberStudentIds.filter(
      (s, i) => memberStudentIds.indexOf(s) !== i
    );
    if (duplicateStudentIds.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Student IDs must be unique across members',
          errors: [{ field: 'members', message: `Duplicate student ID(s): ${[...new Set(duplicateStudentIds)].join(', ')}` }],
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

    const existingStudentId = await Registration.findOne({
      'members.studentId': { $in: memberStudentIds },
    });
    if (existingStudentId) {
      return NextResponse.json(
        {
          success: false,
          message: 'One or more student IDs are already registered',
          errors: [{ field: 'members', message: 'A student with this ID is already on another team' }],
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
    return serverError('POST', error);
  }
}
