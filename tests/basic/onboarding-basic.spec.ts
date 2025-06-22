/**
 * Basic Playwright tests for the onboarding flow
 * These tests check the UI structure and basic interactions
 */

import { test, expect } from '@playwright/test';

// Basic test configuration
const TEST_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
};

test.describe('Onboarding Flow - Basic UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the authentication state to simulate a new user
    await page.addInitScript(() => {
      // Clear any existing auth
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should display onboarding page correctly', async ({ page }) => {
    await page.goto(`${TEST_CONFIG.baseUrl}/onboarding`);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Should see step 1 indicator
    await expect(page.locator('text=Step 1 of 2')).toBeVisible();
    
    // Should see welcome message
    await expect(page.locator('h1')).toContainText('Welcome to Torchlight!');
    
    // Should see role selection cards
    await expect(page.locator('text=Professional Coach')).toBeVisible();
    await expect(page.locator('text=Personal Coach')).toBeVisible();
    await expect(page.locator('text=Self-Coached')).toBeVisible();
    
    // Should see athlete limits in role cards
    await expect(page.locator('text=Unlimited')).toBeVisible();
    await expect(page.locator('text=Up to 3')).toBeVisible();
    await expect(page.locator('text=1 (yourself)')).toBeVisible();
  });

  test('should require role selection before enabling submit', async ({ page }) => {
    await page.goto(`${TEST_CONFIG.baseUrl}/onboarding`);
    await page.waitForLoadState('networkidle');
    
    // Submit button should be disabled initially
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
    
    // Fill in profile information without selecting role
    await page.fill('input[id="firstName"]', 'Test');
    await page.fill('input[id="lastName"]', 'User');
    
    // Submit button should still be disabled
    await expect(submitButton).toBeDisabled();
    
    // Select a role
    await page.click('.cursor-pointer:has-text("Professional Coach")');
    
    // Submit button should now be enabled
    await expect(submitButton).toBeEnabled();
  });

  test('should show role selection visual feedback', async ({ page }) => {
    await page.goto(`${TEST_CONFIG.baseUrl}/onboarding`);
    await page.waitForLoadState('networkidle');
    
    // Select Professional Coach role
    const professionalCard = page.locator('.cursor-pointer:has-text("Professional Coach")');
    await professionalCard.click();
    
    // Card should have selected styling (primary border)
    await expect(professionalCard).toHaveClass(/border-primary/);
  });

  test('should display athlete creation page with onboarding context', async ({ page }) => {
    // Navigate directly to athlete creation with onboarding parameter
    await page.goto(`${TEST_CONFIG.baseUrl}/athletes/new?onboarding=true`);
    await page.waitForLoadState('networkidle');
    
    // Should see step 2 indicator
    await expect(page.locator('text=Step 2 of 2')).toBeVisible();
    
    // Should see onboarding-specific title
    await expect(page.locator('h1')).toContainText('Add Your First Athlete');
    
    // Should see onboarding-specific description
    await expect(page.locator('text=Complete your onboarding')).toBeVisible();
    
    // Should see progress message
    await expect(page.locator('text=You\'re almost done!')).toBeVisible();
    
    // Should see onboarding breadcrumbs
    await expect(page.locator('text=Onboarding')).toBeVisible();
    
    // Button should show "Complete Setup" instead of "Create Athlete"
    await expect(page.locator('button[type="submit"]')).toContainText('Complete Setup');
  });

  test('should display different content for regular athlete creation', async ({ page }) => {
    // Navigate to regular athlete creation (no onboarding parameter)
    await page.goto(`${TEST_CONFIG.baseUrl}/athletes/new`);
    await page.waitForLoadState('networkidle');
    
    // Should NOT see step indicator
    await expect(page.locator('text=Step 2 of 2')).not.toBeVisible();
    
    // Should see regular title
    await expect(page.locator('h1')).toContainText('Add New Athlete');
    
    // Should NOT see onboarding-specific content
    await expect(page.locator('text=Complete your onboarding')).not.toBeVisible();
    await expect(page.locator('text=You\'re almost done!')).not.toBeVisible();
    
    // Should see regular breadcrumbs
    await expect(page.locator('text=Athletes')).toBeVisible();
    
    // Button should show "Create Athlete"
    await expect(page.locator('button[type="submit"]')).toContainText('Create Athlete');
  });

  test('should display correct role limits using constants', async ({ page }) => {
    await page.goto(`${TEST_CONFIG.baseUrl}/onboarding`);
    await page.waitForLoadState('networkidle');
    
    // Check Professional Coach card
    const professionalCard = page.locator('.cursor-pointer:has-text("Professional Coach")');
    await expect(professionalCard.locator('text=Unlimited')).toBeVisible();
    await expect(professionalCard.locator('text=Unlimited athletes')).toBeVisible();
    
    // Check Personal Coach card
    const personalCard = page.locator('.cursor-pointer:has-text("Personal Coach")');
    await expect(personalCard.locator('text=Up to 3')).toBeVisible();
    await expect(personalCard.locator('text=Up to 3 athletes')).toBeVisible();
    
    // Check Self-Coached card
    const selfCard = page.locator('.cursor-pointer:has-text("Self-Coached")');
    await expect(selfCard.locator('text=1 (yourself)')).toBeVisible();
  });

  test('should have correct form structure and labels', async ({ page }) => {
    await page.goto(`${TEST_CONFIG.baseUrl}/onboarding`);
    await page.waitForLoadState('networkidle');
    
    // Check form fields exist with proper labels
    await expect(page.locator('label:has-text("First Name")')).toBeVisible();
    await expect(page.locator('label:has-text("Last Name")')).toBeVisible();
    await expect(page.locator('label:has-text("Display Name")')).toBeVisible();
    
    // Check input fields exist
    await expect(page.locator('input[id="firstName"]')).toBeVisible();
    await expect(page.locator('input[id="lastName"]')).toBeVisible();
    await expect(page.locator('input[id="displayName"]')).toBeVisible();
    
    // Check sections exist
    await expect(page.locator('text=Select Your Coaching Mode')).toBeVisible();
    await expect(page.locator('text=Profile Information')).toBeVisible();
  });

  test('should have proper athlete form structure in onboarding mode', async ({ page }) => {
    await page.goto(`${TEST_CONFIG.baseUrl}/athletes/new?onboarding=true`);
    await page.waitForLoadState('networkidle');
    
    // Check required form fields exist
    await expect(page.locator('input[id="firstName"]')).toBeVisible();
    await expect(page.locator('input[id="lastName"]')).toBeVisible();
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="birthday"]')).toBeVisible();
    
    // Check sport selection exists
    await expect(page.locator('select[name="sport"], #sport')).toBeVisible();
    
    // Check optional fields exist
    await expect(page.locator('input[id="height"]')).toBeVisible();
    await expect(page.locator('input[id="weight"]')).toBeVisible();
    await expect(page.locator('input[id="emergencyContactName"]')).toBeVisible();
    await expect(page.locator('input[id="emergencyContactPhone"]')).toBeVisible();
  });

  test('should show correct button text changes', async ({ page }) => {
    await page.goto(`${TEST_CONFIG.baseUrl}/onboarding`);
    await page.waitForLoadState('networkidle');
    
    const submitButton = page.locator('button[type="submit"]');
    
    // Select role and fill form to enable button
    await page.click('.cursor-pointer:has-text("Professional Coach")');
    await page.fill('input[id="firstName"]', 'Test');
    await page.fill('input[id="lastName"]', 'User');
    
    // Should show "Next" text (updated from "Complete Setup")
    await expect(submitButton).toContainText('Next');
  });
});