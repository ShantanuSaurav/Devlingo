import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginAsDemoUser: () => void;
  logout: () => Promise<void>;
  loginWithEmail: (e: string, p: string) => Promise<void>;
  signupWithEmail: (e: string, p: string) => Promise<void>;
  loginWithGithub: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

      return () => subscription.unsubscribe();
    } else {
      // Mock mode
      const savedUser = localStorage.getItem('mock-user');
      if (savedUser) setUser(JSON.parse(savedUser));
      setLoading(false);
    }
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    if (isSupabaseConfigured && supabase) {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
    } else {
      const mockUser = { id: 'mock', email } as User;
      localStorage.setItem('mock-user', JSON.stringify(mockUser));
      setUser(mockUser);
    }
  };

  const signupWithEmail = async (email: string, pass: string) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signUp({ email, password: pass });
      if (error) throw error;
    } else {
      const mockUser = { id: 'mock', email } as User;
      localStorage.setItem('mock-user', JSON.stringify(mockUser));
      setUser(mockUser);
    }
  };

  const loginWithGithub = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signInWithOAuth({ provider: 'github' });
    } else {
      const mockUser = { id: 'mock', email: 'github@user.com' } as User;
      localStorage.setItem('mock-user', JSON.stringify(mockUser));
      setUser(mockUser);
    }
  };

  const loginAsDemoUser = () => {
    const demoUser = { id: 'demo', email: 'dev@devlingo.io' } as User;
    localStorage.setItem('mock-user', JSON.stringify(demoUser));
    setUser(demoUser);
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('mock-user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginAsDemoUser, logout, loginWithEmail, signupWithEmail, loginWithGithub }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
