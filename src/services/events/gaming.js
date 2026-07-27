// ---------------------------------------------------------------------------
// Gaming tournament registration client.
//
// Talks to the gaming API namespace — one route serves all three tournaments,
// keyed by the game slug in the path. See
// src/app/api/v1/events/gaming/[game]/registrations/route.js.
// ---------------------------------------------------------------------------

const baseURL = '/api/v1/events/gaming';

/* Public directory of who has entered. `signal` lets the caller abort a stale
   search when the user keeps typing. */
export const fetchGameRegistrations = async (
  slug,
  { search = '', page = 1, limit = 25 },
  signal
) => {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) query.set('search', search);

  let res;
  try {
    res = await fetch(`${baseURL}/${slug}/registrations?${query}`, { signal });
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    throw new Error('Network error — please check your connection and try again.');
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || 'Could not load registrations');
  return data.data;
};

export const submitGameRegistration = async (game, payload) => {
  let res;
  try {
    res = await fetch(`${baseURL}/${game.slug}/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('Network error — please check your connection and try again.');
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    /* Field-level errors are more useful than the summary line when four
       players share one form and only one game ID is the problem. */
    const detail = data?.errors?.[0]?.message;
    const err = new Error(detail || data?.message || 'Request failed');
    err.response = { data };
    throw err;
  }
  return { referenceId: data?.data?.registrationId };
};
