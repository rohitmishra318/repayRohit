import { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSession } from '../../context/SessionContext';
import { useTheme } from '../../context/ThemeContext';

const ADMIN_NAV = [
  {
    to: '/dashboard',
    label: 'Portfolio',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <path d="M14 17.5h7M17.5 14v7" />
      </svg>
    ),
  },
  {
    to: '/alerts',
    label: 'Alerts',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    to: '/sector-risk',
    label: 'Sector Risk',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M18 20V10" />
        <path d="M12 20V4" />
        <path d="M6 20v-6" />
      </svg>
    ),
  },
  {
    to: '/stress-test',
    label: 'Stress Test',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
];

const STUDENT_NAV = [
  {
    to: '/my',
    label: 'My Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    to: '/my/profile',
    label: 'My Profile',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    to: '/my/insights',
    label: 'AI Insights',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5V11h2a2 2 0 0 1 2 2v1h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1v-1a2 2 0 0 1 2-2h2V9.5A4 4 0 0 1 8 6a4 4 0 0 1 4-4z" />
      </svg>
    ),
  },
];

export function Shell({ children }: { children: ReactNode }) {
  const { role, student, logout } = useSession();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const nav = role === 'admin' ? ADMIN_NAV : STUDENT_NAV;

  const displayName = role === 'admin' ? 'Admin' : (student?.name ?? 'Student');
  const userEmail = role === 'admin' ? 'admin@repaysignal.io' : (student?.email ?? '');
  const initials = displayName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);

  const handleLogout = async () => {
    if (logout) await logout();
    navigate('/');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .font-display { font-family: 'Syne', sans-serif; }
        .font-body    { font-family: 'DM Sans', sans-serif; }

        /* ── Active nav pill ── */
        .nav-active {
          background: linear-gradient(135deg, rgba(124,58,237,0.12), rgba(99,102,241,0.08));
          border-left: 3px solid #7c3aed;
          color: #7c3aed;
        }
        .dark .nav-active {
          background: linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,102,241,0.08));
          border-left: 3px solid #8b5cf6;
          color: #a78bfa;
        }
        .nav-inactive {
          border-left: 3px solid transparent;
          color: #64748b;
        }
        .dark .nav-inactive { color: rgba(255,255,255,0.35); }
        .nav-inactive:hover {
          background: rgba(99,102,241,0.05);
          border-left-color: rgba(124,58,237,0.3);
          color: #1e293b;
        }
        .dark .nav-inactive:hover {
          background: rgba(255,255,255,0.04);
          border-left-color: rgba(139,92,246,0.4);
          color: rgba(255,255,255,0.75);
        }

        /* ── Theme toggle pill ── */
        .theme-pill {
          position: relative;
          width: 40px; height: 22px;
          border-radius: 999px;
          background: #e2e8f0;
          border: 1px solid #cbd5e1;
          transition: background 0.3s, border-color 0.3s;
          cursor: pointer;
          flex-shrink: 0;
        }
        .dark .theme-pill {
          background: rgba(139,92,246,0.25);
          border-color: rgba(139,92,246,0.4);
        }
        .theme-pill-knob {
          position: absolute;
          top: 2px; left: 2px;
          width: 16px; height: 16px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 1px 4px rgba(0,0,0,0.15);
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .dark .theme-pill-knob { transform: translateX(18px); background: #a78bfa; }

        /* ── Sidebar glass (dark) ── */
        .dark .sidebar-glass {
          background: rgba(8,8,18,0.92);
          backdrop-filter: blur(20px);
          border-right: 1px solid rgba(255,255,255,0.06);
        }
        .sidebar-glass {
          background: rgba(255,255,255,0.97);
          border-right: 1px solid rgba(148,163,184,0.18);
          box-shadow: 1px 0 12px rgba(0,0,0,0.04);
        }

        /* ── Avatar ring ── */
        .avatar-ring {
          background: linear-gradient(135deg, #7c3aed, #0ea5e9);
          padding: 2px;
          border-radius: 50%;
        }

        /* ── Logout button ── */
        .logout-btn {
          color: #94a3b8;
          transition: color 0.15s, background 0.15s;
          border-radius: 8px;
          padding: 6px;
        }
        .logout-btn:hover { color: #ef4444; background: rgba(239,68,68,0.08); }
        .dark .logout-btn:hover { background: rgba(239,68,68,0.12); }

        /* nav icon accent in active state */
        .nav-active svg { opacity: 1; }
        .nav-inactive svg { opacity: 0.65; }
        .nav-inactive:hover svg { opacity: 1; }

        @keyframes sidebarIn {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .sidebar-in { animation: sidebarIn 0.4s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      <div className="flex h-screen bg-slate-50 dark:bg-[#080812] overflow-hidden font-body">

        {/* ══════════════ SIDEBAR ══════════════ */}
        <aside className="sidebar-glass sidebar-in w-56 flex flex-col shrink-0 relative z-20">

          {/* Top edge accent line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

          {/* ── Logo ── */}
          <div className="px-5 pt-6 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600
                              flex items-center justify-center shadow-lg shadow-violet-500/30 shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.2}
                  strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="font-display text-sm font-bold text-slate-900 dark:text-white leading-none tracking-tight">
                  Repay<span className="text-violet-500 dark:text-violet-400">Signal</span>
                </p>
                <p className="font-body text-[10px] text-slate-400 dark:text-white/25 mt-0.5 uppercase tracking-widest">
                  {role === 'admin' ? 'Lender Portal' : 'Student Portal'}
                </p>
              </div>
            </div>
          </div>

          {/* ── Section label ── */}
          <div className="px-5 mb-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-300 dark:text-white/15 font-body">
              Navigation
            </p>
          </div>

          {/* ── Nav links ── */}
          <nav className="flex-1 px-3 space-y-0.5">
            {nav.map((link, i) => (
              <NavLink
                key={link.to}
                to={link.to}
                style={{ animationDelay: `${i * 50}ms` }}
                className={({ isActive }) =>
                  `sidebar-in flex items-center gap-3 px-3 py-2.5 rounded-r-xl text-sm font-medium transition-all duration-150 font-body
                   ${isActive ? 'nav-active' : 'nav-inactive'}`
                }
              >
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* ── Divider ── */}
          <div className="mx-5 my-3 h-px bg-slate-100 dark:bg-white/5" />

          {/* ── Theme toggle ── */}
          <div className="px-5 pb-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-300 dark:text-white/15 font-body mb-2.5">
              Appearance
            </p>
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl
                         bg-slate-50 dark:bg-white/[0.03]
                         border border-slate-100 dark:border-white/5
                         hover:border-violet-200 dark:hover:border-violet-500/20
                         transition-all group"
            >
              <div className="flex items-center gap-2.5">
                {/* Sun/Moon icon */}
                <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5
                                flex items-center justify-center
                                group-hover:bg-violet-50 dark:group-hover:bg-violet-500/10
                                transition-colors">
                  {theme === 'dark' ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
                      strokeLinecap="round" strokeLinejoin="round"
                      className="w-3.5 h-3.5 text-amber-400">
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
                      strokeLinecap="round" strokeLinejoin="round"
                      className="w-3.5 h-3.5 text-indigo-400">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  )}
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-white/40 font-body">
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>
              </div>
              {/* Pill toggle */}
              <div className="theme-pill">
                <div className="theme-pill-knob" />
              </div>
            </button>
          </div>

          {/* ── Divider ── */}
          <div className="mx-5 h-px bg-slate-100 dark:bg-white/5" />

          {/* ── User footer ── */}
          <div className="px-4 py-4">
            <div className="flex items-center gap-2.5">
              {/* Avatar with gradient ring */}
              <div className="avatar-ring shrink-0">
                <div className="w-7 h-7 rounded-full bg-slate-800 dark:bg-[#12121f]
                                flex items-center justify-center">
                  <span className="font-display text-[10px] font-bold text-white">{initials}</span>
                </div>
              </div>

              {/* Name + email */}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 dark:text-white truncate font-display leading-tight">
                  {displayName}
                </p>
                {userEmail && (
                  <p className="text-[10px] text-slate-400 dark:text-white/25 truncate font-body mt-0.5">
                    {userEmail}
                  </p>
                )}
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                title="Sign out"
                className="logout-btn shrink-0"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
                  strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Bottom edge accent */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
        </aside>

        {/* ══════════════ MAIN ══════════════ */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {children}
        </main>
      </div>
    </>
  );
}