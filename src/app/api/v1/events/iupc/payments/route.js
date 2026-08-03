import { NextResponse } from 'next/server';
import connectDB from '@/server/db';
import Registration from '@/server/events/iupc/model';
import { IUPC_PAYMENT, iupcPaymentTotal } from '@/data/events';
import { checkWriteLimits, clientKey } from '@/server/rateLimit';
import { verifyTurnstile } from '@/server/turnstile';

// ---------------------------------------------------------------------------
// IUPC entry-fee submission.
//
// A team reports the transaction ID for a Send Money transfer it has already
// made. Nothing is confirmed here — the row moves to 'payment-submitted' and
// waits for a human to match the reference against the wallet statement, in the
// admin panel. Same posture as the gaming intake: a transaction ID is a claim.
//
// AUTHORISATION. The team directory this form is launched from is public, and
// it lists every registration ID. Without a check, anyone could submit against
// anyone's team — junk against a rival, or somebody else's real reference
// against their own entry, which the SMS sweep would then approve using that
// other team's money. So the leader's email must match the one stored at
// registration. It is the only thing about a team that is not on the public
// page: PUBLIC_FIELDS in server/events/iupc/teams.js deliberately withholds
// every email and phone number, so knowing it is evidence of belonging to the
// team. It is a shared secret, not a password — see the note in the route
// below on what that does and does not buy.
// ---------------------------------------------------------------------------

/* A payment submission is a few hundred bytes. */
const MAX_BODY_BYTES = 4 * 1024;

/* Long enough not to collide with an ordinary word in an SMS, and required to
   carry a letter, because the bulk approver searches message text for this
   value. An all-digit reference is a phone number or an amount — both stand
   alone in a wallet SMS, so accepting one would let a team be auto-approved by
   a message about somebody else's transfer. Real bKash and Nagad references
   are alphanumeric (8N70QAM3P4), so nothing legitimate is turned away. */
const TRANSACTION_ID_RE = /^(?=.*[A-Za-z])[A-Za-z0-9]{6,25}$/;

const fail = (message, errors = null, status = 400) =>
  NextResponse.json({ success: false, message, ...(errors && { errors }) }, { status });

const serverError = (context, error) => {
  console.error(`[iupc/payments] ${context}:`, error);
  return NextResponse.json(
    { success: false, message: 'Something went wrong. Please try again.' },
    { status: 500 }
  );
};

export async function POST(req) {
  try {
    const limit = checkWriteLimits(req, 'iupc:payment');
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

    /* No-op unless TURNSTILE_SECRET_KEY is configured. */
    const challenge = await verifyTurnstile(body.turnstileToken, clientKey(req));
    if (!challenge.ok) {
      return NextResponse.json(
        { success: false, message: challenge.message },
        { status: 403 }
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
    if (!IUPC_PAYMENT.methods.includes(method)) {
      errors.push({
        field: 'method',
        message: `Payment method must be one of: ${IUPC_PAYMENT.methods.join(', ')}`,
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

    await connectDB();

    const team = await Registration.findOne({ registrationId });

    /* One message for "no such team" and for "wrong email", deliberately. Told
       apart, this endpoint would confirm which registration IDs exist and then
       let someone test addresses against a known team. The directory already
       lists the IDs, so the pairing is the only thing worth protecting. */
    const leader =
      team && (team.members.find((m) => m.isTeamLeader) || team.members[0]);
    if (!team || !leader || leader.email !== leaderEmail) {
      return fail(
        'That registration ID and team leader email do not match.',
        [{ field: 'leaderEmail', message: 'Does not match this registration' }],
        403
      );
    }

    if (team.registrationStatus === 'paid') {
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

    /* One transfer pays for one team. The unique index closes the race between
       two simultaneous submissions; this turns it into a message someone can
       act on. */
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

    /* Amount and destination are computed here, never read from the request. */
    team.payment = {
      method,
      transactionId,
      receiverNumber: IUPC_PAYMENT.number,
      amount: iupcPaymentTotal(),
      submittedAt: new Date(),
    };
    team.registrationStatus = 'payment-submitted';
    await team.save();

    return NextResponse.json(
      {
        success: true,
        message:
          'Payment submitted. A coordinator will verify it against the wallet statement and email your team leader once confirmed.',
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
    /* The unique index fired between the check above and the save. */
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
