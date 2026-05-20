// src/pages/AdminPanel.jsx
import { useState, useEffect } from 'react';
import { adminAPI } from '../api/admin.api';
import { useToast } from '../hooks/useToast';
import Toast   from '../components/ui/Toast';
import Spinner from '../components/ui/Spinner';

const AdminPanel = () => {
  const [users,    setUsers]    = useState([]);
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState(null);
  const { toasts, toast, removeToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        adminAPI.getAllUsers(),
        adminAPI.getStats(),
      ]);
      if (usersRes.success) setUsers(usersRes.data.users);
      if (statsRes.success) setStats(statsRes.data.stats);
    } catch {
      toast('Failed to load admin data.', 'error');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRoleChange = async (userId, newRole) => {
    setUpdating(userId);
    try {
      const res = await adminAPI.updateRole(userId, newRole);
      if (res.success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        toast(`User role updated to ${newRole}`);
      } else {
        toast(res.error || 'Failed to update role.', 'error');
      }
    } catch { toast('Something went wrong.', 'error'); }
    finally  { setUpdating(null); }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    setUpdating(userId);
    try {
      const res = await adminAPI.updateStatus(userId, !currentStatus);
      if (res.success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !currentStatus } : u));
        toast(`User ${!currentStatus ? 'activated' : 'deactivated'}`);
      } else {
        toast(res.error || 'Failed to update status.', 'error');
      }
    } catch { toast('Something went wrong.', 'error'); }
    finally  { setUpdating(null); }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Delete user "${userName}" and all their tasks?`)) return;
    setUpdating(userId);
    try {
      const res = await adminAPI.deleteUser(userId);
      if (res.success) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        toast('User deleted successfully.');
        fetchData();
      } else {
        toast(res.error || 'Failed to delete user.', 'error');
      }
    } catch { toast('Something went wrong.', 'error'); }
    finally  { setUpdating(null); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" color="ink" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="font-syne font-extrabold text-2xl text-ink tracking-tight">
          Admin Panel
        </h1>
        <p className="text-sm text-muted mt-1">Manage users and view platform stats</p>
      </div>

      {/* Platform stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users',  value: stats.users.total,      color: 'bg-blue-50 text-blue-600' },
            { label: 'Total Tasks',  value: stats.tasks.total,      color: 'bg-purple-50 text-purple-600' },
            { label: 'Completed',    value: stats.tasks.completed,  color: 'bg-green-50 text-green-600' },
            { label: 'Completion %', value: `${stats.completion}%`, color: 'bg-orange-50 text-orange-500' },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-border rounded-2xl p-5 shadow-sm">
              <div className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold mb-3 ${s.color}`}>
                {s.label}
              </div>
              <div className="font-syne font-extrabold text-3xl text-ink">{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Users table */}
      <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-syne font-bold text-base text-ink">
            All Users ({users.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface border-b border-border">
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wide">User</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Role</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Tasks</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Joined</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id || u._id}
                    className={`border-b border-border last:border-none
                               ${i % 2 === 0 ? 'bg-white' : 'bg-surface/50'}`}>

                  {/* User info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center
                                      text-white text-xs font-bold flex-shrink-0">
                        {u.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-ink">{u.name}</p>
                        <p className="text-xs text-muted">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold uppercase
                                     ${u.role === 'admin'
                                       ? 'bg-purple-50 text-purple-600'
                                       : 'bg-blue-50 text-blue-600'}`}>
                      {u.role}
                    </span>
                  </td>

                  {/* Task count */}
                  <td className="px-6 py-4">
                    <span className="font-semibold text-ink">{u.taskCount || 0}</span>
                  </td>

                  {/* Active status */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold uppercase
                                     ${u.isActive !== false
                                       ? 'bg-green-50 text-green-600'
                                       : 'bg-red-50 text-red-500'}`}>
                      {u.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  {/* Joined */}
                  <td className="px-6 py-4 text-muted text-xs">
                    {new Date(u.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    {updating === (u.id || u._id) ? (
                      <Spinner size="sm" color="ink" />
                    ) : (
                      <div className="flex items-center gap-2">

                        {/* Toggle role */}
                        <button
                          onClick={() => handleRoleChange(
                            u.id || u._id,
                            u.role === 'admin' ? 'user' : 'admin'
                          )}
                          className="px-3 py-1.5 rounded-lg border border-border text-xs
                                     font-medium text-ink hover:bg-surface transition-colors"
                          title="Toggle role"
                        >
                          {u.role === 'admin' ? '→ User' : '→ Admin'}
                        </button>

                        {/* Toggle active */}
                        <button
                          onClick={() => handleStatusToggle(u.id || u._id, u.isActive !== false)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium
                                     transition-colors
                                     ${u.isActive !== false
                                       ? 'border-red-200 text-red-500 hover:bg-red-50'
                                       : 'border-green-200 text-green-600 hover:bg-green-50'}`}
                        >
                          {u.isActive !== false ? 'Deactivate' : 'Activate'}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteUser(u.id || u._id, u.name)}
                          className="px-3 py-1.5 rounded-lg border border-red-200
                                     text-red-500 text-xs font-medium
                                     hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>

                      </div>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="text-center py-16 text-muted">
              <div className="text-4xl mb-3 opacity-40">◻</div>
              <p className="text-sm">No users found</p>
            </div>
          )}
        </div>
      </div>

      <Toast toasts={toasts} removeToast={removeToast} />
    </>
  );
};

export default AdminPanel;