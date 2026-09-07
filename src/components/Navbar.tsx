import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';

export const Navbar: React.FC = () => {
  const {
    theme,
    toggleTheme,
    stats,
    user,
    openAuthModal,
    openSubModal,
    openPractice,
    resetProgress,
    logout
  } = useGame();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <>
      <header className="nav">
        <a href="#top" className="nav-mark">CQ</a>

        <div className="nav-badges">
          <span className="streak-pill" title={`${stats.streak} day streak`}>
            🔥 {stats.streak}d
          </span>
          <span className="xp-pill" title={`${stats.xp} Total XP`}>
            ⚡ {stats.xp} XP
          </span>
          {stats.isPremium && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                padding: '0.2rem 0.55rem',
                borderRadius: '4px',
                background: 'rgba(0, 184, 115, 0.15)',
                color: 'var(--ok)',
                border: '1px solid var(--ok)',
                fontWeight: 600
              }}
            >
              PRO
            </span>
          )}
        </div>

        <nav className="nav-links">
          <a href="#journey">/paths</a>
          <button 
            type="button" 
            className="nav-link-btn" 
            onClick={() => openPractice()}
          >
            /practice
          </button>
          <a href="#compiler">/compiler</a>

          {!stats.isPremium && (
            <button
              type="button"
              className="nav-link-btn"
              style={{ color: 'var(--accent-2)', fontWeight: 600 }}
              onClick={openSubModal}
            >
              /pro ⚡
            </button>
          )}

          {/* User / Profile button */}
          <div className="profile-menu" ref={profileRef}>
            <button
              className="profile-btn"
              onClick={() => setIsProfileOpen(prev => !prev)}
              aria-label="Profile settings"
              aria-expanded={isProfileOpen}
            >
              {user ? (
                <span style={{ fontFamily: 'var(--font-label)', fontWeight: 700, fontSize: '0.9rem' }}>
                  {user.username.charAt(0).toUpperCase()}
                </span>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              )}
            </button>

            <div className={`profile-dropdown ${isProfileOpen ? 'open' : ''}`}>
              <div className="dropdown-header">
                {user ? `Signed in as @${user.username}` : 'Settings & Account'}
              </div>

              <div className="dropdown-item" style={{ marginBottom: '10px' }}>
                <span>Developer Lvl</span>
                <strong>Lv. {stats.level}</strong>
              </div>

              <div className="dropdown-item" style={{ marginBottom: '10px' }}>
                <span>Membership</span>
                <span style={{ color: stats.isPremium ? 'var(--ok)' : 'var(--ink-faint)', fontWeight: 600 }}>
                  {stats.isPremium ? 'Pro Active' : 'Free Tier'}
                </span>
              </div>

              <div className="dropdown-item" style={{ marginBottom: '12px' }}>
                <span>Dark Mode</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    id="themeToggle"
                    checked={theme === 'dark'}
                    onChange={toggleTheme}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              {user ? (
                <button
                  type="button"
                  className="btn btn-line"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem', padding: '0.5rem', marginBottom: '8px' }}
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                >
                  Sign Out
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-solid"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem', padding: '0.5rem', marginBottom: '8px' }}
                  onClick={() => {
                    setIsProfileOpen(false);
                    openAuthModal();
                  }}
                >
                  Sign In / Register
                </button>
              )}

              <button
                type="button"
                className="btn btn-line"
                style={{ width: '100%', justifyContent: 'center', fontSize: '0.78rem', padding: '0.4rem', color: 'var(--ink-faint)' }}
                onClick={() => {
                  if (confirm('Reset your progress and start fresh from Stage 1?')) {
                    setIsProfileOpen(false);
                    resetProgress();
                  }
                }}
              >
                Reset Progress ↺
              </button>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-solid nav-cta"
            onClick={() => openPractice()}
          >
            /start →
          </button>
        </nav>

        <button
          className={`nav-toggle ${isMobileOpen ? 'open' : ''}`}
          onClick={() => setIsMobileOpen(prev => !prev)}
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileOpen}
        >
          <span></span>
          <span></span>
        </button>
      </header>

      <div className={`nav-mobile ${isMobileOpen ? 'open' : ''}`}>
        <a href="#journey" onClick={() => setIsMobileOpen(false)}>/paths</a>
        <button
          type="button"
          onClick={() => {
            setIsMobileOpen(false);
            openPractice();
          }}
        >
          /practice
        </button>
        <a href="#compiler" onClick={() => setIsMobileOpen(false)}>/compiler</a>
        {!stats.isPremium && (
          <button
            type="button"
            style={{ color: 'var(--accent-2)' }}
            onClick={() => {
              setIsMobileOpen(false);
              openSubModal();
            }}
          >
            /pro (Upgrade)
          </button>
        )}
        <div style={{ padding: '0.8rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Dark Mode</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={theme === 'dark'}
              onChange={toggleTheme}
            />
            <span className="slider"></span>
          </label>
        </div>

        {user ? (
          <button
            type="button"
            className="btn btn-line"
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.4rem' }}
            onClick={() => {
              setIsMobileOpen(false);
              logout();
            }}
          >
            Sign Out (@{user.username})
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-solid"
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.4rem' }}
            onClick={() => {
              setIsMobileOpen(false);
              openAuthModal();
            }}
          >
            Sign In / Register
          </button>
        )}
      </div>
    </>
  );
};
