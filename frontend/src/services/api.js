import axios from 'axios';

// Dynamic API baseURL:
// - In production (e.g. Vercel), set VITE_API_BASE_URL to your Render backend (e.g. https://bizconnect-backend.onrender.com)
// - In local development, defaults to '/api' which Vite proxies to http://localhost:8080
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL;
const apiBaseUrl = rawBaseUrl
  ? (rawBaseUrl.replace(/\/+$/, '').endsWith('/api')
      ? rawBaseUrl.replace(/\/+$/, '')
      : `${rawBaseUrl.replace(/\/+$/, '')}/api`)
  : '/api';

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bizconnect_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and user on 401 unauthorized
      localStorage.removeItem('bizconnect_token');
      localStorage.removeItem('bizconnect_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
