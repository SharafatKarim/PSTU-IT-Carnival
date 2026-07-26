// ---------------------------------------------------------------------------
// Cloudflare Turnstile verification.
//
// Rate limiting stops one client hammering the form; it does nothing about a
// flood spread across many addresses. Turnstile closes that, but it needs keys
// this project does not ship.
//
// So it is opt-in and fails OPEN when unconfigured: with no TURNSTILE_SECRET_KEY
// the form behaves exactly as it does today. Set the key and every submission
// must carry a solved token.
//
// Get keys at https://dash.cloudflare.com/?to=/:account/turnstile and put them
// in .env — both NEXT_PUBLIC_TURNSTILE_SITE_KEY (browser) and
// TURNSTILE_SECRET_KEY (server). Setting only one is a misconfiguration and is
// reported below rather than silently ignored.
// ---------------------------------------------------------------------------

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export const isTurnstileEnabled = () => Boolean(process.env.TURNSTILE_SECRET_KEY);

export async function verifyTurnstile(token, remoteIp) {
  if (!isTurnstileEnabled()) return { ok: true, skipped: true };

  if (!token || typeof token !== 'string') {
    return { ok: false, message: 'Please complete the verification challenge.' };
  }

  const body = new URLSearchParams({
    secret: process.env.TURNSTILE_SECRET_KEY,
    response: token,
  });
  if (remoteIp && remoteIp !== 'unknown') body.set('remoteip', remoteIp);

  let result;
  try {
    /* Cloudflare being slow must not hang a registration forever. */
    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(5000),
    });
    result = await res.json();
  } catch (error) {
    /* If the verifier is unreachable, fail CLOSED: the whole point is to keep
       automated submissions out, and rate limiting still applies underneath.
       An outage briefly blocking real users is the safer failure here. */
    console.error('[turnstile] verification request failed:', error);
    return {
      ok: false,
      message: 'Could not verify the challenge right now. Please try again.',
    };
  }

  if (!result?.success) {
    console.warn('[turnstile] rejected:', result?.['error-codes']);
    return { ok: false, message: 'Verification failed. Please try again.' };
  }

  return { ok: true };
}
