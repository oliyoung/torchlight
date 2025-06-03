import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Take screenshot on failure */
    screenshot: 'only-on-failure',

    /* Record video on failure */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    // Setup project for authentication
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      teardown: 'cleanup',
    },

    // Cleanup project (optional)
    {
      name: 'cleanup',
      testMatch: /.*\.cleanup\.ts/,
    },

    // Authenticated Chromium tests
    {
      name: 'chromium-authenticated',
      use: {
        ...devices['Desktop Chrome'],
        // Use prepared auth state
        storageState: 'playwright/.auth/coach.json',
      },
      dependencies: ['setup'],
      testIgnore: ['**/auth.setup.ts', '**/example.spec.ts'],
    },

    // Unauthenticated Chromium tests (for login flow, public pages, etc.)
    {
      name: 'chromium-unauthenticated',
      use: {
        ...devices['Desktop Chrome'],
        // No storage state - completely clean browser
        storageState: { cookies: [], origins: [] },
      },
      testMatch: ['**/unauthenticated/**/*.spec.ts', '**/login/**/*.spec.ts'],
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: process.env.CI ? 'npm run build && npm run start' : 'npm run dev',
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes timeout for server start
  },
});
