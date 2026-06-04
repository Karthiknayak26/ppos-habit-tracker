import { useState, useEffect } from 'react';
import { Search, Bell, Sun, Moon, Monitor, User, WifiOff, Menu } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const TopBar = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="h-16 border-b border-[var(--border-color)] bg-[var(--surface-color)] px-4 md:px-6 flex items-center justify-between sticky top-0 z-10 transition-colors duration-300">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <Menu size={24} />
        </button>

        <div className="hidden md:flex items-center bg-[var(--bg-color)] rounded-lg px-3 py-2 w-96 border border-[var(--border-color)]">
          <Search size={18} className="text-[var(--text-secondary)] mr-2" />
          <input 
            type="text" 
            placeholder="Search everywhere (Cmd+K)" 
            className="bg-transparent border-none outline-none text-sm w-full text-[var(--text-primary)]"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {!isOnline && (
          <div className="flex items-center gap-2 px-3 py-1 bg-[var(--error)]/10 text-[var(--error)] rounded-full text-xs font-bold animate-pulse border border-[var(--error)]/30">
            <WifiOff size={14} />
            <span>Offline - Sync Paused</span>
          </div>
        )}

        <div className="flex bg-[var(--bg-color)] rounded-lg p-1 border border-[var(--border-color)]">
          <button 
            onClick={() => toggleTheme('light')}
            className={`p-1.5 rounded-md ${theme === 'light' ? 'bg-[var(--surface-color)] shadow-sm text-[var(--primary-color)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
          >
            <Sun size={16} />
          </button>
          <button 
            onClick={() => toggleTheme('dark')}
            className={`p-1.5 rounded-md ${theme === 'dark' ? 'bg-[var(--surface-color)] shadow-sm text-[var(--primary-color)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
          >
            <Moon size={16} />
          </button>
          <button 
            onClick={() => toggleTheme('bw')}
            className={`p-1.5 rounded-md ${theme === 'bw' ? 'bg-[var(--surface-color)] shadow-sm text-[var(--primary-color)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
          >
            <Monitor size={16} />
          </button>
        </div>

        <button className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--primary-color)] rounded-full border-2 border-[var(--surface-color)]"></span>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-[var(--border-color)] cursor-pointer hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 rounded-full bg-[var(--primary-color)] flex items-center justify-center text-black font-bold">
            {user?.name ? user.name.charAt(0).toUpperCase() : <User size={18} />}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-bold leading-tight">{user?.name || 'Guest User'}</p>
            <p className="text-xs text-[var(--text-secondary)]">Free Plan</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
