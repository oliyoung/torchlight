import type { StorybookConfig } from "@storybook/nextjs";
import { join, dirname } from "path";

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")));
}

const config: StorybookConfig = {
  stories: [
    "../app/**/*.stories.tsx",
    "../components/**/*.stories.tsx"
  ],
  addons: [
    getAbsolutePath("@storybook/addon-onboarding"),
    getAbsolutePath("@chromatic-com/storybook"),
    getAbsolutePath("@storybook/addon-docs"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-vitest")
  ],
  framework: {
    name: getAbsolutePath("@storybook/nextjs"),
    options: {
      nextConfigPath: "../next.config.ts"
    }
  },
  features: {
    experimentalRSC: false,
  },
  staticDirs: [
    "../public"
  ],
  webpackFinal: async (config) => {
    const path = require('path');
    
    const mockProvidersPath = path.resolve(__dirname, './storybook-providers.tsx');
    
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      // Mock Next.js navigation for Storybook
      "next/navigation": mockProvidersPath,
      // Mock auth context for Storybook - be very explicit
      "@/lib/auth/context": mockProvidersPath,
      // Alternative path in case @ alias doesn't work
      "../lib/auth/context": mockProvidersPath,
      // Mock coach profile hook for Storybook
      "@/lib/hooks/use-coach-profile": mockProvidersPath,
      "../lib/hooks/use-coach-profile": mockProvidersPath,
      // Mock UrqlProvider for Storybook
      "@/lib/hooks/urql-provider": mockProvidersPath,
      "../lib/hooks/urql-provider": mockProvidersPath,
      // Mock AI providers and features for Storybook
      "@/ai/providers/anthropic": mockProvidersPath,
      "@/ai/providers/openai": mockProvidersPath,
      "@/ai/features/expandYouthFeedback": mockProvidersPath,
      "@/ai/features/summarizeSessionLog": mockProvidersPath,
      "@/ai/features/generateTrainingPlan": mockProvidersPath,
      "@/ai/features/extractAndEvaluateGoal": mockProvidersPath,
      "@/ai/features/analyzeSessionPatterns": mockProvidersPath,
      "@/ai/index": mockProvidersPath,
      // Mock Node.js packages for Storybook
      "@anthropic-ai/sdk": mockProvidersPath,
      "openai": mockProvidersPath,
    };
    
    return config;
  },
};
export default config;