/**
 * Mock authentication system for Playwright tests
 * Provides fake auth state and tokens without requiring real Supabase
 */

import type { Page, Route } from '@playwright/test';

export const MOCK_USER = {
  id: 'mock-user-id-12345',
  email: 'mock.coach@playwright.test',
  firstName: 'Mock',
  lastName: 'Coach',
  role: 'coach',
  aud: 'authenticated',
  exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
  iat: Math.floor(Date.now() / 1000),
  iss: 'https://mock-supabase.com/auth/v1',
  sub: 'mock-user-id-12345',
  email_confirmed_at: '2024-01-01T00:00:00.000Z',
  phone_confirmed_at: null,
  confirmation_sent_at: null,
  confirmed_at: '2024-01-01T00:00:00.000Z',
  last_sign_in_at: new Date().toISOString(),
  app_metadata: {
    provider: 'email',
    providers: ['email']
  },
  user_metadata: {
    firstName: 'Mock',
    lastName: 'Coach'
  }
};

export const MOCK_SESSION = {
  access_token: 'mock-jwt-token-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzA2NzQ4MDAwLCJpYXQiOjE3MDY3NDQ0MDAsImlzcyI6Imh0dHBzOi8vbW9jay1zdXBhYmFzZS5jb20vYXV0aC92MSIsInN1YiI6Im1vY2stdXNlci1pZC0xMjM0NSIsImVtYWlsIjoibW9jay5jb2FjaEBwbGF5d3JpZ2h0LnRlc3QiLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7fSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTcwNjc0NDQwMH1dLCJzZXNzaW9uX2lkIjoibW9jay1zZXNzaW9uLWlkIn0.mock-signature',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  refresh_token: 'mock-refresh-token-12345',
  user: MOCK_USER
};

export const MOCK_AUTH_STATE = {
  authenticated: true,
  userEmail: MOCK_USER.email,
  userId: MOCK_USER.id,
  role: 'coach',
  tokenExpiry: MOCK_SESSION.expires_at
};

interface AuthData {
  session: typeof MOCK_SESSION;
  authState: typeof MOCK_AUTH_STATE;
  baseUrl: string;
}

/**
 * Inject mock authentication state into a page
 */
export async function injectMockAuth(page: Page, baseUrl = 'http://localhost:3000') {
  await page.addInitScript((authData: AuthData) => {
    // Mock Supabase session in localStorage
    const hostname = new URL(authData.baseUrl).hostname;
    const supabaseKey = `sb-${hostname.replace(/\./g, '-')}-auth-token`;
    localStorage.setItem(supabaseKey, JSON.stringify(authData.session));

    // Mock Playwright auth flag
    localStorage.setItem('playwright-auth', JSON.stringify(authData.authState));

    // Mock any other auth-related storage
    localStorage.setItem('supabase.auth.token', JSON.stringify(authData.session));
  }, {
    session: MOCK_SESSION,
    authState: MOCK_AUTH_STATE,
    baseUrl
  });
}

/**
 * Clear all authentication state from a page
 */
export async function clearMockAuth(page: Page) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Mock Supabase auth API responses
 */
export async function mockSupabaseAuth(page: Page) {
  // Mock sign in
  await page.route('**/auth/v1/token*', async (route: Route) => {
    const postData = route.request().postData();

    if (postData?.includes('grant_type=password')) {
      // Mock successful login
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_SESSION)
      });
    } else {
      // Mock other auth operations
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Mock auth operation successful' })
      });
    }
  });

  // Mock sign out
  await page.route('**/auth/v1/logout*', async (route: Route) => {
    await route.fulfill({
      status: 204,
      body: ''
    });
  });

  // Mock user endpoint
  await page.route('**/auth/v1/user*', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_USER)
    });
  });
}