# Playwright Tests - Mocked Authentication Setup 🎭

## Overview

All Playwright tests now use **mocked authentication and API responses**. No live Supabase authentication or database connections are required. This makes tests fast, reliable, and completely isolated.

## What Changed

### ✅ Removed Live Authentication
- **Before**: Tests used real Supabase authentication with live API calls
- **Now**: Tests use completely mocked authentication and GraphQL responses
- **Benefits**: Faster tests, no external dependencies, no test data pollution

### ✅ All Tests Are Mocked
- Authentication state is simulated using fake tokens
- GraphQL responses are mocked with realistic data
- No actual API calls or database connections
- Tests run in complete isolation

## Test Structure

```
tests/
├── fixtures.ts                    # Test utilities and mocked auth setup
├── basic/                         # Basic UI tests (no complex mocks)
│   └── onboarding-basic.spec.ts  # Onboarding UI structure tests
├── mocked/                        # All tests use mocked data
│   ├── athletes.spec.ts          # Athlete management with mock data
│   ├── onboarding.spec.ts        # Full onboarding flow with mocks
│   └── onboarding-simple.spec.ts # Simplified onboarding tests
├── mocks/                         # Mock implementations
│   ├── auth.ts                   # Fake authentication responses
│   └── graphql.ts                # Mock GraphQL responses
└── unauthenticated/               # Public tests (login flow, etc.)
```

## Running Tests

```bash
# Run all mocked tests (default)
npx playwright test
yarn test:e2e

# Run mocked tests with UI
npx playwright test --ui
yarn test:e2e:ui

# Run mocked tests in headed mode
npx playwright test --headed
yarn test:e2e:headed

# Run onboarding tests specifically
yarn test:e2e:onboarding              # Basic onboarding UI tests
yarn test:e2e:onboarding:headed       # Onboarding tests in headed mode
yarn test:e2e:onboarding:debug        # Onboarding tests with debug mode
yarn test:e2e:onboarding:mocked       # Onboarding tests with mocked API

# Run only mocked tests explicitly
npx playwright test --config=playwright.mocked.config.ts

# Run unauthenticated tests
npx playwright test tests/unauthenticated/
```

## Test Configuration

### Main Config (`playwright.config.ts`)
- Uses mocked authentication by default
- No external dependencies required
- Fast and reliable

### Mocked Config (`playwright.mocked.config.ts`)
- Explicit configuration for mocked tests
- Multiple browser support
- All API responses are faked

## How Mocked Authentication Works

### 1. Fake Auth Tokens
```typescript
// Tests receive mock JWT tokens
const mockToken = 'mock-auth-token';
```

### 2. Simulated User State
```typescript
// Mock user data is injected into localStorage
{
  authenticated: true,
  userEmail: 'test@example.com',
  userId: 'mock-user-id',
  role: 'coach'
}
```

### 3. GraphQL Response Mocking
```typescript
// All GraphQL queries return predefined mock data
{
  athletes: [
    { id: '1', firstName: 'John', lastName: 'Doe', sport: 'Running' },
    // ... more mock athletes
  ]
}
```

## Mock Data

All tests use realistic but fake data:

- **Athletes**: Pre-defined mock athletes with various sports and details
- **Goals**: Sample coaching goals linked to mock athletes
- **Sessions**: Mock session logs with notes and transcripts
- **Training Plans**: Example plans with structured data
- **Assistants**: Mock AI coaching assistants

## Benefits of Mocked Tests

### ✅ Speed
- No network calls or database queries
- Tests run in milliseconds, not seconds
- Parallel execution without conflicts

### ✅ Reliability
- No external service dependencies
- No flaky network issues
- Consistent test data every time

### ✅ Isolation
- Each test runs with fresh, predictable data
- No test pollution or cleanup required
- Tests can run in any order

### ✅ Development
- No need to set up test databases
- No authentication credentials required
- Works immediately on any machine

## Environment Requirements

**None!** The mocked tests require:
- ❌ No Supabase credentials
- ❌ No test database setup
- ❌ No authentication configuration
- ✅ Just `npm run dev` and `npx playwright test`

## Key Features Tested

### Authentication (Mocked)
- ✅ Simulated login state
- ✅ Fake JWT tokens
- ✅ Mock user sessions
- ✅ Auth state persistence

### Navigation
- ✅ Page routing and navigation
- ✅ Authenticated page access
- ✅ UI component rendering

### GraphQL Integration
- ✅ Mock query responses
- ✅ Realistic data structures
- ✅ Error handling
- ✅ Loading states

### Core Functionality
- ✅ Athlete management UI
- ✅ Goal tracking interfaces
- ✅ Session log displays
- ✅ Training plan views
- ✅ Two-step onboarding flow
- ✅ Coach role selection and validation
- ✅ Athlete creation in onboarding context

## Onboarding Tests

The onboarding tests cover the complete two-step flow for new users:

### Test Coverage
- **Step 1**: Coach profile creation with role selection (Professional, Personal, Self-Coached)
- **Step 2**: First athlete creation with onboarding context
- **UI/UX**: Progress indicators, role-based limits, validation, redirects
- **Integration**: End-to-end flow testing with mocked API responses

### Running Onboarding Tests

**Prerequisites**: Ensure development server is running (`yarn dev`)

```bash
# Basic UI tests (recommended for development)
yarn test:e2e:onboarding

# Visual debugging with browser window
yarn test:e2e:onboarding:headed

# Step-through debugging
yarn test:e2e:onboarding:debug

# Full mock integration tests
yarn test:e2e:onboarding:mocked
```

**VS Code Integration**: Use Command Palette (`Ctrl+Shift+P`) → "Tasks: Run Task" → Select onboarding test option.

### What's Tested
- Role selection cards show correct athlete limits from constants
- Form validation for required fields
- Progress indicators ("Step 1 of 2", "Step 2 of 2")
- Different UI context for onboarding vs regular athlete creation
- Button text changes ("Next" → "Complete Setup")
- Breadcrumb navigation differences
- Error handling and validation messages

## Adding New Tests

### 1. Create Test File
```typescript
// tests/mocked/new-feature.spec.ts
import { test, expect } from '../fixtures';

test.describe('New Feature', () => {
  test('should work with mocked data', async ({ mockedCoachPage }) => {
    await mockedCoachPage.goToAthletes();
    // Test uses automatic mocked responses
  });
});
```

### 2. Add Mock Data (if needed)
```typescript
// tests/mocks/graphql.ts
// Add new mock responses for your feature
```

### 3. Run Tests
```bash
npx playwright test tests/mocked/new-feature.spec.ts
```

## Troubleshooting

### Tests Not Finding Mock Data
- Ensure mock setup is called in fixtures
- Check that GraphQL responses are properly mocked
- Verify mock data structure matches schema

### UI Elements Not Found
- Check component rendering with mocked data
- Verify selectors are correct
- Ensure mock data triggers expected UI states

### Authentication Issues
- All auth is mocked - no real credentials needed
- Check that mock auth state is being injected
- Verify localStorage mock setup

## Migration from Live Tests

If you had live authentication tests before:
- ❌ No more `auth.setup.ts` file
- ❌ No more real Supabase credentials
- ❌ No more `playwright/.auth/` directory
- ✅ Everything now uses mocks automatically

## Need Help?

The mocked test setup should work immediately without any configuration. If you encounter issues:

1. Ensure your app is running (`npm run dev`)
2. Check that mock files are properly imported
3. Verify test selectors match your UI components
4. Look at existing working tests for examples

**Remember**: All authentication and API calls are fake - this is the intended behavior for fast, reliable testing!