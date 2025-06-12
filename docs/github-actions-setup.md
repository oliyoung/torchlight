# GitHub Actions Setup for Playwright Tests

This document explains how to configure GitHub Actions to run Playwright tests for the wisegrowth project.

## Required GitHub Secrets

To run Playwright tests in GitHub Actions, you need to set up the following secrets in your GitHub repository:

### 1. Navigate to Repository Settings
1. Go to your GitHub repository
2. Click on **Settings** tab
3. In the left sidebar, click on **Secrets and variables** > **Actions**
4. Click **New repository secret** for each secret below

### 2. Required Secrets

#### Supabase Configuration
These are **required** for tests to work:

- **`NEXT_PUBLIC_SUPABASE_URL`**
  - Your Supabase project URL
  - Example: `https://your-project.supabase.co`
  - Found in: Supabase Dashboard > Settings > API

- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**
  - Your Supabase anonymous/public key
  - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
  - Found in: Supabase Dashboard > Settings > API

#### AI API Keys (Optional)
These are only needed if your tests use AI features:

- **`ANTHROPIC_API_KEY`**
  - Your Anthropic Claude API key
  - Example: `sk-ant-api03-...`
  - Get from: https://console.anthropic.com/

- **`OPENAI_API_KEY`**
  - Your OpenAI API key
  - Example: `sk-...`
  - Get from: https://platform.openai.com/api-keys

## Workflow Features

The Playwright GitHub Action includes:

### Basic Test Run (`test` job)
- Runs on every push and pull request
- Tests on Chromium browser
- Includes both authenticated and unauthenticated tests
- Uploads test reports and artifacts on failure

### Comprehensive Testing (`test-comprehensive` job)
- Runs only on pushes to `main` branch
- Tests both authenticated and unauthenticated flows separately
- Provides detailed coverage of different test scenarios

## Test User Management

The workflow automatically:
1. Creates a test user (`playwright.test@gmail.com`) in your Supabase project
2. Handles cases where the user already exists
3. Continues with tests even if user creation fails

## Artifacts and Reports

When tests fail, the workflow uploads:
- **Playwright HTML Report**: Complete test results with details
- **Test Results**: Raw test output and logs
- **Screenshots & Videos**: Visual evidence of test failures

Access artifacts by:
1. Go to the failed workflow run
2. Scroll down to **Artifacts** section
3. Download the relevant artifact

## Environment Configuration

The workflow sets up:
- Node.js 20 with npm caching
- All required Playwright browsers
- Next.js application build and startup
- Environment variables for testing

## Troubleshooting

### Tests Fail with "Missing Supabase URL"
- Check that `NEXT_PUBLIC_SUPABASE_URL` secret is set correctly
- Verify the URL format (should start with `https://`)

### Tests Fail with "Authentication Error"
- Check that `NEXT_PUBLIC_SUPABASE_ANON_KEY` secret is set correctly
- Verify the key has the correct permissions in Supabase

### Tests Fail with "Email not confirmed"
- Go to your Supabase Dashboard > Authentication > Settings
- Toggle **"Enable email confirmations"** to **OFF** for testing
- Or manually confirm the test user in Authentication > Users

### Workflow Times Out
- Check if your Supabase project is accessible from GitHub Actions
- Verify there are no network restrictions

## Manual Test User Setup

If you need to manually create the test user:

```bash
# In your local environment
node scripts/create-test-user.js
```

Or create manually in Supabase Dashboard:
1. Go to Authentication > Users
2. Create user with email: `playwright.test@gmail.com`
3. Set password: `TestPassword123!`
4. Confirm the email address

## Security Notes

- Never commit API keys or secrets to your repository
- Use GitHub Secrets for all sensitive configuration
- The test user has minimal permissions and is scoped to test data only
- Consider using a separate Supabase project for CI/CD testing

## Running Tests Locally

To run the same tests locally:

```bash
# Set up environment variables in .env
echo "TEST_COACH_EMAIL=playwright.test@gmail.com" >> .env
echo "TEST_COACH_PASSWORD=TestPassword123!" >> .env

# Create test user (if needed)
node scripts/create-test-user.js

# Run tests
npx playwright test
```