// Mock useCoachProfile hook for Storybook

const mockCoach = {
  id: 'storybook-coach',
  email: 'storybook@example.com',
  firstName: 'Storybook',
  lastName: 'User',
  displayName: 'Storybook User',
  timezone: 'America/New_York',
  role: 'PROFESSIONAL',
  onboardingCompleted: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockUser = {
  id: 'storybook-user',
  email: 'storybook@example.com',
};

export const useCoachProfile = () => ({
  coach: mockCoach,
  user: mockUser,
  loading: false,
  error: null,
});

export default {
  useCoachProfile,
};