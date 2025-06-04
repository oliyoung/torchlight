import { test, expect, type Page } from '@playwright/test';

// Mock authentication setup
async function setupMockAuth(page: Page) {
  await page.addInitScript(() => {
    // Mock authentication state
    localStorage.setItem('playwright-auth', JSON.stringify({
      authenticated: true,
      userEmail: 'mock.coach@test.com',
      userId: 'mock-user-id',
      role: 'coach'
    }));
  });
}

// Mock GraphQL responses for athlete creation
async function setupGraphQLMocks(page: Page) {
  await page.route('**/api/graphql', async (route) => {
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

    try {
      const requestBody = JSON.parse(postData);
      const { query, variables } = requestBody;

      // Handle createAthlete mutation
      if (query.includes('createAthlete')) {
        const input = variables?.input;

        // Simulate network error
        if (input?.firstName === 'NetworkError') {
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({
              errors: [{ message: 'Network error occurred' }]
            })
          });
          return;
        }

        // Simulate duplicate email
        if (input?.email === 'duplicate@example.com') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              errors: [{ message: 'An athlete with this email already exists' }]
            })
          });
          return;
        }

        // Successful creation
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              createAthlete: {
                id: `athlete-${Date.now()}`,
                firstName: input.firstName,
                lastName: input.lastName,
                email: input.email,
                sport: input.sport,
                birthday: input.birthday || null,
                tags: input.tags || [],
                notes: input.notes || ''
              }
            }
          })
        });
      } else {
        // Handle other queries
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: {} })
        });
      }
    } catch (error) {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ errors: [{ message: 'Internal server error' }] })
      });
    }
  });
}

