import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

export const createRegistration = async (payload) => {
  const { data } = await api.post('/registrations', payload);
  return data;
};

export const getHealth = async () => {
  const { data } = await api.get('/health');
  return data;
};

export default api;
