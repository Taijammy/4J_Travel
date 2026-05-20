// src/api/auth.api.js
// All auth-related API calls

import api from './axios';

export const authAPI = {

  // POST /api/auth/register
  register: async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    return res.data;
  },

  // POST /api/auth/login
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },

  // POST /api/auth/logout
  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  },

  // GET /api/auth/me
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};