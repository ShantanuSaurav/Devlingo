import React, { useState } from 'react';
import { useAuth } from '../../AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGithub, loginWithEmail, signupWithEmail, loginAsDemoUser } = useAuth();
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
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="text-[var(--color-primary)] font-mono text-xs font-bold uppercase tracking-wider mb-1">Authentication</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isSignUp ? 'Join Devlingo' : 'Welcome Back'}
              </h3>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          <div className="space-y-4">
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg">
                {errorMsg}
              </div>
            )}

            {/* GitHub Button */}
            <button
              onClick={handleGithub}
              className="w-full flex items-center justify-center space-x-2 bg-gray-900 dark:bg-white text-white dark:text-black font-medium py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>Continue with GitHub</span>
            </button>

            <div className="flex items-center space-x-4 py-2">
              <div className="flex-1 h-px bg-black/5 dark:bg-white/5" />
              <span className="text-sm text-gray-500 font-mono">OR</span>
              <div className="flex-1 h-px bg-black/5 dark:bg-white/5" />
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-[#161b22] border border-black/10 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                  placeholder="developer@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-[#161b22] border border-black/10 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[var(--color-primary)] text-white dark:text-black font-bold rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
              >
                {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <button
              type="button"
              onClick={handleDemo}
              className="w-full py-3 bg-black/5 dark:bg-white/5 text-gray-900 dark:text-white font-medium rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors border border-black/5 dark:border-white/5 mt-2 text-sm"
            >
              ⚡ Quick Demo Login (No credentials needed)
            </button>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-[var(--color-primary)] font-semibold hover:underline"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
