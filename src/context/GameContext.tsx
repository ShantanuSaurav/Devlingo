import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Stage, UserStats, Challenge, UserProfile, ExecutionResult, SupportedLanguage } from '../types';
import { contentService } from '../services/contentService';
import { compilerService } from '../services/compilerService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface GameContextType {
  stages: Stage[];
  stats: UserStats;
  user: UserProfile | null;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  activeChallengeStage: Stage | null;
  activeChallengeIndex: number;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isSubModalOpen: boolean;
  openSubModal: () => void;
  closeSubModal: () => void;
  openPractice: (stageId?: string) => void;
  closePractice: () => void;
  completeChallenge: (challenge: Challenge) => void;
  executeCode: (code: string, language?: SupportedLanguage, entryFunction?: string, testCases?: any[]) => Promise<ExecutionResult>;
  loginWithGithub: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string) => Promise<void>;
  loginAsDemoUser: () => void;
  logout: () => Promise<void>;
  upgradeToPro: () => Promise<void>;
  resetProgress: () => void;
  celebrate: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const STORAGE_STATS_KEY = 'cq-user-stats';
const STORAGE_THEME_KEY = 'cq-theme';
const STORAGE_USER_KEY = 'cq-user-profile';

const INITIAL_STATS: UserStats = {
  xp: 0,
  level: 1,
  streak: 1,
  completedChallenges: [],
  completedStages: [],
  isPremium: false
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(STORAGE_THEME_KEY);
    return saved === 'dark' ? 'dark' : 'light';
  });

  // User state
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  // User stats state
  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_STATS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_STATS;
  });

  // Dynamic stages state
  const [stages, setStages] = useState<Stage[]>([]);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [activeChallengeStage, setActiveChallengeStage] = useState<Stage | null>(null);
  const [activeChallengeIndex, setActiveChallengeIndex] = useState<number>(0);

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem(STORAGE_THEME_KEY, theme);
  }, [theme]);

  // Persist stats and user profile
  useEffect(() => {
    localStorage.setItem(STORAGE_STATS_KEY, JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_USER_KEY);
    }
  }, [user]);

  // Load stages dynamically and calculate unlock sequence
  useEffect(() => {
    let isMounted = true;
    contentService.getStages().then((loadedStages) => {
      if (isMounted) {
        let firstUncompletedFound = false;
        const mapped = loadedStages.map((stage) => {
          const isCompleted = stats.completedStages.includes(stage.id);
          if (isCompleted) {
            return { ...stage, state: 'Completed' as const };
          }
          if (!firstUncompletedFound) {
            firstUncompletedFound = true;
            return { ...stage, state: 'In progress' as const };
          }
          return { ...stage, state: 'Locked' as const };
        });
        setStages(mapped);
      }
    });
    return () => { isMounted = false; };
  }, [stats.completedStages, stats.isPremium]);

  // Listen to Supabase Auth State Changes if configured
  useEffect(() => {
    const client = supabase;
    if (!isSupabaseConfigured || !client) return;

    const { data: { subscription } } = client.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Fetch or sync profile
        const { data: profile } = await client
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setUser({
          id: session.user.id,
          email: session.user.email || '',
          username: profile?.username || session.user.email?.split('@')[0] || 'Developer',
          avatarUrl: profile?.avatar_url,
          isPremium: profile?.is_premium || false
        });

        if (profile) {
          setStats(prev => ({
            ...prev,
            xp: Math.max(prev.xp, profile.xp || 0),
            level: Math.max(prev.level, profile.level || 1),
            streak: Math.max(prev.streak, profile.streak || 1),
            isPremium: profile.is_premium || false
          }));
        }
      } else {
        // Not logged in with Supabase
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  const celebrate = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4839FF', '#FFB020', '#00B873', '#FF5A4E']
    });
  };

  const openPractice = (stageId?: string) => {
    let targetStage: Stage | undefined;
    if (stageId) {
      targetStage = stages.find(s => s.id === stageId);
    }
    if (!targetStage) {
      targetStage = stages.find(s => s.state === 'In progress') || stages[0];
    }

    // Check if stage is premium locked
    if (targetStage && targetStage.isPremium && !stats.isPremium) {
      setIsSubModalOpen(true);
      return;
    }

    if (targetStage) {
      // Create new shallow copy so PracticeModal useEffect always re-triggers
      setActiveChallengeStage({ ...targetStage });
    }
    setActiveChallengeIndex(0);
  };

  const resetProgress = () => {
    localStorage.removeItem(STORAGE_STATS_KEY);
    setStats(INITIAL_STATS);
    closePractice();
    celebrate();
  };

  const closePractice = () => {
    setActiveChallengeStage(null);
    setActiveChallengeIndex(0);
  };

  const completeChallenge = (challenge: Challenge) => {
    celebrate();
    setStats(prev => {
      const alreadyCompleted = prev.completedChallenges.includes(challenge.id);
      const newCompleted = alreadyCompleted
        ? prev.completedChallenges
        : [...prev.completedChallenges, challenge.id];

      const newXP = prev.xp + challenge.xpReward;
      const newLevel = Math.floor(newXP / 100);

      let newCompletedStages = [...prev.completedStages];
      if (activeChallengeStage) {
        const stageChallenges = activeChallengeStage.challenges;
        const allDone = stageChallenges.every(c => c.id === challenge.id || newCompleted.includes(c.id));
        if (allDone && !newCompletedStages.includes(activeChallengeStage.id)) {
          newCompletedStages.push(activeChallengeStage.id);
          setStages(prevStages => {
            const currentIdx = prevStages.findIndex(s => s.id === activeChallengeStage.id);
            return prevStages.map((st, i) => {
              if (st.id === activeChallengeStage.id) return { ...st, state: 'Completed' };
              if (i === currentIdx + 1 && (st.state === 'Locked' || !st.state)) {
                if (st.isPremium && !prev.isPremium) return st;
                return { ...st, state: 'In progress' };
              }
              return st;
            });
          });
        }
      }

      if (user?.id) {
        contentService.recordUserProgress(user.id, challenge.id, 100);
      }

      return {
        ...prev,
        xp: newXP,
        level: newLevel,
        streak: prev.streak + (alreadyCompleted ? 0 : 1),
        completedChallenges: newCompleted,
        completedStages: newCompletedStages
      };
    });
  };

  const executeCode = async (
    code: string,
    language: SupportedLanguage = 'javascript',
    entryFunction?: string,
    testCases: any[] = []
  ): Promise<ExecutionResult> => {
    return compilerService.executeCode(code, language, entryFunction, testCases);
  };

  const loginWithGithub = async () => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
    } else {
      loginAsDemoUser();
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
    } else {
      setUser({
        id: 'mock-user-123',
        email,
        username: email.split('@')[0],
        isPremium: false
      });
    }
  };

  const signupWithEmail = async (email: string, pass: string) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signUp({ email, password: pass });
      if (error) throw error;
    } else {
      setUser({
        id: 'mock-user-123',
        email,
        username: email.split('@')[0],
        isPremium: false
      });
    }
  };

  const loginAsDemoUser = () => {
    setUser({
      id: 'demo-dev-id',
      email: 'dev@codequest.io',
      username: 'AdaLovelace',
      isPremium: true
    });
    setStats(prev => ({ ...prev, isPremium: true }));
    celebrate();
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  const upgradeToPro = async () => {
    // If Stripe Edge Function is set up, call it
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.functions.invoke('stripe-checkout', {
          body: { userId: user?.id, userEmail: user?.email }
        });
        if (!error && data?.url) {
          window.location.href = data.url;
          return;
        }
      } catch (e) {
        console.warn('Edge function not deployed yet, activating Pro locally:', e);
      }
    }

    // Local Pro activation
    setStats(prev => ({ ...prev, isPremium: true }));
    if (user) {
      setUser(prev => prev ? { ...prev, isPremium: true } : null);
    }
    celebrate();
  };

  return (
    <GameContext.Provider
      value={{
        stages,
        stats,
        user,
        theme,
        toggleTheme,
        activeChallengeStage,
        activeChallengeIndex,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        isSubModalOpen,
        openSubModal: () => setIsSubModalOpen(true),
        closeSubModal: () => setIsSubModalOpen(false),
        openPractice,
        closePractice,
        completeChallenge,
        executeCode,
        loginWithGithub,
        loginWithEmail,
        signupWithEmail,
        loginAsDemoUser,
        logout,
        upgradeToPro,
        resetProgress,
        celebrate
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
