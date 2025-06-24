import type { Meta, StoryObj } from "@storybook/react";
import { GoalEvaluationDisplay } from "./goal-evaluation-display";
import { ConfidenceLevel, DataQuality } from "@/lib/types";
import { GoalEvaluationResponse } from "@/ai/features/extractAndEvaluateGoal";


// Mock evaluation data for different scenarios
const excellentGoalEvaluation: Partial<GoalEvaluationResponse> = {
  coreGoal: {
    title: "Improve 100m Sprint Time to Under 12 Seconds",
    type: "Performance Goal",
    primaryObjective: "Reduce 100m sprint time from current 12.5s to under 12.0s",
    sport: "Track and Field",
    measurableOutcome: "Sub-12 second 100m sprint time"
  },
  goalEvaluation: {
    overallQualityScore: 9,
    specificityScore: 10,
    feasibilityScore: 8,
    relevanceScore: 9,
    timeStructureScore: 7,
    motivationScore: 8,
    evaluationSummary: {
      strengths: [
        "Specific and measurable target time",
        "Clear performance metric",
        "Sport-relevant objective",
        "Achievable improvement range"
      ],
      weaknesses: [
        "Could benefit from timeline specification",
        "Missing intermediate milestones"
      ],
      riskFactors: [
        "Aggressive time improvement target"
      ],
      improvementPriorities: [
        "Add specific timeline",
        "Include intermediate milestones"
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
    overallConfidence: "HIGH" as const,
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
    dataQuality: "GOOD" as const,
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
  },
};

const poorGoalEvaluation: Partial<GoalEvaluationResponse> = {
  coreGoal: {
    title: "Get Better at Basketball",
    type: "General Improvement",
    primaryObjective: "Improve basketball skills",
    sport: "Basketball",
    measurableOutcome: null
  },
  goalEvaluation: {
    overallQualityScore: 3,
    specificityScore: 2,
    feasibilityScore: 5,
    relevanceScore: 6,
    timeStructureScore: 1,
    motivationScore: 4,
    evaluationSummary: {
      strengths: [
        "Sport-specific focus"
      ],
      weaknesses: [
        "Lacks specific measurable outcomes",
        "No timeline provided",
        "Vague improvement areas",
        "No baseline established",
        "Missing success criteria"
      ],
      riskFactors: [
        "Goal too vague to track progress",
        "Lack of motivation without clear targets"
      ],
      improvementPriorities: [
        "Define specific skills to improve",
        "Add measurable outcomes",
        "Establish timeline",
        "Set baseline measurements"
      ]
    }
  },
  refinedGoalSuggestion: {
    improvedGoalStatement: "Improve free throw shooting accuracy from current 65% to 80% within 3 months through daily practice sessions, with monthly assessments to track progress.",
    keyChanges: [
      "Added specific skill focus (free throw shooting)",
      "Included measurable target (65% to 80%)",
      "Added timeline (3 months)",
      "Included practice structure"
    ],
    rationale: "Focusing on a specific, measurable skill provides clear direction and trackable progress, making the goal much more actionable."
  },
  extractionConfidence: {
    overallConfidence: "LOW" as const,
    missingInformation: [
      "Specific skills to improve",
      "Current skill levels",
      "Training availability",
      "Timeline preferences"
    ],
    assumptions: [
      "General basketball improvement desired",
      "Regular practice possible"
    ],
    suggestedQuestions: [
      "Which specific basketball skills do you want to improve?",
      "What are your current performance levels?",
      "How much time can you dedicate to practice?"
    ]
  },
  coachingFeedback: {
    dataQuality: "INSUFFICIENT" as const,
    keyGapsIdentified: [
      "Lack of specificity",
      "No measurable outcomes",
      "Missing timeline"
    ],
    improvementSuggestions: [
      "Work with athlete to identify specific skills",
      "Establish baseline measurements",
      "Create structured improvement plan"
    ],
    riskFlags: [
      "Goal too vague for effective coaching",
      "High risk of loss of motivation"
    ],
    coachDevelopmentInsight: "This goal requires significant refinement. Focus on helping the athlete identify specific, measurable areas for improvement."
  }
};

const averageGoalEvaluation: Partial<GoalEvaluationResponse> = {
  coreGoal: {
    title: "Increase Bench Press to 200 lbs",
    type: "Strength Goal",
    primaryObjective: "Increase bench press from current weight to 200 lbs",
    sport: "Weightlifting",
    measurableOutcome: "200 lb bench press"
  },
  goalEvaluation: {
    overallQualityScore: 6,
    specificityScore: 8,
    feasibilityScore: 6,
    relevanceScore: 7,
    timeStructureScore: 3,
    motivationScore: 7,
    evaluationSummary: {
      strengths: [
        "Specific weight target",
        "Clear measurable outcome",
        "Relevant to strength training"
      ],
      weaknesses: [
        "No timeline specified",
        "Missing current baseline",
        "No progression plan mentioned"
      ],
      riskFactors: [
        "Potential for injury without proper progression",
        "Unknown current baseline"
      ],
      improvementPriorities: [
        "Add realistic timeline",
        "Include current bench press weight",
        "Define progression strategy"
      ]
    }
  },
  refinedGoalSuggestion: {
    improvedGoalStatement: null,
    keyChanges: [],
    rationale: "Goal has good specificity but needs timeline and progression structure to be fully effective."
  },
  extractionConfidence: {
    overallConfidence: ConfidenceLevel.Medium,
    missingInformation: [
      "Current bench press weight",
      "Training experience level",
      "Timeline preferences"
    ],
    assumptions: [
      "Some weightlifting experience",
      "Access to proper equipment"
    ],
    suggestedQuestions: [
      "What is your current bench press max?",
      "What timeline are you aiming for?",
      "What is your weightlifting experience level?"
    ]
  },
  coachingFeedback: {
    dataQuality: DataQuality.Limited,
    keyGapsIdentified: [
      "Missing baseline data",
      "No timeline structure"
    ],
    improvementSuggestions: [
      "Assess current strength levels",
      "Create progressive loading plan"
    ],
    riskFlags: [
      "Need to assess injury risk"
    ],
    coachDevelopmentInsight: "Solid foundation but requires baseline assessment and structured progression planning."
  }
}

const meta: Meta<typeof GoalEvaluationDisplay> = {
  title: "Components/UI/GoalEvaluationDisplay",
  component: GoalEvaluationDisplay,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "Displays AI-generated goal evaluation with quality scores, suggestions, and feedback."
      }
    }
  },
  argTypes: {
    evaluation: {
      description: "Goal evaluation data from AI analysis",
      control: false
    },
    className: {
      description: "Additional CSS classes",
      control: "text"
    },
    showExtendedInfo: {
      description: "Show extended information including confidence, coaching feedback, etc.",
      control: "boolean"
    }
  }
};

