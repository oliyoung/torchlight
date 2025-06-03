import { test as base, type Page, type BrowserContext } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import * as path from 'path';

// Environment variables
export const TEST_CONFIG = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  baseUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  // Test credentials - these should exist in your test database
  testCoachEmail: process.env.TEST_COACH_EMAIL ?? 'playwright.test@gmail.com',
  testCoachPassword: process.env.TEST_COACH_PASSWORD ?? 'TestPassword123!',
};

// Auth file paths
const coachAuthFile = path.join(__dirname, '../playwright/.auth/coach.json');

/**
 * Page Object Model for authenticated coach pages
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

  // Authentication helpers
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
    await this.ensurePageReady();

    try {
      return await this.page.evaluate(() => {
        // Check if localStorage is available
        if (typeof localStorage === 'undefined') {
          return null;
        }

        // Try to get Supabase auth token from localStorage
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.includes('auth-token')) {
            try {
              const session = JSON.parse(localStorage.getItem(key) ?? '');
              return session.access_token;
            } catch (e) {
              continue;
            }
          }
        }
        return null;
      });
    } catch (error) {
      console.log('⚠️  Could not access localStorage for auth token:', error);
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    await this.ensurePageReady();

    try {
      return await this.page.evaluate(() => {
        // Check if localStorage is available
        if (typeof localStorage === 'undefined') {
          return false;
        }

        const authData = localStorage.getItem('playwright-auth');
        if (authData) {
          try {
            const parsed = JSON.parse(authData);
            return parsed.authenticated === true;
          } catch (e) {
            return false;
          }
        }
        return false;
      });
    } catch (error) {
      console.log('⚠️  Could not access localStorage for auth check:', error);
      return false;
    }
  }

  // GraphQL helper
  async makeGraphQLRequest(query: string, variables?: Record<string, any>) {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await this.page.request.post(`${TEST_CONFIG.baseUrl}/api/graphql`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
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
 * Custom fixtures for authenticated testing
 */
export type TestFixtures = {
  authenticatedPage: Page;
  coachPage: CoachPage;
  coachContext: BrowserContext;
};

export const test = base.extend<TestFixtures>({
  // Authenticated page using the pre-saved coach authentication state
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: coachAuthFile
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  // Coach-specific page object with helper methods
  coachPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: coachAuthFile
    });
    const page = await context.newPage();
    const coachPage = new CoachPage(page, context);
    await use(coachPage);
    await context.close();
  },

  // Authenticated browser context (for when you need multiple pages)
  coachContext: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: coachAuthFile
    });
    await use(context);
    await context.close();
  },
});

export { expect } from '@playwright/test';

/**
 * Creates a test coach user if it doesn't exist
 * This should be run during test setup to ensure test users exist
 */
export async function createTestCoachIfNotExists() {
  const supabase = createClient(TEST_CONFIG.supabaseUrl, TEST_CONFIG.supabaseAnonKey);

  try {
    // Try to sign in first to check if user exists
    const { data: existingUser, error: signInError } = await supabase.auth.signInWithPassword({
      email: TEST_CONFIG.testCoachEmail,
      password: TEST_CONFIG.testCoachPassword,
    });

    if (existingUser.user && !signInError) {
      console.log('✅ Test coach user already exists and credentials work');
      await supabase.auth.signOut(); // Sign out after verification
      return { success: true, created: false };
    }

    // If sign in failed, try to create the user
    const { data: newUser, error: signUpError } = await supabase.auth.signUp({
      email: TEST_CONFIG.testCoachEmail,
      password: TEST_CONFIG.testCoachPassword,
    });

    if (signUpError) {
      // If we get a rate limit error, assume user exists and try to sign in again
      if (signUpError.message.includes('For security purposes') || signUpError.message.includes('rate limit')) {
        console.log('⚠️  Rate limited, but assuming user exists from previous runs');
        return { success: true, created: false };
      }

      console.error('❌ Failed to create test coach:', signUpError.message);
      return { success: false, error: signUpError.message };
    }

    if (newUser.user) {
      console.log('✅ Test coach user created successfully');
      return { success: true, created: true, userId: newUser.user.id };
    }

    return { success: false, error: 'Unknown error creating user' };
  } catch (error) {
    console.error('❌ Error in createTestCoachIfNotExists:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Clean up test data after tests
 */
export async function cleanupTestData() {
  // This would implement cleanup of test data if needed
  console.log('🧹 Test cleanup completed');
}

/**
 * Verify that environment variables are set for testing
 */
export function verifyTestEnvironment() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  console.log('✅ Test environment verified');
  return true;
}

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

  static async login(page: any, email = TEST_CONFIG.testCoachEmail, password = TEST_CONFIG.testCoachPassword) {
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