// ---------------------------------------------------------------------------
// Gaming tournament registration — FRONT-END ONLY.
//
// There is no gaming API yet, so this resolves locally: it validates nothing
// server-side and stores nothing. The reference number it returns is generated
// in the browser purely so the success screen has something to show.
//
// To wire it to a real backend later, replace the body of
// submitGameRegistration with the fetch call below and flip DEMO_MODE to false.
// The success screen hides its "not yet saved" notice automatically.
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
    res = await fetch(`/api/v1/gaming/${game.slug}/registrations`, {
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
