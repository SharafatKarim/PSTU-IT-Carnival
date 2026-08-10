import { NextResponse } from 'next/server';
import connectDB from '@/server/db';
import Registration from '@/server/events/hackathon/model';
import { HACKATHON_PAYMENT, hackathonPaymentTotal, hackathonPaymentClosed, HACKATHON_ACCEPTED_TEAMS } from '@/data/events';
import { checkWriteLimits, clientKey } from '@/server/rateLimit';
import { verifyTurnstile } from '@/server/turnstile';

const MAX_BODY_BYTES = 4 * 1024;
const TRANSACTION_ID_RE = /^(?=.*[A-Za-z])[A-Za-z0-9]{6,25}$/;

const fail = (message, errors = null, status = 400) =>
  NextResponse.json({ success: false, message, ...(errors && { errors }) }, { status });

const serverError = (context, error) => {
  console.error(`[hackathon/payments] ${context}:`, error);
  return NextResponse.json(
    { success: false, message: 'Something went wrong. Please try again.' },
    { status: 500 }
  );
};

export async function POST(req) {
  try {
    const limit = checkWriteLimits(req, 'hackathon:payment');
    if (!limit.ok) {
      return NextResponse.json(
        {
          success: false,
          message:
            limit.layer === 'global'
              ? 'Payments are busy right now. Please try again in a few minutes.'
              : 'Too many attempts. Please try again shortly.',
        },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
      );
    }

    const declared = Number(req.headers.get('content-length') || 0);
    if (declared > MAX_BODY_BYTES) {
      return fail('Request body too large', null, 413);
    }

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
      return NextResponse.json(
        { success: false, message: challenge.message },
        { status: 403 }
      );
    }

    if (hackathonPaymentClosed()) {
      return fail(
        `The entry-fee deadline (${HACKATHON_PAYMENT.deadline}) has passed, so payments are no longer accepted here. If you have already sent the money, contact the coordinators — do not send it again.`,
        null,
        403
      );
    }

    const registrationId = String(body.registrationId || '').trim();
    const leaderEmail = String(body.leaderEmail || '').trim().toLowerCase();
    const method = String(body.method || '').trim();
    const transactionId = String(body.transactionId || '').trim().toUpperCase();

    const errors = [];
    if (!registrationId) {
      errors.push({ field: 'registrationId', message: 'Registration ID is required' });
    }
    if (!leaderEmail) {
      errors.push({ field: 'leaderEmail', message: 'Team leader email is required' });
    }
    const methods = HACKATHON_PAYMENT.numbers.map((n) => n.label);
    const validMethod = HACKATHON_PAYMENT.numbers.some((n) => method.toLowerCase().includes(n.label.toLowerCase().split(' ')[0]));
    if (!validMethod) {
      errors.push({
        field: 'method',
        message: 'Please select a valid payment method',
      });
    }
    if (!TRANSACTION_ID_RE.test(transactionId)) {
      errors.push({
        field: 'transactionId',
        message:
          'Transaction ID is 6–25 letters and digits, includes at least one letter, and has no spaces',
      });
    }
    if (errors.length > 0) return fail('Validation failed', errors, 400);

    // Verify if team ID is in the accepted list
    if (!HACKATHON_ACCEPTED_TEAMS.includes(registrationId)) {
      return fail(
        'This team is not in the list of accepted teams for final Hackathon registration.',
        [{ field: 'registrationId', message: 'Not an accepted team ID' }],
        403
      );
    }

    await connectDB();

    const team = await Registration.findOne({ registrationId });

    const leader =
      team && (team.members.find((m) => m.isTeamLeader) || team.members[0]);
    if (!team || !leader || leader.email !== leaderEmail) {
      return fail(
        'That registration ID and team leader email do not match.',
        [{ field: 'leaderEmail', message: 'Does not match this registration' }],
        403
      );
    }

    if (team.registrationStatus === 'paid' || team.finalRegistered) {
      return fail('This team is already marked as paid.', null, 409);
    }
    if (team.registrationStatus === 'rejected') {
      return fail(
        'This registration has been withdrawn. Contact the coordinators.',
        null,
        409
      );
    }
    if (team.payment?.transactionId) {
      return fail(
        `A transaction ID is already recorded for this team (${team.payment.transactionId}). Contact the coordinators if it needs changing.`,
        [{ field: 'transactionId', message: 'Already submitted for this team' }],
        409
      );
    }

    const clash = await Registration.findOne({
      'payment.transactionId': transactionId,
    });
    if (clash) {
      return fail(
        'This transaction ID has already been used by another team.',
        [{ field: 'transactionId', message: 'Already recorded against another registration' }],
        409
      );
    }

    // Resolve which receiving number matches the method
    const matchingNumber = HACKATHON_PAYMENT.numbers.find((n) =>
      method.toLowerCase().includes(n.label.toLowerCase().split(' ')[0])
    ) || HACKATHON_PAYMENT.numbers[0];

    team.payment = {
      method,
      transactionId,
      receiverNumber: matchingNumber.value,
      amount: hackathonPaymentTotal(),
      submittedAt: new Date(),
    };
    team.registrationStatus = 'payment-submitted';
    await team.save();

    return NextResponse.json(
      {
        success: true,
        message:
          'Payment submitted. A coordinator will verify it against the wallet statement and confirm your registration.',
        data: {
          registrationId: team.registrationId,
          teamName: team.teamName,
          status: team.registrationStatus,
          amount: team.payment.amount,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error && error.code === 11000) {
      return fail(
        'This transaction ID has already been used by another team.',
        [{ field: 'transactionId', message: 'Already recorded against another registration' }],
        409
      );
    }
    return serverError('POST', error);
  }
}