export default meta;
type Story = StoryObj<typeof GoalEvaluationDisplay>;

export const ExcellentGoal: Story = {
  name: "Excellent Goal (Score: 9/10)",
  args: {
    evaluation: excellentGoalEvaluation
  },
  parameters: {
    docs: {
      description: {
        story: "Example of a high-quality goal with excellent specificity and clear measurable outcomes. Shows minimal weaknesses and good AI confidence."
      }
    }
  }
};

export const PoorGoal: Story = {
  name: "Poor Goal (Score: 3/10)",
  args: {
    evaluation: poorGoalEvaluation
  },
  parameters: {
    docs: {
      description: {
        story: "Example of a low-quality goal that lacks specificity and measurable outcomes. Shows many areas for improvement and low AI confidence."
      }
    }
  }
};

export const AverageGoal: Story = {
  name: "Average Goal (Score: 6/10)",
  args: {
    evaluation: averageGoalEvaluation
  },
  parameters: {
    docs: {
      description: {
        story: "Example of a moderate-quality goal with good specificity but missing timeline and progression structure."
      }
    }
  }
};

export const WithExtendedInfo: Story = {
  name: "Extended Information View",
  args: {
    evaluation: excellentGoalEvaluation,
    showExtendedInfo: true
  },
  parameters: {
    docs: {
      description: {
        story: "Shows all available information including confidence levels, coaching feedback, risk factors, and additional scores."
      }
    }
  }
};

export const WithoutSuggestion: Story = {
  name: "No AI Suggestion",
  args: {
    evaluation: averageGoalEvaluation
  },
  parameters: {
    docs: {
      description: {
        story: "Example where AI doesn't provide an improved goal statement, showing how the component handles missing suggestions."
      }
    }
  }
};

export const CustomStyling: Story = {
  name: "Custom Styling",
  args: {
    evaluation: excellentGoalEvaluation,
    className: "border-2 border-blue-200 shadow-lg"
  },
  parameters: {
    docs: {
      description: {
        story: "Demonstrates custom styling capabilities using the className prop."
      }
    }
  }
};

// Interactive story for testing different score ranges
export const ScoreVisualization: Story = {
  name: "Score Color Coding",
  render: () => {
    const createMockEvaluation = (scores: number[]) => ({
      ...excellentGoalEvaluation,
      goalEvaluation: {
        ...excellentGoalEvaluation.goalEvaluation,
        overallQualityScore: scores[0],
        specificityScore: scores[1],
        feasibilityScore: scores[2],
        relevanceScore: scores[3]
      }
    });

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Score Color Coding Examples</h3>
        <div className="grid gap-4">
          <div>
            <h4 className="font-medium text-green-600 mb-2">High Scores (8-10) - Green</h4>
            <GoalEvaluationDisplay evaluation={createMockEvaluation([9, 10, 8, 9])} />
          </div>
          <div>
            <h4 className="font-medium text-yellow-600 mb-2">Medium Scores (6-7) - Yellow</h4>
            <GoalEvaluationDisplay evaluation={createMockEvaluation([6, 7, 6, 7])} />
          </div>
          <div>
            <h4 className="font-medium text-red-600 mb-2">Low Scores (1-5) - Red</h4>
            <GoalEvaluationDisplay evaluation={createMockEvaluation([3, 2, 4, 5])} />
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Demonstrates the color coding system for different score ranges: green (8-10), yellow (6-7), red (1-5)."
      }
    }
  }
};