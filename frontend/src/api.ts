import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL as string) || 'http://localhost:4000';

const api = axios.create({ baseURL: API_URL });

// automatically set token from localStorage if present
const saved = localStorage.getItem('token');
if (saved) api.defaults.headers.common.Authorization = `Bearer ${saved}`;

export function setToken(token: string | null) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

export default api;
