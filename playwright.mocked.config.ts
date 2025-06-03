import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for mocked tests
 * No external dependencies required - all auth and API calls are mocked
 */
export default defineConfig({
  testDir: './tests/mocked',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? 'github' : 'html',
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
    // Mocked Chromium tests - no auth setup required
    {
      name: 'chromium-mocked',
      use: {
        ...devices['Desktop Chrome'],
      },
      testMatch: ['**/*.spec.ts'],
    },

    // Optional: Test on other browsers with mocks
    {
      name: 'firefox-mocked',
      use: {
        ...devices['Desktop Firefox'],
      },
      testMatch: ['**/*.spec.ts'],
    },

    {
      name: 'webkit-mocked',
      use: {
        ...devices['Desktop Safari'],
      },
      testMatch: ['**/*.spec.ts'],
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