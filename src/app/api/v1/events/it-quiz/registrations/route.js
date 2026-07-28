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
import { getEventDetail } from '@/data/events';

const MAX_JSON_BYTES = 16 * 1024;

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

    const event = getEventDetail('it-quiz');
    if (!event?.registrationOpen) {
      return fail('IT Quiz registration is not open yet.', null, 409);
    }

    const declared = Number(req.headers.get('content-length') || 0);
    if (declared > MAX_JSON_BYTES) {
      return fail('Request body too large', null, 413);
    }

    await connectDB();

    let body;
    try {
      body = await req.json();
    } catch {
      return fail('Invalid JSON body');
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return fail('Request body must be a JSON object');
    }

    const challenge = await verifyTurnstile(body.turnstileToken, clientKey(req));
    if (!challenge.ok) {
      return fail(challenge.message, null, 403);
    }

    const errors = validateRegistration(body);
    if (errors.length > 0) {
      return fail('Validation failed', errors);
    }

    const doc = normalizeRegistration(body);

    const existing = await Registration.findOne({
      'payment.transactionId': doc.payment.transactionId,
    }).lean();
    if (existing) {
      return fail(
        'This transaction ID has already been used',
        [{ field: 'transactionId', message: 'Transaction ID must be unique' }],
        409
      );
    }

    /* One entry per person, by academic ID at their own university. */
    const duplicate = await Registration.findOne({
      academicId: doc.academicId,
      universityName: doc.universityName,
    }).lean();
    if (duplicate) {
      return fail(
        'This academic ID is already registered for IT Quiz',
        [{ field: 'academicId', message: 'You have already registered' }],
        409
      );
    }

    const registrationId = await generateRegistrationId();
    await Registration.create({ ...doc, registrationId, paid: false });

    return NextResponse.json(
      {
        success: true,
        message:
          'Registration submitted. You will be confirmed once the payment is checked.',
        data: { registrationId },
      },
      { status: 201 }
    );
  } catch (error) {
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
