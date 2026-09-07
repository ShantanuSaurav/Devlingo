import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGithub, loginWithEmail, signupWithEmail, loginAsDemoUser } = useGame();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signupWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGithub = async () => {
    setErrorMsg('');
    try {
      await loginWithGithub();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'GitHub OAuth failed');
    }
  };

  const handleDemo = () => {
    loginAsDemoUser();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-stage-badge">Authentication</div>
            <h3 className="modal-title">{isSignUp ? 'Join CodeQuest' : 'Welcome Back'}</h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body" style={{ gap: '1rem' }}>
          {errorMsg && (
            <div className="feedback-banner incorrect" style={{ padding: '0.6rem 1rem' }}>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* GitHub OAuth Button */}
          <button
            type="button"
            className="btn btn-line"
            style={{ width: '100%', justifyContent: 'center', gap: '0.6rem', padding: '0.9rem' }}
            onClick={handleGithub}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            Continue with GitHub
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--ink-faint)', fontSize: '0.82rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--line-soft)' }} />
            <span>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--line-soft)' }} />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontFamily: 'var(--font-label)', color: 'var(--ink-dim)', display: 'block', marginBottom: '4px' }}>
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@example.com"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  border: '1px solid var(--line)',
                  background: 'var(--bg-raise)',
                  color: 'var(--ink)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontFamily: 'var(--font-label)', color: 'var(--ink-dim)', display: 'block', marginBottom: '4px' }}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  border: '1px solid var(--line)',
                  background: 'var(--bg-raise)',
                  color: 'var(--ink)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-solid"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.4rem' }}
            >
              {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Demo Login Shortcut */}
          <button
            type="button"
            className="btn btn-line"
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem' }}
            onClick={handleDemo}
          >
            ⚡ Quick Demo Login (No credentials required)
          </button>

          <div style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--ink-dim)' }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'underline' }}
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
