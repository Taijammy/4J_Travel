// src/components/layout/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, isAdmin } = useAuth();

  const NAV = [
    { to: '/dashboard', label: 'Dashboard', icon: '⊞' },
    { to: '/tasks',     label: 'Tasks',     icon: '▤' },
    // Admin nav item only shown to admins
    ...(isAdmin ? [{ to: '/admin', label: 'Admin Panel', icon: '⚙', adminOnly: true }] : []),
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/45 z-40 md:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-screen w-60 bg-ink text-white
        flex flex-col z-50
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>

        {/* Logo */}
        <div className="px-6 py-7 border-b border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center
                          text-white text-sm font-black">✦</div>
          <span className="font-syne font-extrabold text-lg tracking-tight">TaskFlow</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-5">
          <p className="px-6 pb-3 text-[10px] font-bold tracking-widest uppercase text-white/25">
            Navigation
          </p>
          {NAV.map(({ to, label, icon, adminOnly }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-6 py-3 text-sm font-medium
                transition-colors duration-150 relative
                ${isActive
                  ? 'text-white bg-accent/20 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-accent before:rounded-r'
                  : 'text-white/55 hover:text-white hover:bg-white/5'
                }
              `}
            >
              <span className="text-base w-5 text-center">{icon}</span>
              <span>{label}</span>
              {/* Admin badge */}
              {adminOnly && (
                <span className="ml-auto text-[9px] font-bold uppercase tracking-wider
                                 px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-300">
                  Admin
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User info + role badge + logout */}
        <div className="border-t border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center
                            text-xs font-bold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold truncate">{user?.name}</p>
                {/* Role badge */}
                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded flex-shrink-0
                                 ${isAdmin
                                   ? 'bg-purple-500/30 text-purple-300'
                                   : 'bg-white/10 text-white/40'}`}>
                  {user?.role || 'user'}
                </span>
              </div>
              <p className="text-xs text-white/35 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full py-2 rounded-lg bg-white/7 border border-white/10
                       text-white/60 text-sm flex items-center justify-center gap-2
                       hover:bg-white/12 hover:text-white transition-colors"
          >
            ⏻ Sign out
          </button>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;