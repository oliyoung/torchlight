/**
 * Mock GraphQL responses for Playwright tests
 * Provides realistic test data without requiring a real backend
 */

import type { Page, Route } from '@playwright/test';
import { MOCK_USER } from './auth';

// Mock Athletes
export const MOCK_ATHLETES = [
  {
    id: 'athlete-1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@example.com',
    sport: 'Tennis',
    birthday: '1995-03-15',
    tags: ['beginner', 'enthusiastic'],
    notes: 'New player, very motivated to improve',
    userId: MOCK_USER.id,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    deletedAt: null
  },
  {
    id: 'athlete-2',
    firstName: 'Mike',
    lastName: 'Chen',
    email: 'mike.chen@example.com',
    sport: 'Basketball',
    birthday: '1992-08-22',
    tags: ['intermediate', 'competitive'],
    notes: 'Former college player, working on comeback',
    userId: MOCK_USER.id,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    deletedAt: null
  }
];

// Mock Goals
export const MOCK_GOALS = [
  {
    id: 'goal-1',
    title: 'Improve serve accuracy',
    description: 'Achieve 80% first serve accuracy in matches',
    status: 'ACTIVE',
    sport: 'Tennis',
    dueDate: '2024-06-01T00:00:00Z',
    progressNotes: 'Making steady progress, up to 65% accuracy',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    deletedAt: null,
    athlete: MOCK_ATHLETES[0]
  },
  {
    id: 'goal-2',
    title: 'Increase vertical jump',
    description: 'Add 4 inches to vertical jump height',
    status: 'ACTIVE',
    sport: 'Basketball',
    dueDate: '2024-05-01T00:00:00Z',
    progressNotes: 'Started strength training program',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
    deletedAt: null,
    athlete: MOCK_ATHLETES[1]
  }
];

// Mock Session Logs
export const MOCK_SESSION_LOGS = [
  {
    id: 'session-1',
    date: '2024-01-15T10:00:00Z',
    notes: 'Worked on serve technique and footwork',
    transcript: 'Coach: Let\'s focus on your serve today...',
    summary: 'Good session focusing on serve mechanics',
    actionItems: ['Practice serve 30 minutes daily', 'Work on toss consistency'],
    athlete: MOCK_ATHLETES[0],
    goals: [MOCK_GOALS[0]],
    aiMetadata: {
      summaryGenerated: true,
      nextStepsGenerated: true
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T11:00:00Z',
    deletedAt: null
  }
];

// Mock Assistants
export const MOCK_ASSISTANTS = [
  {
    id: 'assistant-1',
    name: 'Tennis Pro Coach',
    bio: 'Expert tennis coach with 15 years of experience',
    sport: 'Tennis',
    role: 'Technical Coach',
    strengths: ['Serve mechanics', 'Footwork', 'Mental game'],
    promptTemplate: 'You are an expert tennis coach...',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    deletedAt: null
  },
  {
    id: 'assistant-2',
    name: 'Basketball Skills Coach',
    bio: 'Former professional player turned coach',
    sport: 'Basketball',
    role: 'Skills Coach',
    strengths: ['Shooting', 'Ball handling', 'Conditioning'],
    promptTemplate: 'You are an expert basketball coach...',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    deletedAt: null
  }
];

// Mock Training Plans
export const MOCK_TRAINING_PLANS = [
  {
    id: 'plan-1',
    overview: '4-week serve improvement program',
    status: 'GENERATED',
    startDate: '2024-01-01',
    endDate: '2024-01-28',
    notes: 'Focus on technical improvements',
    planJson: {
      weeks: [
        {
          week: 1,
          focus: 'Basic mechanics',
          sessions: ['Grip work', 'Toss practice', 'Follow through']
        }
      ]
    },
    sourcePrompt: 'Create a serve improvement plan',
    generatedBy: 'assistant-1',
    athlete: MOCK_ATHLETES[0],
    goals: [MOCK_GOALS[0]],
    assistants: [MOCK_ASSISTANTS[0]],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

/**
 * Mock GraphQL API responses
 */
export async function mockGraphQLAPI(page: Page) {
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

    console.log('🔍 GraphQL Mock intercepted query:', query.substring(0, 100) + '...');

    // Route different GraphQL operations based on query content
    if (query.includes('athletes')) {
      console.log('📊 Returning mock athletes data');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { athletes: MOCK_ATHLETES }
        })
      });
    } else if (query.includes('goals')) {
      console.log('🎯 Returning mock goals data');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { goals: MOCK_GOALS }
        })
      });
    } else if (query.includes('sessionLogs')) {
      console.log('📝 Returning mock session logs data');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { sessionLogs: MOCK_SESSION_LOGS }
        })
      });
    } else if (query.includes('assistants')) {
      console.log('🤖 Returning mock assistants data');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { assistants: MOCK_ASSISTANTS }
        })
      });
    } else if (query.includes('trainingPlans')) {
      console.log('📋 Returning mock training plans data');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { trainingPlans: MOCK_TRAINING_PLANS }
        })
      });
    } else if (query.includes('mutation')) {
      console.log('✏️  Returning mock mutation response');
      // Mock successful mutations
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            success: true,
            message: 'Mock mutation successful'
          }
        })
      });
    } else {
      console.log('❓ Unknown query, returning empty data');
      // Default successful response for any other queries
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {}
        })
      });
    }
  });
}

/**
 * Setup all mocks for a page (auth + GraphQL)
 */
export async function setupAllMocks(page: Page, baseUrl = 'http://localhost:3000') {
  const { injectMockAuth, mockSupabaseAuth } = await import('./auth');

  // Setup auth mocks
  await injectMockAuth(page, baseUrl);
  await mockSupabaseAuth(page);

  // Setup GraphQL mocks
  await mockGraphQLAPI(page);
}