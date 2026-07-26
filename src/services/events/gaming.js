// ---------------------------------------------------------------------------
// Gaming tournament registration — FRONT-END ONLY.
//
// The gaming endpoint exists but does not persist yet (it validates, then
// answers 501 — see src/app/api/v1/events/gaming/[game]/registrations/route.js),
// so this still resolves locally. It stores nothing, and the reference number
// it returns is generated in the browser purely so the success screen has
// something to show.
//
// To go live: make that route write to a store, then flip DEMO_MODE to false —
// the fetch call below is already pointed at it. The success screen hides its
// "not yet saved" notice automatically.
// ---------------------------------------------------------------------------

export const DEMO_MODE = true;

const randomRef = (prefix) =>
  `${prefix}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

export const submitGameRegistration = async (game, payload) => {
  if (DEMO_MODE) {
    // Small delay so the button's loading state is visible.
    await new Promise((resolve) => setTimeout(resolve, 600));
    console.info('[gaming] registration payload', game.slug, payload);
    return { referenceId: randomRef(game.registration.idPrefix) };
  }

  let res;
  try {
    res = await fetch(`/api/v1/events/gaming/${game.slug}/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('Network error — please check your connection and try again.');
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.message || 'Request failed');
    err.response = { data };
    throw err;
  }
  return { referenceId: data?.data?.registrationId };
};
