/**
 * Playwright tests for the two-step onboarding flow
 * Tests both coach profile creation and athlete creation steps
 */

import { test, expect, SELECTORS } from '../fixtures';
import type { Page, Route } from '@playwright/test';

// Mock coach data for onboarding
const MOCK_COACH_DATA = {
  id: 'coach-new-123',
  email: 'new.coach@example.com',
  firstName: 'New',
  lastName: 'Coach',
  displayName: 'New Coach',
  timezone: 'America/New_York',
  role: 'PROFESSIONAL',
  onboardingCompleted: true,
  billing: {
    id: 'billing-123',
    subscriptionStatus: 'TRIAL',
    subscriptionTier: 'PROFESSIONAL',
    monthlyAthleteLimit: 999999,
    currentAthleteCount: 0
  }
};

// Mock athlete data for onboarding
const MOCK_ATHLETE_DATA = {
  id: 'athlete-new-123',
  firstName: 'First',
  lastName: 'Athlete',
  email: 'first.athlete@example.com',
  sport: 'Tennis',
  birthday: '1995-06-15',
  gender: 'FEMALE',
  height: 165.0,
  weight: 60.0,
  emergencyContactName: 'Emergency Contact',
  emergencyContactPhone: '+1234567890',
  medicalConditions: 'None',
  injuries: 'None',
  tags: ['beginner'],
  notes: 'First athlete profile'
};

/**
 * Setup onboarding-specific GraphQL mocks
 */
async function setupOnboardingMocks(page: Page) {
  let coachCreated = false;
  let athleteCreated = false;

  await page.route('**/api/graphql', async (route: Route) => {
    const request = route.request();
    const postData = request.postData();

    if (!postData) {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ errors: [{ message: 'No query provided' }] })
      });
      return;
    }

    let requestBody;
    try {
      requestBody = JSON.parse(postData);
    } catch (error) {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ errors: [{ message: 'Invalid JSON' }] })
      });
      return;
    }

    const { query, variables } = requestBody;

    // Mock the Me query for checking onboarding status
    if (query.includes('query Me')) {
      if (coachCreated) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: { me: MOCK_COACH_DATA }
          })
        });
      } else {
        // Return null to indicate no coach profile exists yet
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: { me: null }
          })
        });
      }
    }
    // Mock createCoach mutation
    else if (query.includes('createCoach')) {
      coachCreated = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            createCoach: {
              ...MOCK_COACH_DATA,
              onboardingCompleted: true
            }
          }
        })
      });
    }
    // Mock createAthlete mutation
    else if (query.includes('createAthlete')) {
      athleteCreated = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            createAthlete: MOCK_ATHLETE_DATA
          }
        })
      });
    }
    // Mock athletes query (for checking if user has athletes)
    else if (query.includes('athletes')) {
      if (athleteCreated) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: { athletes: [MOCK_ATHLETE_DATA] }
          })
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: { athletes: [] }
          })
        });
      }
    }
    // Default response
    else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: {} })
      });
    }
  });
}

