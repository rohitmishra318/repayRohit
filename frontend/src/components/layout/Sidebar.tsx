import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ADMIN_LINKS = [
  { to: '/dashboard', label: 'Portfolio', icon: '▦' },
  { to: '/alerts', label: 'Alerts', icon: '⚡' },
];

const STUDENT_LINKS = [
  { to: '/my-dashboard', label: 'My Risk Card', icon: '◎' },
];

export function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const links = isAdmin ? ADMIN_LINKS : STUDENT_LINKS;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="w-56 bg-white border-r border-slate-200 flex flex-col min-h-screen shrink-0">
      {/* Brand Section */}
      <div className="p-5 border-b border-slate-100">
        <div className="text-base font-display font-bold text-slate-900">
          Repay<span className="text-purple-600">Signal</span>
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1 font-body">
          {isAdmin ? 'Lender portal' : 'Student portal'}
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 p-3 flex flex-col gap-1">
        {links.map(l => (
          <NavLink key={l.to} to={l.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-all ${
                isActive
                  ? 'bg-purple-50 text-purple-700 border border-purple-100 font-semibold'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`
            }
          >
            <span className="text-base">{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer Section */}
     
    </aside>
  );
}