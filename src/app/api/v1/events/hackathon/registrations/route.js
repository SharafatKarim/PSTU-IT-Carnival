import { NextResponse } from 'next/server';
import connectDB from '@/server/db';
import Registration from '@/server/events/hackathon/model';
import {
  validateRegistration,
  normalizeRegistration,
  memberCount,
} from '@/server/events/hackathon/validation';
import { generateRegistrationId } from '@/server/events/hackathon/ids';
import { checkWriteLimits, clientKey } from '@/server/rateLimit';
import { verifyTurnstile } from '@/server/turnstile';
import { storePhoto, attachPhotos, dropPhotos } from '@/server/uploads/photo';
import { MAX_SCREENSHOT_BYTES } from '@/lib/upload';
import { getEventDetail } from '@/data/events';
import { listTeams } from '@/server/events/hackathon/teams';

// ---------------------------------------------------------------------------
// Hackathon pre-registration.
//
// The first endpoint that takes MORE than one file: a photo per member, up to
// two. They arrive as `photo0` and `photo1` alongside the usual `payload`
// part, so the index of a photo is the index of the member it belongs to and
// nothing has to be matched up by name.
//
// Phase 1 is free, so there is no payment handling here at all. It is always
// multipart, because a photo is required for every member.
// ---------------------------------------------------------------------------

const MAX_MEMBERS = 2;
/* Two photos plus the fields and multipart framing. */
const MAX_BODY_BYTES = MAX_SCREENSHOT_BYTES * MAX_MEMBERS + 256 * 1024;

const serverError = (context, error) => {
  console.error(`[hackathon/registrations] ${context}:`, error);
  return NextResponse.json(
    { success: false, message: 'Something went wrong. Please try again.' },
    { status: 500 }
  );
};

const fail = (message, errors, status = 400) =>
  NextResponse.json({ success: false, message, ...(errors && { errors }) }, { status });

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
  /* Held outside the try so the catch can clean up: photos are stored before
     the registration row exists, and a failure after that point would leave
     them behind with nothing pointing at them. */
  let photoIds = [];

  /* Every rejection after the first upload has to drop what was stored, or a
     team retrying a duplicate name leaves two orphans per attempt. */
  const rejected = async (response) => {
    await dropPhotos(photoIds).catch(() => {});
    photoIds = [];
    return response;
  };

  try {
    const limit = checkWriteLimits(req, 'hackathon:register');
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

    const event = getEventDetail('hackathon');
    if (!event?.registrationOpen) {
      return fail('Hackathon pre-registration is not open.', null, 409);
    }

    const declared = Number(req.headers.get('content-length') || 0);
    if (declared > MAX_BODY_BYTES) {
      return fail('Those photos are too large. The limit is 5 MB each.', null, 413);
    }

    let form;
    try {
      form = await req.formData();
    } catch {
      return fail('Could not read the submitted form.');
    }

    let body;
    try {
      body = JSON.parse(form.get('payload') || '{}');
    } catch {
      return fail('Invalid form payload');
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return fail('Request body must be a JSON object');
    }

    const challenge = await verifyTurnstile(body.turnstileToken, clientKey(req));
    if (!challenge.ok) return fail(challenge.message, null, 403);

    await connectDB();

    /* Store first, so validation can report a missing or unreadable photo
       against the member it belongs to rather than as a generic failure. */
    const count = Math.min(memberCount(body), MAX_MEMBERS);
    const present = [];

    for (let i = 0; i < count; i += 1) {
      const entry = form.get(`photo${i}`);
      /* An empty file field arrives as a string, not a File. */
      if (!entry || typeof entry.arrayBuffer !== 'function') {
        present[i] = false;
        photoIds[i] = null;
        continue;
      }

      const stored = await storePhoto(entry, { scope: 'hackathon' });
      if (!stored.ok) {
        return rejected(
          fail('Validation failed', [
            { field: `members[${i}].photo`, message: stored.message },
          ])
        );
      }
      present[i] = true;
      photoIds[i] = stored.id;
    }

    const errors = validateRegistration(body, { photos: present });
    if (errors.length > 0) return rejected(fail('Validation failed', errors));

    const doc = normalizeRegistration(body, { photoIds });

    const existingTeam = await Registration.findOne({ teamName: doc.teamName }).lean();
    if (existingTeam) {
      return rejected(
        fail(
          `A team called "${doc.teamName}" is already registered`,
          [{ field: 'teamName', message: 'Team name must be unique — pick another' }],
          409
        )
      );
    }

    /* One person, one team. Checked across every registration, not just this
       one, so somebody cannot enter twice on two different teams. */
    const existingMember = await Registration.findOne({
      memberEmails: { $in: doc.memberEmails },
    }).lean();
    if (existingMember) {
      return rejected(
        fail(
          'One of these email addresses is already registered on another team',
          [{ field: 'members', message: 'Each person can only be on one team' }],
          409
        )
      );
    }

    const registrationId = await generateRegistrationId();
    const created = await Registration.create({ ...doc, registrationId });

    /* Claim the photos now there is a row pointing at them. Anything still
       unclaimed after an hour is an orphan — see purgeOrphanPhotos(). */
    await attachPhotos(photoIds, created.registrationId);

    return NextResponse.json(
      {
        success: true,
        message:
          'Pre-registration submitted. Watch your email for the problem statement.',
        data: { registrationId: created.registrationId },
      },
      { status: 201 }
    );
  } catch (error) {
    await dropPhotos(photoIds).catch(() => {});

    if (error && error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0] || 'field';
      return fail(
        `Duplicate value for ${field}`,
        [{ field, message: `${field} must be unique` }],
        409
      );
    }

    return serverError('POST', error);
  }
}
