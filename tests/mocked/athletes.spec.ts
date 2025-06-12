import { mockedTest, expect } from '../fixtures';
import { MOCK_ATHLETES } from '../mocks/graphql';

mockedTest.describe('Athletes Management (Mocked)', () => {
  mockedTest('should load athletes page and display athletes list', async ({ mockedCoachPage }) => {
    await mockedCoachPage.goToAthletes();

    // Verify we're on the athletes page
    await expect(mockedCoachPage.page).toHaveURL(/.*\/athletes/);

    // Check that the page loaded successfully - use actual app title
    await expect(mockedCoachPage.page).toHaveTitle(/wisegrowth|Athletes|Coaching|Coach/i);

    // Verify authentication is working (should return true with mocked auth)
    const isAuth = await mockedCoachPage.isAuthenticated();
    expect(isAuth).toBe(true);
  });

  mockedTest('should fetch athletes via GraphQL with mock data', async ({ mockedCoachPage }) => {
    // Test the GraphQL API directly - uses mocked responses
    const result = await mockedCoachPage.makeGraphQLRequest(`
      query {
        athletes {
          id
          firstName
          lastName
          sport
          birthday
          tags
          email
        }
      }
    `);

    expect(result.errors).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(result.data.athletes).toBeDefined();
    expect(Array.isArray(result.data.athletes)).toBe(true);

    // Check that we get the expected mock data
    expect(result.data.athletes.length).toBe(MOCK_ATHLETES.length);
    expect(result.data.athletes[0].firstName).toBe('Sarah');
    expect(result.data.athletes[0].sport).toBe('Tennis');

    console.log(`✅ Found ${result.data.athletes.length} mocked athletes`);
  });

  mockedTest('should be able to view an athlete detail page with mock data', async ({ mockedCoachPage }) => {
    // First, get athletes via GraphQL - this will return mock data
    const result = await mockedCoachPage.makeGraphQLRequest(`
      query {
        athletes {
          id
          firstName
          lastName
        }
      }
    `);

    expect(result.data).toBeDefined();
    expect(result.data.athletes).toBeDefined();
    expect(result.data.athletes.length).toBeGreaterThan(0);

    // Navigate to the first mock athlete
    const firstAthlete = result.data.athletes[0];
    await mockedCoachPage.goToAthlete(firstAthlete.id);

    // Verify we're on the athlete detail page
    await expect(mockedCoachPage.page).toHaveURL(new RegExp(`.*\/athletes\/${firstAthlete.id}`));

    // The page might not show the athlete name since it's a mock ID,
    // but we can verify the URL changed correctly
    console.log(`✅ Navigated to athlete page for: ${firstAthlete.firstName} ${firstAthlete.lastName}`);
  });

  mockedTest('should have valid mock authentication token', async ({ mockedCoachPage }) => {
    // Ensure we're on a proper page before checking auth
    await mockedCoachPage.goToAthletes();

    const token = await mockedCoachPage.getAuthToken();
    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
    expect(token).toContain('mock-jwt-token');

    console.log('✅ Mock authentication token verified');
  });

  mockedTest('should be able to make authenticated GraphQL requests with mocks', async ({ mockedCoachPage }) => {
    // Test multiple GraphQL queries with mocked responses
    const queries = [
      {
        name: 'assistants',
        query: `
          query {
            assistants {
              id
              name
              bio
              sport
              role
              strengths
            }
          }
        `
      },
      {
        name: 'goals',
        query: `
          query {
            goals {
              id
              title
              status
              sport
            }
          }
        `
      },
      {
        name: 'sessionLogs',
        query: `
          query {
            sessionLogs {
              id
              date
              notes
              summary
            }
          }
        `
      }
    ];

    for (const { name, query } of queries) {
      const result = await mockedCoachPage.makeGraphQLRequest(query);

      expect(result.errors).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(result.data[name]).toBeDefined();
      expect(Array.isArray(result.data[name])).toBe(true);

      console.log(`✅ ${name} query successful with ${result.data[name].length} items`);
    }
  });

  mockedTest('should have correct mock authentication state in localStorage', async ({ mockedCoachPage }) => {
    // Navigate to a proper page first to ensure we have a valid origin
    await mockedCoachPage.goToAthletes();

    // Wait for page to fully load
    await mockedCoachPage.page.waitForLoadState('networkidle');

    const authState = await mockedCoachPage.page.evaluate(() => {
      const authData = localStorage.getItem('playwright-auth');
      return authData ? JSON.parse(authData) : null;
    });

    expect(authState).toBeTruthy();
    expect(authState.authenticated).toBe(true);
    expect(authState.role).toBe('coach');
    expect(authState.userEmail).toBe('mock.coach@playwright.test');
    expect(authState.userId).toBe('mock-user-id-12345');

    console.log('✅ Mock auth state verified in localStorage');
  });
});

