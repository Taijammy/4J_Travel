// src/components/tasks/TaskForm.jsx
import { useState } from 'react';

const today = () => new Date().toISOString().split('T')[0];

const EMPTY = { title: '', description: '', priority: 'Medium', status: 'Pending', dueDate: today() };

const TaskForm = ({ initial = {}, onSave, onCancel, loading }) => {
  const [form, setForm] = useState({ ...EMPTY, ...initial,
    dueDate: initial.dueDate ? initial.dueDate.split('T')[0] : today()
  });
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setError('');
    await onSave(form);
  };

  const labelCls = "block text-xs font-semibold tracking-widest uppercase text-muted mb-2";
  const selectCls = "input-field appearance-none cursor-pointer";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      {/* Title */}
      <div>
        <label className={labelCls}>Title <span className="text-accent">*</span></label>
        <input
          className="input-field"
          type="text"
          value={form.title}
          onChange={e => set('title', e.target.value)}
          placeholder="Task title…"
        />
        {error && <p className="text-xs text-accent mt-1">{error}</p>}
      </div>

      {/* Description */}
      <div>
        <label className={labelCls}>Description</label>
        <textarea
          className="input-field resize-y min-h-[80px]"
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="Add details…"
        />
      </div>

      {/* Priority + Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Priority</label>
          <select className={selectCls} value={form.priority} onChange={e => set('priority', e.target.value)}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Status</label>
          <select className={selectCls} value={form.status} onChange={e => set('status', e.target.value)}>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
        </div>
      </div>

      {/* Due date */}
      <div>
        <label className={labelCls}>Due Date</label>
        <input
          className="input-field"
          type="date"
          value={form.dueDate}
          onChange={e => set('dueDate', e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-1">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="btn-primary flex-[2]">
          {loading ? 'Saving…' : initial._id ? 'Save Changes' : 'Create Task'}
        </button>
      </div>

    </form>
  );
};

export default TaskForm;