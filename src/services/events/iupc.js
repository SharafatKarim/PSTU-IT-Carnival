// IUPC pre-registration client. Talks to the event's own API namespace —
// see src/app/api/v1/events/iupc/registrations/route.js.
const baseURL = '/api/v1/events/iupc';

/* Public team directory. `signal` lets the caller abort a stale search when
   the user keeps typing. */
export const fetchTeams = async (slug, { search = '', page = 1, limit = 20 }, signal) => {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) query.set('search', search);

  let res;
  try {
    res = await fetch(`/api/v1/events/${slug}/registrations?${query}`, { signal });
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    throw new Error('Network error — please check your connection and try again.');
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || 'Could not load teams');
  return data.data;
};

export const createRegistration = async (payload) => {
  let res;
  try {
    res = await fetch(`${baseURL}/registrations`, {
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
  return data;
};
