import { test as base, type Page, type BrowserContext } from '@playwright/test';
import * as path from 'path';

// Environment variables
export const TEST_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
};

/**
 * Page Object Model for coach pages
 * Add coach-specific locators and helper methods here
 */
export class CoachPage {
  readonly page: Page;
  readonly context: BrowserContext;

  constructor(page: Page, context: BrowserContext) {
    this.page = page;
    this.context = context;
  }

  // Navigation helpers
  async goToAthletes() {
    await this.page.goto(`${TEST_CONFIG.baseUrl}/athletes`);
  }

  async goToAthlete(athleteId: string) {
    await this.page.goto(`${TEST_CONFIG.baseUrl}/athletes/${athleteId}`);
  }

  async goToGoals() {
    await this.page.goto(`${TEST_CONFIG.baseUrl}/goals`);
  }

  async goToSessionLogs() {
    await this.page.goto(`${TEST_CONFIG.baseUrl}/session-logs`);
  }

  async goToTrainingPlans() {
    await this.page.goto(`${TEST_CONFIG.baseUrl}/training-plans`);
  }

  async goToAssistants() {
    await this.page.goto(`${TEST_CONFIG.baseUrl}/assistants`);
  }

  // Authentication helpers (mocked)
  async ensurePageReady(): Promise<void> {
    try {
      // Ensure we're on a proper HTTP/HTTPS URL, not about:blank
      const currentUrl = this.page.url();
      if (currentUrl === 'about:blank' || currentUrl === '') {
        await this.goToAthletes(); // Navigate to a known good page
      }

      // Wait for the page to be fully loaded
      await this.page.waitForLoadState('networkidle', { timeout: 5000 });
    } catch (error) {
      console.log('⚠️  Could not ensure page readiness:', error);
    }
  }

  async getAuthToken(): Promise<string | null> {
    // Return mock token for mocked tests
    return 'mock-auth-token';
  }

  async isAuthenticated(): Promise<boolean> {
    // Always return true for mocked tests
    return true;
  }

  // GraphQL helper (uses mocked responses)
  async makeGraphQLRequest(query: string, variables?: Record<string, any>) {
    // For mocked version, we can just return the query to the intercepted GraphQL endpoint
    // The mock will handle the response based on the query content
    const response = await this.page.request.post(`${TEST_CONFIG.baseUrl}/api/graphql`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token'
      },
      data: {
        query,
        variables
      }
    });

    return await response.json();
  }
}

/**
 * Custom fixtures for mocked testing (no real authentication or API calls)
 */
export type MockedTestFixtures = {
  mockedPage: Page;
  mockedCoachPage: CoachPage;
  mockedContext: BrowserContext;
};

// Mocked fixtures that use fake auth and data
export const mockedTest = base.extend<MockedTestFixtures>({
  // Mocked page with fake auth and GraphQL responses
  mockedPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Setup all mocks
    const { setupAllMocks } = await import('./mocks/graphql');
    await setupAllMocks(page, TEST_CONFIG.baseUrl);

    await use(page);
    await context.close();
  },

  // Mocked coach page with fake data
  mockedCoachPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Setup all mocks
    const { setupAllMocks } = await import('./mocks/graphql');
    await setupAllMocks(page, TEST_CONFIG.baseUrl);

    const mockedCoachPage = new CoachPage(page, context);
    await use(mockedCoachPage);
    await context.close();
  },

  // Mocked browser context
  mockedContext: async ({ browser }, use) => {
    const context = await browser.newContext();
    await use(context);
    await context.close();
  },
});

// Export the mocked test as the default test since we're only using mocked tests now
export const test = mockedTest;

export { expect } from '@playwright/test';

/**
 * Common test selectors and helpers
 */
export const SELECTORS = {
  // Login page
  emailInput: 'input[name="email"], input[aria-label*="email" i]',
  passwordInput: 'input[name="password"], input[aria-label*="password" i]',
  signInButton: 'button:has-text("Sign In")',
  signUpButton: 'button:has-text("Sign Up")',
  errorMessage: '[data-testid="error-message"], .error, [role="alert"]',

  // Navigation
  authenticatedNav: '[data-testid="authenticated-nav"], nav, header',
  userMenu: '[data-testid="user-menu"]',

  // Common page elements
  pageTitle: 'h1, [data-testid="page-title"]',
  loadingSpinner: '[data-testid="loading"], .loading',
};

/**
 * Common test helpers
 */
export class TestHelpers {
  static async waitForPageLoad(page: any, timeout = 10000) {
    await page.waitForLoadState('networkidle', { timeout });
  }

  static async ensureValidPage(page: any) {
    const currentUrl = page.url();
    if (currentUrl === 'about:blank' || currentUrl === '') {
      await page.goto(TEST_CONFIG.baseUrl);
      await TestHelpers.waitForPageLoad(page);
    }
  }

  static async safeLocalStorageAccess(page: any, callback: () => any) {
    try {
      await TestHelpers.ensureValidPage(page);
      return await page.evaluate(callback);
    } catch (error) {
      console.log('⚠️  localStorage access failed:', error);
      return null;
    }
  }

  static async login(page: any, email = 'test@example.com', password = 'password') {
    await page.goto('/login');
    await page.fill(SELECTORS.emailInput, email);
    await page.fill(SELECTORS.passwordInput, password);
    await page.click(SELECTORS.signInButton);

    // Wait for redirect after login
    await page.waitForURL(/^(?!.*\/login).*$/, { timeout: 10000 });
  }

  static async logout(page: any) {
    try {
      // Implement logout logic based on your app's logout mechanism
      await TestHelpers.safeLocalStorageAccess(page, () => {
        localStorage.clear();
        sessionStorage.clear();
      });
    } catch (error) {
      console.log('⚠️  Could not clear storage during logout:', error);
    }
  }
}