import React, { useState, useEffect } from 'react';
import { Search, Bell, User, Zap, Moon, Sun } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../ThemeContext';
import { useAuth } from '../../AuthContext';
import { AuthModal } from '../ui/AuthModal';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out border-b border-transparent ${
        scrolled
          ? 'bg-white/90 dark:bg-[#0d1117]/80 backdrop-blur-md py-3 border-black/5 dark:border-white/5 shadow-lg'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Link to="/" className="text-xl font-bold flex items-center gap-2 group">
            <span className="text-[var(--color-primary)] font-mono opacity-80 group-hover:opacity-100 transition-opacity">
              &lt;/&gt;
            </span>
            <span className="tracking-tight text-gray-900 dark:text-white">Devlingo</span>
          </Link>
        </div>

        {/* Center Nav */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-600 dark:text-gray-400">
          <Link to="/learn" className="hover:text-gray-900 dark:hover:text-white transition-colors">Learn</Link>
          <Link to="/practice" className="hover:text-gray-900 dark:hover:text-white transition-colors">Practice</Link>
          <Link to="/challenges" className="hover:text-gray-900 dark:hover:text-white transition-colors">Challenges</Link>
          <Link to="/roadmap" className="hover:text-gray-900 dark:hover:text-white transition-colors">Roadmap</Link>
          <Link to="/community" className="hover:text-gray-900 dark:hover:text-white transition-colors">Community</Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-5">
          <button 
            onClick={toggleTheme}
            className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <Search size={18} />
          </button>
          
          {user ? (
            <>
              <div className="hidden sm:flex items-center space-x-1 text-[var(--color-primary)] font-mono text-sm font-bold bg-[var(--color-primary)]/10 px-3 py-1.5 rounded-full border border-[var(--color-primary)]/20">
                <Zap size={14} fill="currentColor" />
                <span>4,820 XP</span>
              </div>

              <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors relative">
                <Bell size={18} />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--color-secondary)] rounded-full"></span>
              </button>
              
              <button 
                onClick={() => navigate('/dashboard')}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-secondary)] p-[2px]"
              >
                <div className="w-full h-full bg-gray-50 dark:bg-[#161b22] rounded-full flex items-center justify-center overflow-hidden">
                   <User size={16} className="text-gray-700 dark:text-gray-300" />
                </div>
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsAuthOpen(true)}
              className="px-5 py-2 bg-[var(--color-primary)] text-white dark:text-black font-bold rounded-lg hover:brightness-110 transition-colors text-sm"
            >
              Log In
            </button>
          )}
        </div>
      </div>
      
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </nav>
  );
};
