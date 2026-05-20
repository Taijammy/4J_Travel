// src/components/ui/Badge.jsx
const PRIORITY = {
  Low:    'bg-green-50  text-green-600',
  Medium: 'bg-yellow-50 text-yellow-600',
  High:   'bg-red-50    text-red-500',
};
const STATUS = {
  'Pending':     'bg-blue-50   text-blue-600',
  'In Progress': 'bg-yellow-50 text-yellow-600',
  'Completed':   'bg-green-50  text-green-600',
};

export const PriorityBadge = ({ priority }) => (
  <span className={`badge ${PRIORITY[priority] || PRIORITY.Low}`}>{priority}</span>
);

export const StatusBadge = ({ status }) => (
  <span className={`badge ${STATUS[status] || STATUS.Pending}`}>{status}</span>
);