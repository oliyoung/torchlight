// Mock auth context for Storybook

const mockUser = {
  id: 'storybook-user',
  email: 'storybook@example.com',
  user_metadata: {},
  app_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: mockUser,
};

const mockAuthContext = {
  user: mockUser,
  session: mockSession,
  loading: false,
  signIn: async (email, password) => {
    console.log('Mock signIn called with:', email);
    return { error: null };
  },
  signUp: async (email, password) => {
    console.log('Mock signUp called with:', email);
    return { error: null };
  },
  signInWithGoogle: async () => {
    console.log('Mock signInWithGoogle called');
    return { error: null };
  },
  signOut: async () => {
    console.log('Mock signOut called');
  },
  getAccessToken: () => 'mock-access-token',
};

export const useAuth = () => mockAuthContext;

export const AuthProvider = ({ children }) => children;

export default {
  useAuth,
  AuthProvider,
};