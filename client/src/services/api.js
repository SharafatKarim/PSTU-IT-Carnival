const baseURL = import.meta.env.VITE_API_URL || '/api/v1';

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
    // Mirror the axios-style { response: { data } } shape the caller reads.
    const err = new Error(data?.message || 'Request failed');
    err.response = { data };
    throw err;
  }
  return data;
};
