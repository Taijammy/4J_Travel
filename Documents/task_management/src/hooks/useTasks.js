// Custom hook — manages all task state and API calls

import { useState, useEffect, useCallback } from 'react';
import { tasksAPI } from '../api/tasks.api';

export const useTasks = (filters = {}) => {
  const [tasks,   setTasks]   = useState([]);
  const [stats,   setStats]   = useState({ total: 0, completed: 0, inProgress: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // ── Fetch tasks from API ──────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await tasksAPI.getAll(filters);
      if (res.success) {
        setTasks(res.data.tasks);
        setStats(res.stats);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.priority, filters.search, filters.sort]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // ── Create ────────────────────────────────────────────────────
  const createTask = async (data) => {
    const res = await tasksAPI.create(data);
    if (res.success) fetchTasks();
    return res;
  };

  // ── Update ────────────────────────────────────────────────────
  const updateTask = async (id, data) => {
    const res = await tasksAPI.update(id, data);
    if (res.success) fetchTasks();
    return res;
  };

  // ── Delete ────────────────────────────────────────────────────
  const deleteTask = async (id) => {
    const res = await tasksAPI.delete(id);
    if (res.success) fetchTasks();
    return res;
  };

  // ── Toggle status ─────────────────────────────────────────────
  const toggleStatus = async (task) => {
    const next = task.status === 'Completed' ? 'Pending' : 'Completed';
    return updateTask(task._id, { ...task, status: next });
  };

  return { tasks, stats, loading, error, createTask, updateTask, deleteTask, toggleStatus, refetch: fetchTasks };
};