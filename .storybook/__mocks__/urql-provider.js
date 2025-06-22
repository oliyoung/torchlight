// Mock UrqlProvider for Storybook

// Simple mock that just renders children without any GraphQL setup
export const UrqlProvider = ({ children }) => {
  return children;
};

export default {
  UrqlProvider,
};