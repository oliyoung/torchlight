import { test as base, type Page, type BrowserContext } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Test user credentials
const TEST_COACH_EMAIL = process.env.TEST_COACH_EMAIL || 'testcoach@example.com';
const TEST_COACH_PASSWORD = process.env.TEST_COACH_PASSWORD || 'testpassword123';

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
    await this.page.goto(`${baseUrl}/athletes`);
  }

  async goToAthlete(athleteId: string) {
    await this.page.goto(`${baseUrl}/athletes/${athleteId}`);
  }

  async goToGoals() {
    await this.page.goto(`${baseUrl}/goals`);
  }

  async goToSessionLogs() {
    await this.page.goto(`${baseUrl}/session-logs`);
  }

  async goToTrainingPlans() {
    await this.page.goto(`${baseUrl}/training-plans`);
  }

  async goToAssistants() {
    await this.page.goto(`${baseUrl}/assistants`);
  }

  // Authentication helpers
  async getAuthToken(): Promise<string | null> {
    return await this.page.evaluate(() => {
      // Try to get Supabase auth token from localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.includes('auth-token')) {
          try {
            const session = JSON.parse(localStorage.getItem(key) || '');
            return session.access_token;
          } catch (e) {
            continue;
          }
        }
      }
      return null;
    });
  }

  async isAuthenticated(): Promise<boolean> {
    return await this.page.evaluate(() => {
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
  }

  // GraphQL helper
  async makeGraphQLRequest(query: string, variables?: Record<string, any>) {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await this.page.request.post(`${baseUrl}/api/graphql`, {
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
 * Helper function to create a test user programmatically
 * Useful for tests that need fresh user accounts
 */
export async function createTestUser(email: string, password: string) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw new Error(`Failed to create test user: ${error.message}`);
  }

  return data;
}

/**
 * Helper function to authenticate a user and return the session
 * Useful for dynamic authentication in tests
 */
export async function authenticateUser(email: string, password: string) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(`Failed to authenticate user: ${error.message}`);
  }

  return data;
}

/**
 * Helper function to clean up test data
 * Call this in test cleanup to remove test artifacts
 */
export async function cleanupTestData(authToken: string, entityType: 'athletes' | 'goals' | 'session-logs', entityIds: string[]) {
  const deleteQueries = entityIds.map(id => {
    switch (entityType) {
      case 'athletes':
        return `mutation { deleteAthlete(id: "${id}") { success } }`;
      case 'goals':
        return `mutation { deleteGoal(id: "${id}") { success } }`;
      case 'session-logs':
        return `mutation { deleteSessionLog(id: "${id}") { success } }`;
      default:
        throw new Error(`Unsupported entity type: ${entityType}`);
    }
  });

  // Execute cleanup mutations
  for (const query of deleteQueries) {
    try {
      const response = await fetch(`${baseUrl}/api/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ query })
      });

      const result = await response.json();
      if (result.errors) {
        console.warn('Cleanup warning:', result.errors[0]?.message);
      }
    } catch (error) {
      console.warn('Cleanup error:', error);
    }
  }
}