mockedTest.describe('Navigation (Mocked)', () => {
  mockedTest('should be able to navigate between main sections', async ({ mockedCoachPage }) => {
    // Test navigation to different sections - all should work with mocked auth
    await mockedCoachPage.goToAthletes();
    await expect(mockedCoachPage.page).toHaveURL(/.*\/athletes/);

    await mockedCoachPage.goToGoals();
    await expect(mockedCoachPage.page).toHaveURL(/.*\/goals/);

    await mockedCoachPage.goToSessionLogs();
    await expect(mockedCoachPage.page).toHaveURL(/.*\/session-logs/);

    await mockedCoachPage.goToTrainingPlans();
    await expect(mockedCoachPage.page).toHaveURL(/.*\/training-plans/);

    await mockedCoachPage.goToAssistants();
    await expect(mockedCoachPage.page).toHaveURL(/.*\/assistants/);

    console.log('✅ All navigation tests passed with mock auth');
  });

  mockedTest('should maintain mock authentication across navigation', async ({ mockedCoachPage }) => {
    // Navigate to different pages and verify mock auth is maintained
    const pages = ['/athletes', '/goals', '/session-logs', '/training-plans', '/assistants'];

    for (const page of pages) {
      await mockedCoachPage.page.goto(page);
      const isAuth = await mockedCoachPage.isAuthenticated();
      expect(isAuth).toBe(true);

      // Verify we have a mock auth token
      const token = await mockedCoachPage.getAuthToken();
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token).toContain('mock-jwt-token');
    }

    console.log('✅ Mock authentication maintained across all pages');
  });
});

mockedTest.describe('Mock Benefits Demo', () => {
  mockedTest('should run much faster than real API tests', async ({ mockedCoachPage }) => {
    const startTime = Date.now();

    // Make multiple "API" calls - all are mocked so should be very fast
    await mockedCoachPage.makeGraphQLRequest('query { athletes { id firstName lastName } }');
    await mockedCoachPage.makeGraphQLRequest('query { goals { id title status } }');
    await mockedCoachPage.makeGraphQLRequest('query { assistants { id name sport } }');
    await mockedCoachPage.makeGraphQLRequest('query { sessionLogs { id date notes } }');

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Should be very fast since everything is mocked
    expect(duration).toBeLessThan(1000); // Less than 1 second

    console.log(`✅ All mocked API calls completed in ${duration}ms`);
  });

  mockedTest('should work without any external dependencies', async ({ mockedCoachPage }) => {
    // This test proves that no real Supabase, database, or API is needed
    await mockedCoachPage.goToAthletes();

    const isAuth = await mockedCoachPage.isAuthenticated();
    expect(isAuth).toBe(true);

    const athletes = await mockedCoachPage.makeGraphQLRequest('query { athletes { id firstName } }');
    expect(athletes.data.athletes.length).toBeGreaterThan(0);

    console.log('✅ Test completed without any external service dependencies');
  });
});