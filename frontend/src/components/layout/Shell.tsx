import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useSession } from '../../context/SessionContext';
import { useTheme } from '../../context/ThemeContext';

const ADMIN_NAV = [
  { to: '/dashboard', icon: '▦', label: 'Portfolio' },
  { to: '/alerts', icon: '⚡', label: 'Alerts' },
  { to: '/sector-risk', icon: '📊', label: 'Sector Risk' },
  { to: '/stress-test', icon: '📉', label: 'Stress Test' },
];

const STUDENT_NAV = [
  { to: '/my', icon: '◎', label: 'My Dashboard' },
];

export function Shell({ children }: { children: ReactNode }) {
  const { role, student } = useSession();
  const { theme, toggleTheme } = useTheme();
  const nav = role === 'admin' ? ADMIN_NAV : STUDENT_NAV;

  const displayName = role === 'admin' ? 'Admin User' : (student?.name ?? 'Student');
  const initials = displayName
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col shrink-0">

        {/* Logo */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">RS</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-none">
                RepaySignal
              </div>
              <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                {role === 'admin' ? 'Lender Portal' : 'Student Portal'}
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pt-4 space-y-0.5">
          {nav.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive
                  ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-medium'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                }`
              }
            >
              <span className="text-base leading-none">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Theme toggle */}
        <div className="px-3 pb-2">
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <span className="text-base leading-none">
              {theme === 'dark' ? '☀️' : '🌙'}
            </span>
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-300">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{displayName}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{role}</p>
            </div>
          </div>
        </div>

      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>
    </div>
  );
}