import { test, expect } from '@playwright/test';

test.describe('Login and Public Pages (Unauthenticated)', () => {

  test('should display login page', async ({ page }) => {
    await page.goto('/login');

    // Should be on the login page
    await expect(page).toHaveURL(/.*\/login/);

    // Should contain login form elements
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /password/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in|login|log in/i })).toBeVisible();
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Try to access a protected page without authentication
    await page.goto('/athletes');

    // Should redirect to login page
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should show error for invalid login', async ({ page }) => {
    await page.goto('/login');

    // Fill in invalid credentials
    await page.getByRole('textbox', { name: /email/i }).fill('invalid@example.com');
    await page.getByRole('textbox', { name: /password/i }).fill('wrongpassword');

    // Submit the form
    await page.getByRole('button', { name: /sign in|login|log in/i }).click();

    // Should show error message
    await expect(page.getByText(/invalid|error|incorrect/i)).toBeVisible();
  });

  test('should be able to navigate to signup from login', async ({ page }) => {
    await page.goto('/login');

    // Look for signup link
    const signupLink = page.getByRole('link', { name: /sign up|register|create account/i });

    if (await signupLink.isVisible()) {
      await signupLink.click();
      // Should navigate to signup page or show signup form
      await expect(page).toHaveURL(/.*\/(signup|register)/);
    } else {
      test.skip(true, 'No visible signup link found on login page');
    }
  });

  test('should allow successful login with valid credentials', async ({ page }) => {
    const testEmail = process.env.TEST_COACH_EMAIL || 'testcoach@example.com';
    const testPassword = process.env.TEST_COACH_PASSWORD || 'testpassword123';

    await page.goto('/login');

    // Fill in valid credentials
    await page.getByRole('textbox', { name: /email/i }).fill(testEmail);
    await page.getByRole('textbox', { name: /password/i }).fill(testPassword);

    // Submit the form
    await page.getByRole('button', { name: /sign in|login|log in/i }).click();

    // Should redirect to authenticated area (like dashboard or athletes page)
    await expect(page).toHaveURL(/.*\/(athletes|dashboard|home)/);

    // Should not be on login page anymore
    await expect(page).not.toHaveURL(/.*\/login/);
  });
});

test.describe('Public Pages', () => {

  test('should load home page without authentication', async ({ page }) => {
    await page.goto('/');

    // Home page should load successfully
    await expect(page).toHaveTitle(/coaching|coach|congenial/i);
  });

  // Add more public page tests as needed
  test('should handle 404 pages gracefully', async ({ page }) => {
    await page.goto('/non-existent-page');

    // Should show 404 page or redirect appropriately
    const is404 = page.url().includes('404') || await page.getByText(/not found|404/i).isVisible();
    expect(is404).toBeTruthy();
  });
});