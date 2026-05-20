// src/components/tasks/TaskCard.jsx
import { PriorityBadge, StatusBadge } from '../ui/Badge';

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;
const isOverdue = (d, s) => d && new Date(d) < new Date() && s !== 'Completed';

const TaskCard = ({ task, onEdit, onDelete, onToggle }) => {
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div className="card p-5 flex flex-col gap-3 animate-fade-up">

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 flex-1">
          {/* Checkbox */}
          <button
            onClick={() => onToggle(task)}
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center
                        flex-shrink-0 mt-0.5 transition-all duration-150 text-white text-xs
                        ${task.status === 'Completed'
                          ? 'bg-accent3 border-accent3'
                          : 'bg-white border-border hover:border-accent3'
                        }`}
          >
            {task.status === 'Completed' && '✓'}
          </button>

          {/* Title */}
          <h3 className="text-sm font-semibold leading-snug text-ink">
            {task.title}
          </h3>
        </div>
        {/* Action buttons */}
        <div className="flex gap-1.5 flex-shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="w-7 h-7 rounded-lg border border-border bg-white text-muted text-sm
                       flex items-center justify-center hover:bg-surface hover:text-ink
                       transition-colors"
            title="Edit"
          >
            ✎
          </button>
          <button
            onClick={() => onDelete(task)}
            className="w-7 h-7 rounded-lg border border-border bg-white text-muted text-sm
                       flex items-center justify-center hover:bg-red-50 hover:text-accent
                       hover:border-accent transition-colors"
            title="Delete"
          >
            ⌫
          </button>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-muted leading-relaxed ml-8"></p>
      )}

      {/* Meta */}
      <div className="flex items-center gap-2 flex-wrap ml-8">
        <PriorityBadge priority={task.priority} />
        <StatusBadge   status={task.status} />
        {task.dueDate && (
          <span className={`text-xs font-medium ${overdue ? 'text-accent' : 'text-muted'}`}>
            {overdue ? '⚠ ' : ''}Due {fmt(task.dueDate)}
          </span>
        )}
      </div>

    </div>
  );
};

export default TaskCard;