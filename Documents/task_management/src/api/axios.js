// src/api/axios.js
// Central axios instance — all API calls go through here

import axios from 'axios';

const api = axios.create({
  baseURL:         'http://localhost:5000/api',
  withCredentials: true, // send cookies with every request
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor: attach JWT token to every request ──────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tf_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 globally ───────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage and redirect to login
      localStorage.removeItem('tf_token');
      localStorage.removeItem('tf_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;