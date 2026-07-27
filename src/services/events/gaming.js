// ---------------------------------------------------------------------------
// Gaming tournament registration client.
//
// Talks to the gaming API namespace — one route serves all three tournaments,
// keyed by the game slug in the path. See
// src/app/api/v1/events/gaming/[game]/registrations/route.js.
// ---------------------------------------------------------------------------

const baseURL = '/api/v1/events/gaming';

const toFormData = (payload, file) => {
  const form = new FormData();
  form.append('payload', JSON.stringify(payload));
  form.append('screenshot', file);
  return form;
};

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

/* `file` is the payment screenshot, when the tournament asks for one.

   It is sent as multipart with the SAME payload object in a `payload` part,
   rather than flattening the fields into form entries. That matters: the
   validator and the normaliser both read a nested object (players.0.name,
   payment.method), and flattening would force both to be rewritten and the
   Turnstile token to be plucked out of the body. This way the server parses
   one part and everything downstream is unchanged. */
export const submitGameRegistration = async (game, payload, file) => {
  let res;
  try {
    const url = `${baseURL}/${game.slug}/registrations`;

    res = file
      ? await fetch(url, { method: 'POST', body: toFormData(payload, file) })
      : await fetch(url, {
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
