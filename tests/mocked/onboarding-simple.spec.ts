/**
 * Simplified Playwright tests for the onboarding flow
 */

import { test, expect } from '../fixtures';

test.describe('Onboarding Flow - Simplified', () => {
  test('should display onboarding page correctly', async ({ mockedPage }) => {
    await mockedPage.goto('/onboarding');
    
    // Should see step 1 indicator
    await expect(mockedPage.locator('text=Step 1 of 2')).toBeVisible();
    
    // Should see welcome message
    await expect(mockedPage.locator('h1')).toContainText('Welcome to Torchlight!');
    
    // Should see role selection cards
    await expect(mockedPage.locator('text=Professional Coach')).toBeVisible();
    await expect(mockedPage.locator('text=Personal Coach')).toBeVisible();
    await expect(mockedPage.locator('text=Self-Coached')).toBeVisible();
    
    // Should see athlete limits in role cards
    await expect(mockedPage.locator('text=Unlimited')).toBeVisible();
    await expect(mockedPage.locator('text=Up to 3')).toBeVisible();
    await expect(mockedPage.locator('text=1 (yourself)')).toBeVisible();
  });

  test('should require role selection before proceeding', async ({ mockedPage }) => {
    await mockedPage.goto('/onboarding');
    
    // Fill in profile information without selecting role
    await mockedPage.fill('input[id="firstName"]', 'Test');
    await mockedPage.fill('input[id="lastName"]', 'User');
    
    // Submit button should be disabled
    const submitButton = mockedPage.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
  });

  test('should enable submit button when role is selected', async ({ mockedPage }) => {
    await mockedPage.goto('/onboarding');
    
    // Submit button should be disabled initially
    const submitButton = mockedPage.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
    
    // Select a role
    await mockedPage.click('.cursor-pointer:has-text("Professional Coach")');
    
    // Fill required fields
    await mockedPage.fill('input[id="firstName"]', 'Test');
    await mockedPage.fill('input[id="lastName"]', 'User');
    
    // Submit button should now be enabled
    await expect(submitButton).toBeEnabled();
  });

  test('should show correct button text changes', async ({ mockedPage }) => {
    await mockedPage.goto('/onboarding');
    
    // Initially should show "Next" (updated button text)
    const submitButton = mockedPage.locator('button[type="submit"]');
    
    // Select role and fill form
    await mockedPage.click('.cursor-pointer:has-text("Professional Coach")');
    await mockedPage.fill('input[id="firstName"]', 'Test');
    await mockedPage.fill('input[id="lastName"]', 'User');
    
    // Should show "Next" text
    await expect(submitButton).toContainText('Next');
  });

  test('should display athlete creation page with onboarding context', async ({ mockedPage }) => {
    // Navigate directly to athlete creation with onboarding parameter
    await mockedPage.goto('/athletes/new?onboarding=true');
    
    // Should see step 2 indicator
    await expect(mockedPage.locator('text=Step 2 of 2')).toBeVisible();
    
    // Should see onboarding-specific title and description
    await expect(mockedPage.locator('h1')).toContainText('Add Your First Athlete');
    await expect(mockedPage.locator('text=Complete your onboarding')).toBeVisible();
    
    // Should see progress message
    await expect(mockedPage.locator('text=You\'re almost done!')).toBeVisible();
    
    // Should see onboarding breadcrumbs
    await expect(mockedPage.locator('text=Onboarding')).toBeVisible();
    await expect(mockedPage.locator('text=Add Athlete')).toBeVisible();
    
    // Button should show "Complete Setup" instead of "Create Athlete"
    await expect(mockedPage.locator('button[type="submit"]')).toContainText('Complete Setup');
  });

  test('should display different content for regular athlete creation', async ({ mockedPage }) => {
    // Navigate to regular athlete creation (no onboarding parameter)
    await mockedPage.goto('/athletes/new');
    
    // Should NOT see step indicator
    await expect(mockedPage.locator('text=Step 2 of 2')).not.toBeVisible();
    
    // Should see regular title
    await expect(mockedPage.locator('h1')).toContainText('Add New Athlete');
    
    // Should see regular breadcrumbs
    await expect(mockedPage.locator('text=Athletes')).toBeVisible();
    await expect(mockedPage.locator('text=New Athlete')).toBeVisible();
    
    // Button should show "Create Athlete"
    await expect(mockedPage.locator('button[type="submit"]')).toContainText('Create Athlete');
  });

  test('should validate required fields on athlete creation', async ({ mockedPage }) => {
    await mockedPage.goto('/athletes/new?onboarding=true');
    
    // Try to submit without required fields
    await mockedPage.click('button[type="submit"]');
    
    // Should see validation errors for required fields
    await expect(mockedPage.locator('text=First name is required')).toBeVisible();
    await expect(mockedPage.locator('text=Last name is required')).toBeVisible();
    await expect(mockedPage.locator('text=Sport is required')).toBeVisible();
    await expect(mockedPage.locator('text=Birthday is required')).toBeVisible();
  });

  test('should display correct role limits in cards', async ({ mockedPage }) => {
    await mockedPage.goto('/onboarding');
    
    // Check Professional Coach card
    const professionalCard = mockedPage.locator('.cursor-pointer:has-text("Professional Coach")');
    await expect(professionalCard.locator('text=Unlimited')).toBeVisible();
    await expect(professionalCard.locator('text=Unlimited athletes')).toBeVisible();
    
    // Check Personal Coach card
    const personalCard = mockedPage.locator('.cursor-pointer:has-text("Personal Coach")');
    await expect(personalCard.locator('text=Up to 3')).toBeVisible();
    await expect(personalCard.locator('text=Up to 3 athletes')).toBeVisible();
    
    // Check Self-Coached card
    const selfCard = mockedPage.locator('.cursor-pointer:has-text("Self-Coached")');
    await expect(selfCard.locator('text=1 (yourself)')).toBeVisible();
  });
});