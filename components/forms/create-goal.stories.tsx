import type { Meta, StoryObj } from "@storybook/react";
import { fn } from 'storybook/test';
import { CreateGoalForm } from "./create-goal";
import { Client, Provider } from "urql";
import { mockClient } from "@/lib/test-utils/mock-urql-client";
import { CoachRoleProvider } from "@/lib/contexts/coach-role-context";
import { CoachRole, type Coach } from "@/lib/types";

// Mock GraphQL responses
const mockEvaluationResponse = {
  extractAndEvaluateGoal: {
    coreGoal: {
      title: "Improve 100m Sprint Time to Under 12 Seconds",
      type: "Performance Goal",
      primaryObjective: "Reduce 100m sprint time from current 12.5s to under 12.0s",
      sport: "Track and Field",
      measurableOutcome: "Sub-12 second 100m sprint time"
    },
    goalEvaluation: {
      overallQualityScore: 8,
      specificityScore: 9,
      feasibilityScore: 7,
      relevanceScore: 9,
      timeStructureScore: 6,
      motivationScore: 8,
      evaluationSummary: {
        strengths: [
          "Specific and measurable target time",
          "Clear performance metric",
          "Sport-relevant objective"
        ],
        weaknesses: [
          "No specified timeline for achievement",
          "Missing current baseline context",
          "No intermediate milestones defined"
        ],
        riskFactors: [
          "Aggressive time improvement target",
          "Potential for overtraining"
        ],
        improvementPriorities: [
          "Add specific timeline",
          "Include current performance baseline",
          "Define intermediate milestones"
        ]
      }
    },
    refinedGoalSuggestion: {
      improvedGoalStatement: "Improve 100m sprint time from current 12.5s to under 12.0s within 6 months through structured speed training, with interim targets of 12.3s at 2 months and 12.1s at 4 months.",
      keyChanges: [
        "Added specific timeline (6 months)",
        "Included current baseline (12.5s)",
        "Added intermediate milestones"
      ],
      rationale: "Adding timeline and milestones makes the goal more structured and achievable while maintaining the ambitious target."
    },
    extractionConfidence: {
      overallConfidence: "HIGH",
      missingInformation: [
        "Current training frequency",
        "Previous injury history"
      ],
      assumptions: [
        "Athlete is currently healthy",
        "Regular training access available"
      ],
      suggestedQuestions: [
        "What is your current weekly training schedule?",
        "Have you had any recent injuries?"
      ]
    },
    coachingFeedback: {
      dataQuality: "GOOD",
      keyGapsIdentified: [
        "Timeline specification",
        "Training context"
      ],
      improvementSuggestions: [
        "Add timeline for goal achievement",
        "Include training frequency details"
      ],
      riskFlags: [
        "Aggressive improvement target"
      ],
      coachDevelopmentInsight: "Goal shows good specificity but would benefit from timeline structure and risk mitigation planning."
    }
  }
};

const mockAthletes = {
  athletes: [
    {
      id: "1",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com"
    },
    {
      id: "2",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com"
    }
  ]
};

const mockCreateGoalResponse = {
  createGoal: {
    id: "goal-123",
    title: "Improve 100m Sprint Time to Under 12 Seconds"
  }
};

// Mock coach for CoachRoleProvider
const mockCoach: Coach = {
  id: "coach-1",
  userId: "user-123",
  email: "coach@example.com",
  firstName: "John",
  lastName: "Coach",
  displayName: "John Coach",
  avatar: null,
  timezone: "UTC",
  role: CoachRole.Personal,
  onboardingCompleted: true,
  lastLoginAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
  billing: null,
  athletes: [],
  trainingPlans: []
};

// Create mock client with responses
const createMockClient = () => {
  return mockClient([
    {
      query: /athletes/,
      response: mockAthletes
    },
    {
      query: /extractAndEvaluateGoal/,
      response: mockEvaluationResponse
    },
    {
      query: /createGoal/,
      response: mockCreateGoalResponse
    }
  ]);
};

const meta: Meta<typeof CreateGoalForm> = {
  title: "Forms/CreateGoalForm",
  component: CreateGoalForm,
  tags: ['autodocs'],
  args: {
    athleteId: mockAthletes.athletes[0].id // Default to first athlete
  },
  parameters: {
    layout: "padded",
    actions: { argTypesRegex: '^on.*' },
    docs: {
      description: {
        component: "A comprehensive form for creating goals with AI-powered evaluation and validation."
      }
    }
  },
  decorators: [
    (Story) => (
      <Provider value={createMockClient()}>
        <CoachRoleProvider coach={mockCoach} isLoading={false}>
          <Story />
        </CoachRoleProvider>
      </Provider>
    ),
  ],
  argTypes: {
    athleteId: {
      description: "ID of the athlete for whom the goal is being created",
      control: "text"
    },
    onSuccess: {
      description: "Callback function called when goal is successfully created",
      action: "onSuccess"
    },
    onCancel: {
      description: "Callback function called when user cancels goal creation",
      action: "onCancel"
    }
  }
};

export default meta;
type Story = StoryObj<typeof CreateGoalForm>;

export const Default: Story = {
  name: "Default Form",
  parameters: {
    docs: {
      description: {
        story: "The default create goal form with all standard functionality."
      }
    }
  }
};


// Story for testing error states
export const ErrorHandling: Story = {
  name: "Error Handling",
  decorators: [
    (Story) => {
      // Create a mock client that returns errors
      const errorClient = mockClient([
        {
          query: /athletes/,
          response: mockAthletes
        },
        {
          query: /extractAndEvaluateGoal/,
          error: new Error("AI service temporarily unavailable")
        },
        {
          query: /createGoal/,
          error: new Error("Failed to create goal")
        }
      ]);

      return (
        <Provider value={errorClient}>
          <CoachRoleProvider coach={mockCoach} isLoading={false}>
            <div className="max-w-2xl mx-auto p-4">
              <Story />
            </div>
          </CoachRoleProvider>
        </Provider>
      );
    },
  ],
  parameters: {
    docs: {
      description: {
        story: "Demonstrates error handling when AI evaluation or goal creation fails."
      }
    }
  }
};
