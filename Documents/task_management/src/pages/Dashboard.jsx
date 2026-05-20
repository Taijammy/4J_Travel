// src/pages/Dashboard.jsx
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { PriorityBadge } from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const isOverdue = (d, s) => d && new Date(d) < new Date() && s !== 'Completed';

const StatCard = ({ label, value, sub, iconBg, icon }) => (
  <div className="card p-6">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-4 ${iconBg}`}>
      {icon}
    </div>
    <div className="font-syne font-extrabold text-4xl text-ink leading-none mb-1">{value}</div>
    <div className="text-sm font-semibold text-ink mb-0.5">{label}</div>
    <div className="text-xs text-muted">{sub}</div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { tasks, stats, loading, toggleStatus } = useTasks();

  const upcoming = [...tasks]
    .filter(t => t.status !== 'Completed')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 4);

  const pct = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" color="ink" />
      </div>
    );
  }

  return (
    <div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Tasks"  value={stats.total}      sub="All tasks"    iconBg="bg-blue-50 text-accent2"  icon="▤" />
        <StatCard label="Completed"    value={stats.completed}  sub={`${pct}% done`} iconBg="bg-green-50 text-accent3" icon="✓" />
        <StatCard label="In Progress"  value={stats.inProgress} sub="Active now"   iconBg="bg-yellow-50 text-warn"   icon="◔" />
        <StatCard label="Pending"      value={stats.pending}    sub="To do"        iconBg="bg-red-50 text-accent"    icon="◻" />
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

        {/* Upcoming tasks */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-syne font-extrabold text-base text-ink">Upcoming Tasks</h2>
            <button
              onClick={() => navigate('/tasks')}
              className="text-sm font-semibold text-accent2 hover:opacity-75 transition-opacity"
            >
              View all →
            </button>
          </div>

          {upcoming.length === 0 ? (
            <div className="text-center py-16 text-muted">
              <div className="text-4xl mb-3 opacity-40">◻</div>
              <p className="text-sm">No upcoming tasks</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {upcoming.map(t => (
                <div key={t._id} className="card p-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleStatus(t)}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center
                                  flex-shrink-0 mt-0.5 transition-all text-white text-xs
                                  ${t.status === 'Completed'
                                    ? 'bg-accent3 border-accent3'
                                    : 'bg-white border-border hover:border-accent3'}`}
                    >
                      {t.status === 'Completed' && '✓'}
                    </button>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold mb-2
                                    ${t.status === 'Completed' ? 'line-through text-muted' : 'text-ink'}`}>
                        {t.title}
                      </p>
                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={t.priority} />
                        <span className={`text-xs ${isOverdue(t.dueDate, t.status) ? 'text-accent font-semibold' : 'text-muted'}`}>
                          {isOverdue(t.dueDate, t.status) ? '⚠ ' : ''}Due {fmt(t.dueDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick stats panel */}
        <div>
          <h2 className="font-syne font-extrabold text-base text-ink mb-4">Overview</h2>
          <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">

            {/* Progress bar */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted uppercase tracking-wide">Completion</span>
                <span className="text-sm font-bold text-ink">{pct}%</span>
              </div>
              <div className="h-2 bg-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent3 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {/* Breakdown */}
            {[
              { label: 'Completed',   value: stats.completed,  color: 'bg-accent3' },
              { label: 'In Progress', value: stats.inProgress, color: 'bg-warn' },
              { label: 'Pending',     value: stats.pending,    color: 'bg-accent2' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between py-3
                                          border-b border-border last:border-none">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${color}`} />
                  <span className="text-sm text-ink">{label}</span>
                </div>
                <span className="text-sm font-bold text-ink">{value}</span>
              </div>
            ))}

          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;