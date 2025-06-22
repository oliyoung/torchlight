/**
 * Basic Playwright tests for the onboarding flow
 * These tests check the UI structure and basic interactions
 */

import { test, expect } from '../fixtures';

test.describe('Onboarding Flow - Basic UI Tests', () => {
  // Remove the complex beforeEach hook and use the mocked fixtures instead

  test('should display onboarding page correctly', async ({ mockedPage }) => {
    await mockedPage.goto('/onboarding');
    
    // Wait for page to load
    await mockedPage.waitForLoadState('networkidle');
    
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

  test('should require role selection before enabling submit', async ({ mockedPage }) => {
    await mockedPage.goto('/onboarding');
    await mockedPage.waitForLoadState('networkidle');
    
    // Submit button should be disabled initially
    const submitButton = mockedPage.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
    
    // Fill in profile information without selecting role
    await mockedPage.fill('input[id="firstName"]', 'Test');
    await mockedPage.fill('input[id="lastName"]', 'User');
    
    // Submit button should still be disabled
    await expect(submitButton).toBeDisabled();
    
    // Select a role
    await mockedPage.click('.cursor-pointer:has-text("Professional Coach")');
    
    // Submit button should now be enabled
    await expect(submitButton).toBeEnabled();
  });

  test('should show role selection visual feedback', async ({ mockedPage }) => {
    await mockedPage.goto('/onboarding');
    await mockedPage.waitForLoadState('networkidle');
    
    // Select Professional Coach role
    const professionalCard = mockedPage.locator('.cursor-pointer:has-text("Professional Coach")');
    await professionalCard.click();
    
    // Card should have selected styling (primary border)
    await expect(professionalCard).toHaveClass(/border-primary/);
  });

  test('should display athlete creation page with onboarding context', async ({ mockedPage }) => {
    // Navigate directly to athlete creation with onboarding parameter
    await mockedPage.goto('/athletes/new?onboarding=true');
    await mockedPage.waitForLoadState('networkidle');
    
    // Should see step 2 indicator
    await expect(mockedPage.locator('text=Step 2 of 2')).toBeVisible();
    
    // Should see onboarding-specific title
    await expect(mockedPage.locator('h1')).toContainText('Add Your First Athlete');
    
    // Should see onboarding-specific description
    await expect(mockedPage.locator('text=Complete your onboarding')).toBeVisible();
    
    // Should see progress message
    await expect(mockedPage.locator('text=You\'re almost done!')).toBeVisible();
    
    // Should see onboarding breadcrumbs
    await expect(mockedPage.locator('text=Onboarding')).toBeVisible();
    
    // Button should show "Complete Setup" instead of "Create Athlete"
    await expect(mockedPage.locator('button[type="submit"]')).toContainText('Complete Setup');
  });

  test('should display different content for regular athlete creation', async ({ mockedPage }) => {
    // Navigate to regular athlete creation (no onboarding parameter)
    await mockedPage.goto('/athletes/new');
    await mockedPage.waitForLoadState('networkidle');
    
    // Should NOT see step indicator
    await expect(mockedPage.locator('text=Step 2 of 2')).not.toBeVisible();
    
    // Should see regular title
    await expect(mockedPage.locator('h1')).toContainText('Add New Athlete');
    
    // Should NOT see onboarding-specific content
    await expect(mockedPage.locator('text=Complete your onboarding')).not.toBeVisible();
    await expect(mockedPage.locator('text=You\'re almost done!')).not.toBeVisible();
    
    // Should see regular breadcrumbs
    await expect(mockedPage.locator('text=Athletes')).toBeVisible();
    
    // Button should show "Create Athlete"
    await expect(mockedPage.locator('button[type="submit"]')).toContainText('Create Athlete');
  });

  test('should display correct role limits using constants', async ({ mockedPage }) => {
    await mockedPage.goto('/onboarding');
    await mockedPage.waitForLoadState('networkidle');
    
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

  test('should have correct form structure and labels', async ({ mockedPage }) => {
    await mockedPage.goto('/onboarding');
    await mockedPage.waitForLoadState('networkidle');
    
    // Check form fields exist with proper labels
    await expect(mockedPage.locator('label:has-text("First Name")')).toBeVisible();
    await expect(mockedPage.locator('label:has-text("Last Name")')).toBeVisible();
    await expect(mockedPage.locator('label:has-text("Display Name")')).toBeVisible();
    
    // Check input fields exist
    await expect(mockedPage.locator('input[id="firstName"]')).toBeVisible();
    await expect(mockedPage.locator('input[id="lastName"]')).toBeVisible();
    await expect(mockedPage.locator('input[id="displayName"]')).toBeVisible();
    
    // Check sections exist
    await expect(mockedPage.locator('text=Select Your Coaching Mode')).toBeVisible();
    await expect(mockedPage.locator('text=Profile Information')).toBeVisible();
  });

  test('should have proper athlete form structure in onboarding mode', async ({ mockedPage }) => {
    await mockedPage.goto('/athletes/new?onboarding=true');
    await mockedPage.waitForLoadState('networkidle');
    
    // Check required form fields exist
    await expect(mockedPage.locator('input[id="firstName"]')).toBeVisible();
    await expect(mockedPage.locator('input[id="lastName"]')).toBeVisible();
    await expect(mockedPage.locator('input[id="email"]')).toBeVisible();
    await expect(mockedPage.locator('input[id="birthday"]')).toBeVisible();
    
    // Check sport selection exists
    await expect(mockedPage.locator('select[name="sport"], #sport')).toBeVisible();
    
    // Check optional fields exist
    await expect(mockedPage.locator('input[id="height"]')).toBeVisible();
    await expect(mockedPage.locator('input[id="weight"]')).toBeVisible();
    await expect(mockedPage.locator('input[id="emergencyContactName"]')).toBeVisible();
    await expect(mockedPage.locator('input[id="emergencyContactPhone"]')).toBeVisible();
  });

  test('should show correct button text changes', async ({ mockedPage }) => {
    await mockedPage.goto('/onboarding');
    await mockedPage.waitForLoadState('networkidle');
    
    const submitButton = mockedPage.locator('button[type="submit"]');
    
    // Select role and fill form to enable button
    await mockedPage.click('.cursor-pointer:has-text("Professional Coach")');
    await mockedPage.fill('input[id="firstName"]', 'Test');
    await mockedPage.fill('input[id="lastName"]', 'User');
    
    // Should show "Next" text (updated from "Complete Setup")
    await expect(submitButton).toContainText('Next');
  });
});