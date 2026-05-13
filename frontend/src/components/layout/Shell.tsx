import { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSession } from '../../context/SessionContext';

const ADMIN_NAV = [
  { to: '/dashboard', icon: '▦', label: 'Portfolio' },
  { to: '/alerts', icon: '⚡', label: 'Alerts' },
];

const STUDENT_NAV = [
  { to: '/my', icon: '◎', label: 'My Dashboard' },
];

export function Shell({ children }: { children: ReactNode }) {
  const { role, setRole } = useSession();
  const navigate = useNavigate();
  const nav = role === 'admin' ? ADMIN_NAV : STUDENT_NAV;

  const switchRole = () => {
    const next = role === 'admin' ? 'student' : 'admin';
    setRole(next);
    navigate(next === 'admin' ? '/dashboard' : '/my');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-slate-200 flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">RS</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900 leading-none">RepaySignal</div>
              <div className="text-xs text-slate-400 mt-0.5">
                {role === 'admin' ? 'Lender Portal' : 'Student Portal'}
              </div>
            </div>
          </div>
        </div>

        {/* Role toggle */}
        <div className="px-3 pt-3">
          <div className="flex bg-slate-100 rounded-lg p-0.5">
            {(['admin', 'student'] as const).map(r => (
              <button key={r} onClick={() => { setRole(r); navigate(r === 'admin' ? '/dashboard' : '/my'); }}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                  role === r ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}>
                {r === 'admin' ? 'Admin' : 'Student'}
              </button>
            ))}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pt-4 space-y-0.5">
          {nav.map(link => (
            <NavLink key={link.to} to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }>
              <span className="text-base leading-none">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-slate-200 rounded-full flex items-center justify-center text-xs font-medium text-slate-600">
              {role === 'admin' ? 'AD' : 'AM'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-700 truncate">{role === 'admin' ? 'Admin User' : 'Arjun Mehta'}</p>
              <p className="text-xs text-slate-400">{role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>
    </div>
  );
}