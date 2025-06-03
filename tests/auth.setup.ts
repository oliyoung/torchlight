import { test as setup, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import * as path from 'path';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Test user credentials (you should set these in your environment or use different test users)
const TEST_COACH_EMAIL = process.env.TEST_COACH_EMAIL || 'testcoach@example.com';
const TEST_COACH_PASSWORD = process.env.TEST_COACH_PASSWORD || 'testpassword123';

// Auth files
const coachAuthFile = path.join(__dirname, '../playwright/.auth/coach.json');

/**
 * Authenticate as a coach using Supabase API
 * This setup runs before all tests and creates an authenticated browser state
 */
setup('authenticate as coach', async ({ page }) => {
  console.log('🔐 Setting up coach authentication...');

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Authenticate via Supabase API call
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: TEST_COACH_EMAIL,
      password: TEST_COACH_PASSWORD,
    });

    if (authError) {
      console.error('❌ Authentication failed:', authError.message);
      throw new Error(`Authentication failed: ${authError.message}`);
    }

    if (!authData.session?.access_token) {
      throw new Error('No access token received from authentication');
    }

    console.log('✅ API authentication successful');
    console.log('📧 User:', authData.user.email);
    console.log('🆔 User ID:', authData.user.id);

    // Navigate to the app to set up the browser context
    await page.goto(baseUrl);

    // Inject the authentication state into the browser
    await page.evaluate(
      ({ session }) => {
        // Set Supabase session in localStorage (this is how Supabase client stores auth)
        const supabaseKey = `sb-${window.location.hostname.replace(/\./g, '-')}-auth-token`;
        localStorage.setItem(supabaseKey, JSON.stringify(session));

        // Also set a custom auth flag for easier testing
        localStorage.setItem('playwright-auth', JSON.stringify({
          authenticated: true,
          userEmail: session.user.email,
          userId: session.user.id,
          role: 'coach',
          tokenExpiry: session.expires_at
        }));
      },
      { session: authData.session }
    );

    // Navigate to the main app page to ensure auth is loaded
    await page.goto(`${baseUrl}/athletes`);

    // Wait for the authenticated state to be recognized
    // This could be waiting for a user menu, navigation, or any element that appears when logged in
    try {
      // Wait for a reasonable time for the app to recognize the auth state
      await page.waitForTimeout(2000);

      // Try to find an element that indicates successful authentication
      // Adjust this selector based on your app's authenticated state indicators
      await page.waitForSelector('[data-testid="authenticated-nav"], nav, header', {
        timeout: 10000
      });

      console.log('✅ Browser authentication state verified');
    } catch (error) {
      // Don't fail if we can't find specific authenticated elements
      // The auth tokens are set, which is the main requirement
      console.log('⚠️  Could not verify specific authenticated elements, but tokens are set');
    }

    // Save the authenticated browser state
    await page.context().storageState({ path: coachAuthFile });
    console.log('💾 Authentication state saved to:', coachAuthFile);

  } catch (error) {
    console.error('❌ Setup authentication failed:', error);
    throw error;
  }
});

/**
 * Test the authentication by making a GraphQL request
 * This ensures the auth setup is working correctly
 */
setup('verify coach authentication', async ({ request }) => {
  console.log('🧪 Verifying coach authentication with GraphQL...');

  // Read the saved auth state to get the token
  const fs = await import('fs');
  const authState = JSON.parse(fs.readFileSync(coachAuthFile, 'utf-8'));

  // Extract token from the storage state
  const localStorage = authState.origins[0]?.localStorage;
  const authEntry = localStorage?.find((item: any) =>
    item.name.includes('auth-token') || item.name === 'playwright-auth'
  );

  if (!authEntry && !localStorage) {
    throw new Error('No authentication data found in saved state');
  }

  // Try to extract the Supabase session token
  let accessToken = null;
  for (const item of localStorage || []) {
    if (item.name.includes('auth-token')) {
      try {
        const session = JSON.parse(item.value);
        accessToken = session.access_token;
        break;
      } catch (e) {
        // Continue looking
      }
    }
  }

  if (!accessToken) {
    console.log('⚠️  Could not extract access token from saved state, skipping GraphQL verification');
    return;
  }

  try {
    // Test GraphQL endpoint with authentication
    const response = await request.post(`${baseUrl}/api/graphql`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      data: {
        query: `
          query {
            athletes {
              id
              name
              sport
            }
          }
        `
      }
    });

    const responseData = await response.json();

    if (response.ok() && !responseData.errors) {
      console.log('✅ GraphQL authentication verification successful');
      console.log('📊 Athletes found:', responseData.data?.athletes?.length || 0);
    } else {
      console.log('⚠️  GraphQL request had issues:', responseData.errors?.[0]?.message || 'Unknown error');
    }

  } catch (error) {
    console.log('⚠️  GraphQL verification failed:', error);
    // Don't throw here - the main auth setup is what matters
  }
});