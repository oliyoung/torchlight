import { test, expect, CoachPage } from '../fixtures';

test.describe('Athletes Management (Authenticated)', () => {
  test('should load athletes page and display athletes list', async ({ coachPage }) => {
    await coachPage.goToAthletes();

    // Verify we're on the athletes page
    await expect(coachPage.page).toHaveURL(/.*\/athletes/);

    // Check that the page loaded successfully
    await expect(coachPage.page).toHaveTitle(/Athletes|Coaching|Coach/i);

    // Verify authentication is working
    const isAuth = await coachPage.isAuthenticated();
    expect(isAuth).toBe(true);
  });

  test('should be able to navigate to create new athlete', async ({ coachPage }) => {
    await coachPage.goToAthletes();

    // Look for "New Athlete" or "Add Athlete" button
    const newAthleteButton = coachPage.page.getByRole('link', { name: /new athlete|add athlete|create athlete/i });
    await expect(newAthleteButton).toBeVisible();

    // Click the button
    await newAthleteButton.click();

    // Should navigate to the new athlete page
    await expect(coachPage.page).toHaveURL(/.*\/athletes\/new/);
  });

  test('should fetch athletes via GraphQL', async ({ coachPage }) => {
    // Test the GraphQL API directly
    const result = await coachPage.makeGraphQLRequest(`
      query {
        athletes {
          id
          name
          sport
          dateOfBirth
          tags
        }
      }
    `);

    expect(result.errors).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(result.data.athletes).toBeDefined();
    expect(Array.isArray(result.data.athletes)).toBe(true);

    // Log the number of athletes for debugging
    console.log(`Found ${result.data.athletes.length} athletes`);
  });

  test('should be able to view an athlete detail page', async ({ coachPage }) => {
    // First, get athletes via GraphQL
    const result = await coachPage.makeGraphQLRequest(`
      query {
        athletes {
          id
          name
        }
      }
    `);

    expect(result.data.athletes).toBeDefined();

    // If we have athletes, navigate to the first one
    if (result.data.athletes.length > 0) {
      const firstAthlete = result.data.athletes[0];
      await coachPage.goToAthlete(firstAthlete.id);

      // Verify we're on the athlete detail page
      await expect(coachPage.page).toHaveURL(new RegExp(`.*\/athletes\/${firstAthlete.id}`));

      // Check that the athlete's name appears on the page
      await expect(coachPage.page.getByText(firstAthlete.name)).toBeVisible();
    } else {
      // Skip test if no athletes exist
      test.skip(true, 'No athletes found for detail page test');
    }
  });
});

test.describe('Navigation (Authenticated)', () => {
  test('should be able to navigate between main sections', async ({ coachPage }) => {
    // Test navigation to different sections
    await coachPage.goToAthletes();
    await expect(coachPage.page).toHaveURL(/.*\/athletes/);

    await coachPage.goToGoals();
    await expect(coachPage.page).toHaveURL(/.*\/goals/);

    await coachPage.goToSessionLogs();
    await expect(coachPage.page).toHaveURL(/.*\/session-logs/);

    await coachPage.goToTrainingPlans();
    await expect(coachPage.page).toHaveURL(/.*\/training-plans/);

    await coachPage.goToAssistants();
    await expect(coachPage.page).toHaveURL(/.*\/assistants/);
  });

  test('should maintain authentication across navigation', async ({ coachPage }) => {
    // Navigate to different pages and verify auth is maintained
    const pages = ['/athletes', '/goals', '/session-logs', '/training-plans', '/assistants'];

    for (const page of pages) {
      await coachPage.page.goto(page);
      const isAuth = await coachPage.isAuthenticated();
      expect(isAuth).toBe(true);

      // Verify we have an auth token
      const token = await coachPage.getAuthToken();
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      if (token) {
        expect(token.length).toBeGreaterThan(50); // JWT tokens are typically long
      }
    }
  });
});

test.describe('Authentication State', () => {
  test('should have valid authentication token', async ({ coachPage }) => {
    const token = await coachPage.getAuthToken();
    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
    if (token) {
      expect(token.length).toBeGreaterThan(50); // JWT tokens are typically long
    }
  });

  test('should be able to make authenticated GraphQL requests', async ({ coachPage }) => {
    // Test a simple authenticated query
    const result = await coachPage.makeGraphQLRequest(`
      query {
        assistants {
          id
          name
          bio
          sport
        }
      }
    `);

    expect(result.errors).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(result.data.assistants).toBeDefined();
    expect(Array.isArray(result.data.assistants)).toBe(true);
  });

  test('should have correct authentication state in localStorage', async ({ coachPage }) => {
    const authState = await coachPage.page.evaluate(() => {
      const authData = localStorage.getItem('playwright-auth');
      return authData ? JSON.parse(authData) : null;
    });

    expect(authState).toBeTruthy();
    expect(authState.authenticated).toBe(true);
    expect(authState.role).toBe('coach');
    expect(authState.userEmail).toBeTruthy();
    expect(authState.userId).toBeTruthy();
  });
});