import React, { createContext, useContext } from 'react';

// Mock AuthContext for Storybook
interface MockAuthContextType {
  user: any;
  session: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  getAccessToken: () => string | null;
}

const MockAuthContext = createContext<MockAuthContextType>({
  user: {
    id: 'storybook-user',
    email: 'storybook@example.com'
  },
  session: {
    access_token: 'mock-token',
    user: {
      id: 'storybook-user',
      email: 'storybook@example.com'
    }
  },
  loading: false,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signInWithGoogle: async () => ({ error: null }),
  signOut: async () => {},
  getAccessToken: () => 'mock-token',
});

// Mock AuthProvider that doesn't use router
export const StorybookAuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <MockAuthContext.Provider value={MockAuthContext._currentValue}>
      {children}
    </MockAuthContext.Provider>
  );
};

// Mock UrqlProvider that doesn't need auth
export const StorybookUrqlProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// Combined provider for Storybook
export const StorybookProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <StorybookAuthProvider>
      <StorybookUrqlProvider>
        {children}
      </StorybookUrqlProvider>
    </StorybookAuthProvider>
  );
};

// Mock AuthProvider and useAuth hook
export const AuthProvider = StorybookAuthProvider;
export const useAuth = () => ({
  user: {
    id: 'storybook-user',
    email: 'storybook@example.com'
  },
  session: {
    access_token: 'mock-token',
    user: {
      id: 'storybook-user',
      email: 'storybook@example.com'
    }
  },
  loading: false,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signInWithGoogle: async () => ({ error: null }),
  signOut: async () => {},
  getAccessToken: () => 'mock-token',
});

// Mock UrqlProvider 
export const UrqlProvider = StorybookUrqlProvider;

// Mock useCoachProfile hook
export const useCoachProfile = () => ({
  coach: {
    id: 'storybook-coach',
    email: 'storybook@example.com',
    firstName: 'Storybook',
    lastName: 'User',
    displayName: 'Storybook User',
    timezone: 'America/New_York',
    role: 'PROFESSIONAL' as const,
    onboardingCompleted: true,
  },
  user: {
    id: 'storybook-user',
    email: 'storybook@example.com'
  },
  loading: false,
});

// Mock Next.js router hooks
export const useRouter = () => ({
  push: (url: string) => console.log('Navigate to:', url),
  replace: (url: string) => console.log('Replace with:', url),
  back: () => console.log('Go back'),
  forward: () => console.log('Go forward'),
  refresh: () => console.log('Refresh'),
  prefetch: () => Promise.resolve(),
  pathname: '/storybook',
  query: {},
  asPath: '/storybook',
  route: '/storybook',
});

export const useSearchParams = () => new URLSearchParams();
export const usePathname = () => '/storybook';
export const useParams = () => ({});
export const notFound = () => console.log('notFound called');
export const redirect = (url: string) => console.log('redirect called with:', url);

// Mock AI functions for Storybook
export const callOpenAI = async () => ({ content: 'Mock AI response' });
export const callAnthropic = async () => ({ content: 'Mock AI response' });
export const summarizeSessionLog = async () => ({ summary: 'Mock session summary' });
export const generateFollowUpQuestions = async () => ({ questions: ['Mock question 1', 'Mock question 2'] });
export const combineExpandedFeedback = async () => ({ expandedFeedback: 'Mock expanded feedback' });
export const needsExpansion = () => false;
export const generateTrainingPlan = async () => ({ plan: 'Mock training plan' });
export const extractAndEvaluateGoal = async () => ({ goal: 'Mock goal' });
export const analyzeSessionPatterns = async () => ({ patterns: 'Mock patterns' });

// Mock types for AI features
export type FollowUpQuestions = {
  questions: string[];
};

// Default exports for compatibility
export default {
  useAuth,
  AuthProvider,
  UrqlProvider,
  useCoachProfile,
  useRouter,
  useSearchParams,
  usePathname,
  useParams,
  notFound,
  redirect,
  callOpenAI,
  callAnthropic,
  summarizeSessionLog,
  generateFollowUpQuestions,
  combineExpandedFeedback,
  needsExpansion,
  generateTrainingPlan,
  extractAndEvaluateGoal,
  analyzeSessionPatterns,
};