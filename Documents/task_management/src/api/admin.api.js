// src/api/admin.api.js
// Admin-only API calls

import api from './axios';

export const adminAPI = {

  // GET /api/admin/stats
  getStats: async () => {
    const res = await api.get('/admin/stats');
    return res.data;
  },

  // GET /api/admin/users
  getAllUsers: async () => {
    const res = await api.get('/admin/users');
    return res.data;
  },

  // PUT /api/admin/users/:id/role
  updateRole: async (id, role) => {
    const res = await api.put(`/admin/users/${id}/role`, { role });
    return res.data;
  },

  // PUT /api/admin/users/:id/status
  updateStatus: async (id, isActive) => {
    const res = await api.put(`/admin/users/${id}/status`, { isActive });
    return res.data;
  },

  // DELETE /api/admin/users/:id
  deleteUser: async (id) => {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
  },
};