test.describe('Athlete Creation (Mocked)', () => {
  test.beforeEach(async ({ page }) => {
    // Setup mocks
    await setupMockAuth(page);
    await setupGraphQLMocks(page);

    // Navigate to the form
    await page.goto('/athletes/new');
    await page.waitForLoadState('networkidle');
  });

  test('should display the new athlete form with all required fields', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText('Add New Athlete');

    // Check all form fields are present
    await expect(page.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.locator('input[name="lastName"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="birthday"]')).toBeVisible();
    await expect(page.locator('input[name="tags"]')).toBeVisible();
    await expect(page.locator('textarea[name="notes"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Check initial button text
    await expect(page.locator('button[type="submit"]')).toContainText('Create Athlete');
  });

  test('should successfully create an athlete with valid data', async ({ page }) => {
    // Fill out the form with valid data
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', 'john.doe@example.com');
    await page.fill('input[name="birthday"]', '1995-06-15');
    await page.fill('input[name="tags"]', 'basketball, varsity, senior');
    await page.fill('textarea[name="notes"]', 'Excellent player with great potential');

    // Select sport using the SportSelect component
    const sportButton = page.locator('button:has-text("Primary Sport")');
    await sportButton.click();

    // Wait for dropdown and select Basketball
    await page.locator('[role="option"]:has-text("Basketball")').click();

    // Submit the form
    await page.click('button[type="submit"]');

    // Check for success message in SuccessMessage component
    await expect(page.locator('[role="alert"]:has-text("Athlete created successfully!")').or(page.locator('text="Athlete created successfully!"'))).toBeVisible({ timeout: 10000 });

    // Verify form is reset after success
    await expect(page.locator('input[name="firstName"]')).toHaveValue('');
    await expect(page.locator('input[name="lastName"]')).toHaveValue('');
    await expect(page.locator('input[name="email"]')).toHaveValue('');
  });

  test('should show validation error for empty first name', async ({ page }) => {
    // Fill only some fields, leaving firstName empty
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', 'john.doe@example.com');

    // Try to submit
    await page.click('button[type="submit"]');

    // Check for client-side validation error in span with text-destructive class
    await expect(page.locator('.text-destructive:has-text("First name is required")')).toBeVisible({ timeout: 5000 });
  });

  test('should show validation error for empty last name', async ({ page }) => {
    // Fill only some fields, leaving lastName empty
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="email"]', 'john.doe@example.com');

    // Try to submit
    await page.click('button[type="submit"]');

    // Check for validation error
    await expect(page.locator('.text-destructive:has-text("Last name is required")')).toBeVisible({ timeout: 5000 });
  });

  test('should show validation error for empty email', async ({ page }) => {
    // Fill only some fields, leaving email empty
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');

    // Try to submit
    await page.click('button[type="submit"]');

    // Check for validation error
    await expect(page.locator('.text-destructive:has-text("Email is required")')).toBeVisible({ timeout: 5000 });
  });

  test('should show validation error for invalid email format', async ({ page }) => {
    // Fill with invalid email
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', 'invalid-email');

    // Try to submit
    await page.click('button[type="submit"]');

    // Check for validation error
    await expect(page.locator('.text-destructive:has-text("Invalid email address")')).toBeVisible({ timeout: 5000 });
  });

  test('should show validation error for empty sport', async ({ page }) => {
    // Fill all required fields except sport
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', 'john.doe@example.com');

    // Try to submit without selecting sport
    await page.click('button[type="submit"]');

    // Check for validation error - sport error might be in the SportSelect component
    await expect(page.locator('.text-destructive:has-text("Sport is required")').or(page.locator('text="Sport is required"'))).toBeVisible({ timeout: 5000 });
  });

  test('should handle multiple validation errors simultaneously', async ({ page }) => {
    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Check that multiple validation errors are shown
    await expect(page.locator('.text-destructive:has-text("First name is required")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.text-destructive:has-text("Last name is required")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.text-destructive:has-text("Email is required")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.text-destructive:has-text("Sport is required")').or(page.locator('text="Sport is required"'))).toBeVisible({ timeout: 5000 });
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Fill form with data that triggers network error
    await page.fill('input[name="firstName"]', 'NetworkError');
    await page.fill('input[name="lastName"]', 'Test');
    await page.fill('input[name="email"]', 'test@example.com');

    // Select sport
    const sportButton = page.locator('button:has-text("Primary Sport")');
    await sportButton.click();
    await page.locator('[role="option"]:has-text("Basketball")').click();

    // Submit form
    await page.click('button[type="submit"]');

    // Check for error message from ErrorMessage component
    await expect(page.locator('[role="alert"]:has-text("Network error occurred")').or(page.locator('text="Network error occurred"'))).toBeVisible({ timeout: 5000 });

    // Verify form data is preserved after error
    await expect(page.locator('input[name="firstName"]')).toHaveValue('NetworkError');
    await expect(page.locator('input[name="lastName"]')).toHaveValue('Test');
    await expect(page.locator('input[name="email"]')).toHaveValue('test@example.com');
  });

  test('should handle duplicate email error', async ({ page }) => {
    // Fill form with duplicate email
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Duplicate');
    await page.fill('input[name="email"]', 'duplicate@example.com');

    // Select sport
    const sportButton = page.locator('button:has-text("Primary Sport")');
    await sportButton.click();
    await page.locator('[role="option"]:has-text("Basketball")').click();

    // Submit form
    await page.click('button[type="submit"]');

    // Check for duplicate email error from ErrorMessage component
    await expect(page.locator('[role="alert"]:has-text("An athlete with this email already exists")').or(page.locator('text="An athlete with this email already exists"'))).toBeVisible({ timeout: 5000 });
  });

  test('should handle edge case inputs correctly', async ({ page }) => {
    // Test with edge case inputs
    await page.fill('input[name="firstName"]', 'A'); // Single character
    await page.fill('input[name="lastName"]', 'Very-Long-Hyphenated-Last-Name-With-Multiple-Parts');
    await page.fill('input[name="email"]', 'test+tag@sub.domain.example.com'); // Complex email
    await page.fill('input[name="birthday"]', '1900-01-01'); // Very old date
    await page.fill('input[name="tags"]', '   spaced,  tags  ,   with   whitespace   '); // Tags with extra spaces
    await page.fill('textarea[name="notes"]', 'Notes with special characters: @#$%^&*()_+{}|:"<>?[]\\;\',./ and émojis 🏀⚽🎾');

    // Select sport
    const sportButton = page.locator('button:has-text("Primary Sport")');
    await sportButton.click();
    await page.locator('[role="option"]:has-text("Basketball")').click();

    // Submit form
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page.locator('[role="alert"]:has-text("Athlete created successfully!")').or(page.locator('text="Athlete created successfully!"'))).toBeVisible({ timeout: 10000 });
  });

  test('should validate email format with various invalid formats', async ({ page }) => {
    const invalidEmails = [
      'plainaddress',
      '@missingdomain.com',
      'missing@.com',
      'missing@domain'
    ];

    for (const email of invalidEmails) {
      // Fill form with invalid email
      await page.fill('input[name="firstName"]', 'Test');
      await page.fill('input[name="lastName"]', 'User');
      await page.fill('input[name="email"]', email);

      // Submit and expect validation error
      await page.click('button[type="submit"]');
      await expect(page.locator('.text-destructive:has-text("Invalid email address")')).toBeVisible({ timeout: 5000 });

      // Clear form for next iteration
      await page.fill('input[name="firstName"]', '');
      await page.fill('input[name="lastName"]', '');
      await page.fill('input[name="email"]', '');
    }
  });

  test('should handle tags parsing correctly', async ({ page }) => {
    // Test tags with various formats
    await page.fill('input[name="firstName"]', 'Tag');
    await page.fill('input[name="lastName"]', 'Test');
    await page.fill('input[name="email"]', 'tag.test@example.com');
    await page.fill('input[name="tags"]', 'basketball,   varsity,senior , captain  ,  '); // Mixed spacing and trailing comma

    // Select sport
    const sportButton = page.locator('button:has-text("Primary Sport")');
    await sportButton.click();
    await page.locator('[role="option"]:has-text("Basketball")').click();

    await page.click('button[type="submit"]');

    // Should handle the tags correctly and succeed
    await expect(page.locator('[role="alert"]:has-text("Athlete created successfully!")').or(page.locator('text="Athlete created successfully!"'))).toBeVisible({ timeout: 10000 });
  });

  test('should maintain form accessibility', async ({ page }) => {
    // Check that all form inputs have proper labels
    const firstNameInput = page.locator('input[name="firstName"]');
    const lastNameInput = page.locator('input[name="lastName"]');
    const emailInput = page.locator('input[name="email"]');

    // Verify inputs are properly labeled
    await expect(page.locator('label[for="firstName"], label:has-text("First Name")')).toBeVisible();
    await expect(page.locator('label[for="lastName"], label:has-text("Last Name")')).toBeVisible();
    await expect(page.locator('label[for="email"], label:has-text("Email")')).toBeVisible();

    // Check keyboard navigation
    await firstNameInput.focus();
    await page.keyboard.press('Tab');
    await expect(lastNameInput).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(emailInput).toBeFocused();
  });
});