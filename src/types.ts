import React from 'react';

export type ChallengeType = 'quiz' | 'code_runner' | 'debug';

export interface TestCase {
  input: string;
  expected: string;
}

export interface TestResult {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export interface ExecutionResult {
  status: 'passed' | 'failed' | 'error';
  stdout?: string;
  stderr?: string;
  time?: string;
  message?: string;
  testResults?: TestResult[];
}

export type SupportedLanguage = 'javascript' | 'python' | 'java' | 'c' | 'cpp' | 'go';

export interface Challenge {
  id: string;
  stageId: string;
  title: string;
  type: ChallengeType;
  language?: SupportedLanguage;
  prompt: string;
  starterCode?: string;
  codeSnippet?: string;
  options?: string[];
  correctIndex?: number;
  expectedOutput?: string;
  explanation: string;
  xpReward: number;
  entryFunction?: string;
  testCases?: TestCase[];
}

export interface Stage {
  id: string;
  index: string;
  slug?: string;
  name: string;
  state: 'Completed' | 'In progress' | 'Locked';
  description: string;
  isPremium?: boolean;
  challenges: Challenge[];
}

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  completedChallenges: string[];
  completedStages: string[];
  isPremium?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  isPremium: boolean;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'spline-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { url?: string }, HTMLElement>;
    }
  }
}
