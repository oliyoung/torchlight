# Playwright E2E Testing with API Authentication

This directory contains end-to-end tests for the congenial-carnival coaching platform using Playwright with API-based authentication.

## Setup

### 1. Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Supabase Configuration (required)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# App URL (optional, defaults to localhost:3000)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Test User Credentials (required for authentication)
TEST_COACH_EMAIL=testcoach@example.com
TEST_COACH_PASSWORD=testpassword123
```

### 2. Create Test User

Before running tests, create a test user account:

```bash
# Option 1: Use the signup script
node scripts/signup-user.js testcoach@example.com testpassword123

# Option 2: Use the comprehensive test script
node scripts/test-auth.js signup testcoach@example.com testpassword123
```

### 3. Install Playwright Browsers

```bash
npm run playwright:install
```

## Running Tests

### All Tests
```bash
npm run test:e2e
```

### Specific Browser
```bash
npx playwright test --project=chromium-authenticated
```

### UI Mode (Interactive)
```bash
npm run test:e2e:ui
```

### Debug Mode
```bash
npm run test:e2e:debug
```

### Headed Mode (Visible Browser)
```bash
npm run test:e2e:headed
```

## Test Structure

### Authentication Setup
- `auth.setup.ts` - Sets up authentication using Supabase API calls
- `fixtures.ts` - Provides authenticated page objects and helper functions

### Test Categories

#### Authenticated Tests (`/authenticated/`)
- Tests that require a logged-in coach user
- Use the `coachPage` fixture for authenticated interactions
- Examples: athlete management, goal tracking, session logs

#### Unauthenticated Tests (`/unauthenticated/` or `/login/`)
- Tests for public pages and login flows
- Use clean browser state without authentication

### Project Configuration

The Playwright config includes several projects:

- **setup** - Runs authentication setup before all tests
- **chromium-authenticated** - Authenticated tests in Chrome
- **firefox-authenticated** - Authenticated tests in Firefox
- **webkit-authenticated** - Authenticated tests in Safari
- **chromium-unauthenticated** - Clean browser for login/public page tests
- **mobile-chrome-authenticated** - Mobile viewport tests
- **mobile-safari-authenticated** - Mobile Safari tests

## Writing Tests

### Using the Coach Page Object

```typescript
import { test, expect } from '../fixtures';

test('should manage athletes', async ({ coachPage }) => {
  // Navigate to athletes page
  await coachPage.goToAthletes();

  // Make GraphQL requests
  const result = await coachPage.makeGraphQLRequest(`
    query {
      athletes {
        id
        name
      }
    }
  `);

  // Check authentication state
  const isAuth = await coachPage.isAuthenticated();
  expect(isAuth).toBe(true);
});
```

### Using Authenticated Page Directly

```typescript
import { test, expect } from '../fixtures';

test('should load dashboard', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/dashboard');
  await expect(authenticatedPage).toHaveTitle(/Dashboard/);
});
```

### GraphQL Testing

The `coachPage.makeGraphQLRequest()` method automatically includes authentication headers:

```typescript
const result = await coachPage.makeGraphQLRequest(`
  mutation CreateAthlete($input: CreateAthleteInput!) {
    createAthlete(input: $input) {
      id
      name
      sport
    }
  }
`, {
  input: {
    name: "Test Athlete",
    sport: "Tennis"
  }
});
```

## Authentication Flow

1. **Setup Phase**: The `auth.setup.ts` file runs before all tests
2. **API Authentication**: Uses Supabase client to authenticate via API calls
3. **Browser State**: Injects authentication tokens into browser localStorage
4. **State Persistence**: Saves authenticated state to `playwright/.auth/coach.json`
5. **Test Execution**: All authenticated tests reuse the saved state

## Benefits of API Authentication

- **Fast**: No UI interactions needed for login
- **Reliable**: No form filling or button clicking
- **Consistent**: Same authentication method as your app uses
- **Maintainable**: Changes to login UI don't break authentication setup

## Debugging

### View Authentication State
```bash
# Check if test user exists and can authenticate
node scripts/get-auth-token.js testcoach@example.com testpassword123
```

### View Test Reports
```bash
npm run test:e2e:report
```

### Enable Debug Logging
Set `DEBUG=pw:api` environment variable to see detailed Playwright API calls.

## Troubleshooting

### Authentication Fails
1. Verify environment variables are set correctly
2. Ensure test user exists in Supabase
3. Check that Supabase URL and keys are valid
4. Verify the app is running on the correct URL

### Tests Can't Find Elements
1. Update selectors in test files to match your app's UI
2. Check if authentication state is properly set
3. Verify the app recognizes the authentication tokens

### GraphQL Requests Fail
1. Ensure GraphQL endpoint is accessible
2. Check that authentication tokens are valid
3. Verify GraphQL schema matches the queries in tests

## File Structure

```
tests/
├── auth.setup.ts           # Authentication setup
├── fixtures.ts             # Custom fixtures and page objects
├── authenticated/          # Tests requiring authentication
│   └── athletes.spec.ts    # Example authenticated tests
├── unauthenticated/        # Tests for public pages
└── README.md              # This file

playwright/.auth/           # Authentication state files (gitignored)
└── coach.json             # Saved authentication state
```