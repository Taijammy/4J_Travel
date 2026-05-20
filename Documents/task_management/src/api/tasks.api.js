// src/api/tasks.api.js
// All task-related API calls

import api from './axios';

export const tasksAPI = {

  // GET /api/tasks?status=&priority=&search=&sort=
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status   && filters.status   !== 'All') params.append('status',   filters.status);
    if (filters.priority && filters.priority !== 'All') params.append('priority', filters.priority);
    if (filters.search)                                  params.append('search',   filters.search);
    if (filters.sort)                                    params.append('sort',     filters.sort);
    const res = await api.get(`/tasks?${params.toString()}`);
    return res.data;
  },

  // GET /api/tasks/:id
  getById: async (id) => {
    const res = await api.get(`/tasks/${id}`);
    return res.data;
  },

  // POST /api/tasks
  create: async (data) => {
    const res = await api.post('/tasks', data);
    return res.data;
  },

  // PUT /api/tasks/:id
  update: async (id, data) => {
    const res = await api.put(`/tasks/${id}`, data);
    return res.data;
  },

  // DELETE /api/tasks/:id
  delete: async (id) => {
    const res = await api.delete(`/tasks/${id}`);
    return res.data;
  },
};