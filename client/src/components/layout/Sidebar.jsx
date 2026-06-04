import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Activity, FileText, Award, Settings, DollarSign, BookOpen, BrainCircuit, Calendar, Compass } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Weekly Planner', path: '/planner', icon: CheckSquare },
  { name: 'Weekly Plans', path: '/plans', icon: Compass },
  { name: 'Habits', path: '/habits', icon: Activity },
  { name: 'AI Insights', path: '/analytics', icon: BrainCircuit },
  { name: 'Finance', path: '/finance', icon: DollarSign },
  { name: 'Notes', path: '/notes', icon: BookOpen },
  { name: 'Achievements', path: '/achievements', icon: Award },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 h-full bg-[var(--surface-color)] border-r border-[var(--border-color)] flex flex-col transition-all duration-300">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent)] bg-clip-text text-transparent">
          PPOS
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-1">Personal Productivity OS</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-[var(--primary-color)] bg-opacity-10 text-[var(--primary-color)] font-medium'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-color)] hover:text-[var(--text-primary)]'
              }`
            }
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-[var(--border-color)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--primary-color)] to-[var(--accent)] flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-[var(--text-secondary)] truncate">{user?.email}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full py-2 text-sm text-[var(--error)] hover:bg-[var(--error)] hover:bg-opacity-10 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