test.describe('Onboarding Flow', () => {
  // Use a separate test with custom setup instead of beforeEach to avoid conflicts

  test('should complete full onboarding flow - Professional Coach', async ({ mockedPage }) => {
    // Step 1: Navigate to onboarding page
    await mockedPage.goto('/onboarding');
    
    // Should see step 1 indicator
    await expect(mockedPage.locator('text=Step 1 of 2: Profile Setup')).toBeVisible();
    
    // Should see welcome message
    await expect(mockedPage.locator('h1')).toContainText('Welcome to Torchlight!');
    
    // Should see role selection cards
    await expect(mockedPage.locator('text=Professional Coach')).toBeVisible();
    await expect(mockedPage.locator('text=Personal Coach')).toBeVisible();
    await expect(mockedPage.locator('text=Self-Coached')).toBeVisible();

    // Select Professional Coach role
    await mockedPage.click('[data-testid="role-card-PROFESSIONAL"], .cursor-pointer:has-text("Professional Coach")');
    
    // Verify card is selected (should have different styling)
    const professionalCard = mockedPage.locator('.cursor-pointer:has-text("Professional Coach")');
    await expect(professionalCard).toHaveClass(/border-primary/);

    // Fill in profile information
    await mockedPage.fill('input[name="firstName"], input[id="firstName"]', 'New');
    await mockedPage.fill('input[name="lastName"], input[id="lastName"]', 'Coach');
    await mockedPage.fill('input[name="displayName"], input[id="displayName"]', 'New Coach');

    // Submit the form
    await mockedPage.click('button[type="submit"]:has-text("Next"), button:has-text("Complete Setup")');

    // Should redirect to athlete creation with onboarding parameter
    await expect(mockedPage).toHaveURL(/\/athletes\/new\?onboarding=true/);
    
    // Step 2: Athlete creation page
    await expect(mockedPage.locator('text=Step 2 of 2: Add Your First Athlete')).toBeVisible();
    await expect(mockedPage.locator('h1')).toContainText('Add Your First Athlete');
    await expect(mockedPage.locator('text=Complete your onboarding')).toBeVisible();

    // Fill in athlete information
    await mockedPage.fill('input[name="firstName"], input[id="firstName"]', 'First');
    await mockedPage.fill('input[name="lastName"], input[id="lastName"]', 'Athlete');
    await mockedPage.fill('input[name="email"], input[id="email"]', 'first.athlete@example.com');
    
    // Select sport
    await mockedPage.selectOption('select[name="sport"], #sport', 'Tennis');
    
    // Select gender
    await mockedPage.selectOption('select[name="gender"], #gender', 'FEMALE');
    
    // Fill birthday
    await mockedPage.fill('input[name="birthday"], input[id="birthday"]', '1995-06-15');
    
    // Optional fields
    await mockedPage.fill('input[name="height"], input[id="height"]', '165');
    await mockedPage.fill('input[name="weight"], input[id="weight"]', '60');
    
    // Emergency contact
    await mockedPage.fill('input[name="emergencyContactName"], input[id="emergencyContactName"]', 'Emergency Contact');
    await mockedPage.fill('input[name="emergencyContactPhone"], input[id="emergencyContactPhone"]', '+1234567890');
    
    // Submit athlete creation
    await mockedPage.click('button[type="submit"]:has-text("Complete Setup"), button:has-text("Create Athlete")');

    // Should see success message
    await expect(mockedPage.locator('text=Athlete created successfully! Welcome to Torchlight!')).toBeVisible();
    
    // Should redirect to dashboard after completion
    await expect(mockedPage).toHaveURL(/^\//);
  });

  test('should complete onboarding flow - Personal Coach', async ({ mockedPage }) => {
    await mockedPage.goto('/onboarding');
    
    // Select Personal Coach role
    await mockedPage.click('.cursor-pointer:has-text("Personal Coach")');
    
    // Verify the role shows correct athlete limit
    await expect(mockedPage.locator('text=Up to 3')).toBeVisible();
    await expect(mockedPage.locator('text=Up to 3 athletes')).toBeVisible();

    // Fill profile information
    await mockedPage.fill('input[id="firstName"]', 'Parent');
    await mockedPage.fill('input[id="lastName"]', 'Coach');

    // Submit and continue to athlete creation
    await mockedPage.click('button[type="submit"]');
    await expect(mockedPage).toHaveURL(/\/athletes\/new\?onboarding=true/);
    
    // Complete athlete creation (abbreviated)
    await mockedPage.fill('input[id="firstName"]', 'Child');
    await mockedPage.fill('input[id="lastName"]', 'Athlete');
    await mockedPage.fill('input[id="email"]', 'child@example.com');
    await mockedPage.selectOption('#sport', 'Soccer');
    await mockedPage.fill('input[id="birthday"]', '2010-03-20');
    
    await mockedPage.click('button[type="submit"]');
    await expect(mockedPage).toHaveURL(/^\//);
  });

  test('should complete onboarding flow - Self-Coached', async ({ mockedPage }) => {
    await mockedPage.goto('/onboarding');
    
    // Select Self-Coached role
    await mockedPage.click('.cursor-pointer:has-text("Self-Coached")');
    
    // Verify the role shows correct athlete limit
    await expect(mockedPage.locator('text=1 (yourself)')).toBeVisible();

    // Fill profile information
    await mockedPage.fill('input[id="firstName"]', 'Self');
    await mockedPage.fill('input[id="lastName"]', 'Coached');

    // Submit and continue to athlete creation
    await mockedPage.click('button[type="submit"]');
    await expect(mockedPage).toHaveURL(/\/athletes\/new\?onboarding=true/);
    
    // Complete athlete creation (abbreviated)
    await mockedPage.fill('input[id="firstName"]', 'Self');
    await mockedPage.fill('input[id="lastName"]', 'Coached');
    await mockedPage.fill('input[id="email"]', 'self@example.com');
    await mockedPage.selectOption('#sport', 'Running');
    await mockedPage.fill('input[id="birthday"]', '1990-01-01');
    
    await mockedPage.click('button[type="submit"]');
    await expect(mockedPage).toHaveURL(/^\//);
  });

  test('should require role selection', async ({ mockedPage }) => {
    await mockedPage.goto('/onboarding');
    
    // Try to submit without selecting a role
    await mockedPage.fill('input[id="firstName"]', 'Test');
    await mockedPage.fill('input[id="lastName"]', 'User');
    
    // Submit button should be disabled
    const submitButton = mockedPage.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
  });

  test('should require required athlete fields', async ({ mockedPage }) => {
    // Go through coach creation first
    await mockedPage.goto('/onboarding');
    await mockedPage.click('.cursor-pointer:has-text("Professional Coach")');
    await mockedPage.fill('input[id="firstName"]', 'Test');
    await mockedPage.fill('input[id="lastName"]', 'Coach');
    await mockedPage.click('button[type="submit"]');
    
    // Now on athlete creation page
    await expect(mockedPage).toHaveURL(/\/athletes\/new\?onboarding=true/);
    
    // Try to submit without required fields
    await mockedPage.click('button[type="submit"]');
    
    // Should see validation errors
    await expect(mockedPage.locator('text=First name is required')).toBeVisible();
    await expect(mockedPage.locator('text=Last name is required')).toBeVisible();
    await expect(mockedPage.locator('text=Sport is required')).toBeVisible();
    await expect(mockedPage.locator('text=Birthday is required')).toBeVisible();
  });

  test('should show correct progress indicators', async ({ mockedPage }) => {
    // Step 1
    await mockedPage.goto('/onboarding');
    await expect(mockedPage.locator('text=Step 1 of 2: Profile Setup')).toBeVisible();
    
    // Complete step 1
    await mockedPage.click('.cursor-pointer:has-text("Professional Coach")');
    await mockedPage.fill('input[id="firstName"]', 'Test');
    await mockedPage.fill('input[id="lastName"]', 'Coach');
    await mockedPage.click('button[type="submit"]');
    
    // Step 2
    await expect(mockedPage.locator('text=Step 2 of 2: Add Your First Athlete')).toBeVisible();
    await expect(mockedPage.locator('text=You\'re almost done!')).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ mockedPage }) => {
    // Setup failing GraphQL responses
    await mockedPage.route('**/api/graphql', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          errors: [{ message: 'Network error' }]
        })
      });
    });

    await mockedPage.goto('/onboarding');
    await mockedPage.click('.cursor-pointer:has-text("Professional Coach")');
    await mockedPage.fill('input[id="firstName"]', 'Test');
    await mockedPage.fill('input[id="lastName"]', 'Coach');
    await mockedPage.click('button[type="submit"]');
    
    // Should show error message
    await expect(mockedPage.locator('[data-testid="error-message"], .error, text=Network error')).toBeVisible();
  });

  test('should redirect authenticated users with completed onboarding', async ({ mockedPage }) => {
    // Mock an already onboarded user
    const mockCompletedCoach = {
      ...MOCK_COACH_DATA,
      onboardingCompleted: true
    };

    await mockedPage.route('**/api/graphql', async (route) => {
      const postData = route.request().postData();
      if (postData?.includes('query Me')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: { me: mockCompletedCoach }
          })
        });
      }
    });

    // Try to access onboarding page
    await mockedPage.goto('/onboarding');
    
    // Should redirect to dashboard
    await expect(mockedPage).toHaveURL(/^\//);
  });
});