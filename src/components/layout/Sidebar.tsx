import React from 'react';
import { Home, BookOpen, Swords, Map, Trophy, Settings, LogOut, User, Moon, Sun } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../../ThemeContext';
import { useAuth } from '../../AuthContext';

export const Sidebar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const navItems = [
    { icon: <Home size={20} />, label: 'Dashboard', path: '/dashboard', exact: true },
    { icon: <BookOpen size={20} />, label: 'Learn', path: '/dashboard/learn' },
    { icon: <Swords size={20} />, label: 'Challenges', path: '/dashboard/challenges' },
    { icon: <Map size={20} />, label: 'Roadmap', path: '/dashboard/roadmap' },
    { icon: <Trophy size={20} />, label: 'Achievements', path: '/dashboard/achievements' },
  ];

  return (
    <div className="w-64 h-screen fixed left-0 top-0 border-r border-black/5 dark:border-white/5 bg-white dark:bg-[#0d1117] flex flex-col z-40">
      <div className="p-6">
        <div className="text-2xl font-bold flex items-center gap-2 mb-8">
          <span className="text-[var(--color-primary)] font-mono">&lt;/&gt;</span>
          <span className="text-gray-900 dark:text-white">Devlingo</span>
        </div>

        <div className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium border border-[var(--color-primary)]/20' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>

      <div className="mt-auto p-6 border-t border-black/5 dark:border-white/5">
        
        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors mb-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white group"
        >
          <div className="flex items-center space-x-3">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span className="text-sm font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </div>
          <div className="w-8 h-4 bg-black/10 dark:bg-white/10 rounded-full relative">
            <div className={`w-3 h-3 rounded-full absolute top-0.5 transition-all ${theme === 'dark' ? 'bg-white right-0.5' : 'bg-gray-600 left-0.5'}`} />
          </div>
        </button>

        <div className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors mb-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
          <Settings size={18} />
          <span className="text-sm font-medium">Settings</span>
        </div>
        <button onClick={logout} className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors mb-4 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300">
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </button>

        <div className="flex items-center space-x-3 bg-gray-50 dark:bg-[#161b22] p-3 rounded-xl border border-black/5 dark:border-white/5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-secondary)] p-[2px]">
            <div className="w-full h-full bg-gray-50 dark:bg-[#161b22] rounded-full flex items-center justify-center overflow-hidden">
               <User size={20} className="text-gray-700 dark:text-gray-300" />
            </div>
          </div>
          <div className="overflow-hidden">
            <div className="text-gray-900 dark:text-white font-medium text-sm truncate">{user?.email || 'Developer'}</div>
            <div className="text-[var(--color-primary)] text-xs font-mono">Level 08</div>
          </div>
        </div>
      </div>
    </div>
  );
};
