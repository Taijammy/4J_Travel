// src/components/layout/Layout.jsx
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

const TITLES = {
  '/dashboard': 'Dashboard',
  '/tasks':     'Tasks',
};

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main — offset by sidebar width on md+ */}
      <div className="flex-1 flex flex-col md:ml-60">

        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white border-b border-border
                           h-16 px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Hamburger (mobile only) */}
            <button
              className="md:hidden w-9 h-9 rounded-lg border border-border
                         flex items-center justify-center text-lg text-ink"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>
            <h1 className="font-syne font-bold text-[17px] tracking-tight">
              {TITLES[pathname] || 'TaskFlow'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-ink flex items-center justify-center
                            text-white text-sm font-bold cursor-pointer">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;