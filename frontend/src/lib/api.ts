import axios from 'axios';
import Cookies from 'js-cookie';

// Resolve API base URL.
// Priority:
//   1. NEXT_PUBLIC_API_URL  (Vercel/build-time env var)
//   2. If running in a browser on a non-localhost host, fall back to the
//      live Render backend so the deployed Vercel site still works even
//      when NEXT_PUBLIC_API_URL was unset at build time.
//   3. localhost for local dev.
function resolveBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return 'https://josmef-hrms-backend.onrender.com/api/v1';
  }
  return 'http://localhost:4000/api/v1';
}

const api = axios.create({
  baseURL: resolveBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 — redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      Cookies.remove('token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api;
