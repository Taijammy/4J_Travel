// src/pages/Tasks.jsx
import { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useToast } from '../hooks/useToast';
import TaskCard from '../components/tasks/TaskCard';
import TaskForm from '../components/tasks/TaskForm';
import Modal   from '../components/ui/Modal';
import Toast   from '../components/ui/Toast';
import Spinner from '../components/ui/Spinner';

const STATUSES   = ['All', 'Pending', 'In Progress', 'Completed'];
const PRIORITIES = ['All', 'Low', 'Medium', 'High'];

const Tasks = () => {
  const [filters,     setFilters]    = useState({ status: 'All', priority: 'All', search: '' });
  const [taskModal,   setTaskModal]  = useState(false);
  const [deleteModal, setDeleteModal]= useState(false);
  const [editTask,    setEditTask]   = useState(null);
  const [deleteTask,  setDeleteTask] = useState(null);
  const [saving,      setSaving]     = useState(false);
  const [deleting,    setDeleting]   = useState(false);

  const { tasks, loading, error, createTask, updateTask, deleteTask: apiDelete, toggleStatus } = useTasks(filters);
  const { toasts, toast, removeToast } = useToast();

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  const openCreate = () => { setEditTask(null); setTaskModal(true); };
  const openEdit   = (t) => { setEditTask(t);   setTaskModal(true); };
  const openDelete = (t) => { setDeleteTask(t); setDeleteModal(true); };

  const handleSave = async (data) => {
    setSaving(true);
    try {
      const res = editTask
        ? await updateTask(editTask._id, data)
        : await createTask(data);
      if (res.success) {
        toast(editTask ? 'Task updated!' : 'Task created!');
        setTaskModal(false);
      } else {
        toast(res.error || 'Failed to save.', 'error');
      }
    } catch {
      toast('Something went wrong.', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await apiDelete(deleteTask._id);
      if (res.success) {
        toast('Task deleted.', 'error');
        setDeleteModal(false);
      } else {
        toast(res.error || 'Failed to delete.', 'error');
      }
    } catch {
      toast('Something went wrong.', 'error');
    } finally { setDeleting(false); }
  };

  const handleToggle = async (task) => {
    await toggleStatus(task);
    toast('Status updated!');
    if (task.status !== 'Completed') {
      setFilters(prev => ({ ...prev, status: 'Completed' }));
    }
  };

  return (
    <>
      {/* Page header */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="font-syne font-extrabold text-2xl text-ink tracking-tight">All Tasks</h1>
          <p className="text-sm text-muted mt-1">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ink text-white
                     font-syne font-bold text-sm hover:opacity-85 transition-opacity"
        >
          <span className="text-lg leading-none">+</span> New Task
        </button>
      </div>

      {/* Filter bar */}
      {/* Filter bar */}
<div className="flex flex-col gap-3 mb-6">

  {/* Status pills — always visible, scrollable on mobile */}
  <div className="flex gap-2 overflow-x-auto pb-1"
       style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
    {STATUSES.map(s => (
      <button
        key={s}
        onClick={() => setFilter('status', s)}
        className={`px-4 py-1.5 rounded-full border text-sm font-medium
                    transition-all whitespace-nowrap flex-shrink-0
                    ${filters.status === s
                      ? 'bg-ink border-ink text-white'
                      : 'bg-white border-border text-ink hover:border-ink/40'}`}
      >
        {s}
      </button>
    ))}
  </div>

  {/* Second row — priority + search */}
  <div className="flex gap-2 items-center">

    {/* MOBILE: Priority pills (hidden on md and above) */}
    <div className="flex md:hidden gap-2 overflow-x-auto pb-1 flex-1"
         style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {PRIORITIES.map(p => (
        <button
          key={p}
          onClick={() => setFilter('priority', p)}
          className={`px-4 py-1.5 rounded-full border text-sm font-medium
                      transition-all whitespace-nowrap flex-shrink-0
                      ${filters.priority === p
                        ? 'bg-accent2 border-accent2 text-white'
                        : 'bg-white border-border text-ink hover:border-accent2/40'}`}
        >
          {p === 'All' ? 'All Priorities' : p}
        </button>
      ))}
    </div>

    {/* DESKTOP: Search + Select (hidden on mobile) */}
    <div className="hidden md:flex gap-2 flex-1">
      <input
        type="text"
        placeholder="Search tasks…"
        value={filters.search}
        onChange={e => setFilter('search', e.target.value)}
        className="input-field flex-1 py-2 text-sm"
      />
      <select
        value={filters.priority}
        onChange={e => setFilter('priority', e.target.value)}
        className="input-field w-auto py-2 text-sm flex-shrink-0"
      >
        <option value="All">All Priorities</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
    </div>

  </div>

  {/* MOBILE: Search bar (hidden on md and above) */}
  <input
    type="text"
    placeholder="Search tasks…"
    value={filters.search}
    onChange={e => setFilter('search', e.target.value)}
    className="md:hidden input-field py-2 text-sm w-full"
  />

</div>
      {/* Task grid */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Spinner size="lg" color="ink" />
        </div>
      ) : error ? (
        <div className="text-center py-16 text-accent">
          <div className="text-4xl mb-3">⚠</div>
          <p className="text-sm">{error}</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <div className="text-4xl mb-3 opacity-40">◻</div>
          <p className="text-sm">No tasks match your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tasks.map(t => (
            <TaskCard
              key={t._id}
              task={t}
              onEdit={openEdit}
              onDelete={openDelete}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      <Modal
        isOpen={taskModal}
        onClose={() => setTaskModal(false)}
        title={editTask ? 'Edit Task' : 'New Task'}
      >
        <TaskForm
          initial={editTask || {}}
          onSave={handleSave}
          onCancel={() => setTaskModal(false)}
          loading={saving}
        />
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title=""
        maxWidth="max-w-sm"
      >
        <div className="text-center">
          <div className="text-5xl mb-3">🗑️</div>
          <h3 className="font-syne font-extrabold text-xl text-ink mb-2">Delete Task?</h3>
          <p className="text-muted text-sm mb-6">
            "{deleteTask?.title}" will be permanently removed.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteModal(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 py-3 rounded-xl bg-accent text-white font-syne font-bold
                         text-sm hover:opacity-88 transition-opacity disabled:opacity-70"
            >
              {deleting ? <Spinner /> : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Toasts */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </>
  );
};

export default Tasks;