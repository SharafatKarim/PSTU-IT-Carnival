import { NextResponse } from 'next/server';
import connectDB from '@/server/db';
import Registration from '@/server/events/it-quiz/model';
import {
  validateRegistration,
  normalizeRegistration,
} from '@/server/events/it-quiz/validation';
import { generateRegistrationId } from '@/server/events/it-quiz/ids';
import { checkWriteLimits, clientKey } from '@/server/rateLimit';
import { verifyTurnstile } from '@/server/turnstile';
import { storeScreenshot, attachScreenshot, dropScreenshot } from '@/server/payments';
import { MAX_SCREENSHOT_BYTES } from '@/lib/upload';
import { getEventDetail } from '@/data/events';

// ---------------------------------------------------------------------------
// IT Quiz registration.
//
// The first endpoint on the site that accepts a file, so it takes the body two
// ways: multipart when a screenshot is attached, JSON when only a transaction
// ID is. The JSON path keeps the 16 KB cap every other route uses; the
// multipart path gets its own, larger one.
//
// The fields arrive under one `payload` part in both cases, so validation and
// normalisation receive exactly the same object either way and neither has to
// know how it was sent.
// ---------------------------------------------------------------------------

const MAX_JSON_BYTES = 16 * 1024;
/* The image cap plus room for the fields and multipart framing. */
const MAX_MULTIPART_BYTES = MAX_SCREENSHOT_BYTES + 256 * 1024;

const serverError = (context, error) => {
  console.error(`[it-quiz/registrations] ${context}:`, error);
  return NextResponse.json(
    { success: false, message: 'Something went wrong. Please try again.' },
    { status: 500 }
  );
};

const fail = (message, errors, status = 400) =>
  NextResponse.json({ success: false, message, ...(errors && { errors }) }, { status });

export async function POST(req) {
  /* Held outside the try so the catch can clean it up: a screenshot is stored
     before the registration row exists, and a failure after that point would
     otherwise leave the image behind with nothing pointing at it. */
  let screenshotId = null;

  try {
    const limit = checkWriteLimits(req, 'it-quiz:register');
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

    /* Entries are closed until the committee publishes the receiving number
       and the date. Checked against the data rather than a constant here, so
       opening it is a one-line data edit. */
    const event = getEventDetail('it-quiz');
    if (!event?.registrationOpen) {
      return fail('IT Quiz registration is not open yet.', null, 409);
    }

    const contentType = req.headers.get('content-type') || '';
    const isMultipart = contentType.includes('multipart/form-data');

    const declared = Number(req.headers.get('content-length') || 0);
    const cap = isMultipart ? MAX_MULTIPART_BYTES : MAX_JSON_BYTES;
    if (declared > cap) {
      return fail(
        isMultipart
          ? 'That screenshot is too large. The limit is 5 MB.'
          : 'Request body too large',
        null,
        413
      );
    }

    await connectDB();

    let body;
    let file = null;

    if (isMultipart) {
      let form;
      try {
        form = await req.formData();
      } catch {
        return fail('Could not read the submitted form.');
      }

      try {
        body = JSON.parse(form.get('payload') || '{}');
      } catch {
        return fail('Invalid form payload');
      }

      const entry = form.get('screenshot');
      /* A string here means the field was submitted empty, not that a file
         arrived — only treat it as a file when it can produce bytes. */
      file = entry && typeof entry.arrayBuffer === 'function' ? entry : null;
    } else {
      try {
        body = await req.json();
      } catch {
        return fail('Invalid JSON body');
      }
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return fail('Request body must be a JSON object');
    }

    const challenge = await verifyTurnstile(body.turnstileToken, clientKey(req));
    if (!challenge.ok) {
      return fail(challenge.message, null, 403);
    }

    /* Stored first so validation knows whether the "transaction ID or
       screenshot" requirement is satisfied — and so an unreadable image is
       reported as a field error rather than a generic failure. */
    if (file) {
      const stored = await storeScreenshot(file, { scope: 'it-quiz' });
      if (!stored.ok) {
        return fail('Validation failed', [
          { field: 'screenshot', message: stored.message },
        ]);
      }
      screenshotId = stored.id;
    }

    const errors = validateRegistration(body, { hasScreenshot: Boolean(screenshotId) });
    if (errors.length > 0) {
      await dropScreenshot(screenshotId);
      screenshotId = null;
      return fail('Validation failed', errors);
    }

    const doc = normalizeRegistration(body, { screenshotId });

    if (doc.payment.transactionId) {
      const existing = await Registration.findOne({
        'payment.transactionId': doc.payment.transactionId,
      }).lean();
      if (existing) {
        await dropScreenshot(screenshotId);
        screenshotId = null;
        return fail(
          'This transaction ID has already been used',
          [{ field: 'transactionId', message: 'Transaction ID must be unique' }],
          409
        );
      }
    }

    /* One entry per person, by academic ID at their own university. Without
       this the same student can submit repeatedly and eat the slots. */
    const duplicate = await Registration.findOne({
      academicId: doc.academicId,
      universityName: doc.universityName,
    }).lean();
    if (duplicate) {
      await dropScreenshot(screenshotId);
      screenshotId = null;
      return fail(
        'This academic ID is already registered for IT Quiz',
        [{ field: 'academicId', message: 'You have already registered' }],
        409
      );
    }

    const registrationId = await generateRegistrationId();
    const created = await Registration.create({ ...doc, registrationId, paid: false });

    /* Claim the image now that there is a row to attach it to — anything still
       unclaimed after an hour is an orphan and gets purged. */
    await attachScreenshot(screenshotId, created.registrationId);

    return NextResponse.json(
      {
        success: true,
        message:
          'Registration submitted. You will be confirmed once the payment is checked.',
        data: { registrationId: created.registrationId },
      },
      { status: 201 }
    );
  } catch (error) {
    await dropScreenshot(screenshotId).catch(() => {});

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
