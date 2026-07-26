// IUPC pre-registration client. Talks to the event's own API namespace —
// see src/app/api/v1/events/iupc/registrations/route.js.
const baseURL = '/api/v1/events/iupc';

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
