import { TrainingPlan, AiTrainingPlanContent } from "@/lib/types";

/**
 * Placeholder function to simulate calling an AI model to generate training plan content.
 * In a real implementation, this would use an AI SDK (e.g., MCP) to interact with an LLM.
 */
export const generateContentWithAI = async (prompt: string): Promise<Partial<TrainingPlan> | null> => {
    console.log("Simulating AI call with prompt:", prompt);

    // TODO: Replace with actual AI call using MCP SDK
    // For now, simulate a delay and return mock content that conforms to the new type
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockContent: Partial<TrainingPlan> = {
        planJson: {
            planOverview: {
                title: "Mock Training Plan",
                durationWeeks: 4,
                sessionsPerWeek: 3,
                equipment: ["Gym", "Track"],
                primaryGoals: ["Endurance"],
                secondaryGoals: ["Strength"],
                intensityGuidelines: "Moderate to High"
            },
            weeklyStructure: [
                {
                    week: 1,
                    focus: "Base Building",
                    sessions: [
                        { type: "Run", focusArea: "Endurance", templateRef: "run-template" },
                        { type: "Strength", focusArea: "Full Body", templateRef: "strength-template" },
                        { type: "Run", focusArea: "Intervals", templateRef: "interval-template" },
                    ]
                }
                // Add more weeks as needed for mock data
            ],
            sessionTemplates: [
                {
                    templateRef: "run-template",
                    structure: {
                        warmup: "5 min jog, dynamic stretches",
                        mainBlock: "30 min easy run",
                        supplementary: "",
                        cooldown: "5 min walk, static stretches"
                    }
                },
                {
                    templateRef: "strength-template",
                    structure: {
                        warmup: "10 min cardio, dynamic stretches",
                        mainBlock: "Squats, Push-ups, Rows (3x10)",
                        supplementary: "Plank (3x30s)",
                        cooldown: "5 min stretching"
                    }
                },
                {
                    templateRef: "interval-template",
                    structure: {
                        warmup: "10 min easy jog, dynamic stretches",
                        mainBlock: "6 x 800m at goal pace with 400m recovery",
                        supplementary: "",
                        cooldown: "10 min easy jog, static stretches"
                    }
                }
                // Add more templates as needed
            ],
            progressionGuidelines: "Increase volume by 10% weekly, increase intensity every 2 weeks.",
            tracking: {
                keyMetrics: ["Distance", "Time", "Heart Rate", "RPE"],
                warningSigns: ["Persistent fatigue", "Pain", "Lack of motivation"],
                adjustmentCriteria: "Adjust if RPE is too high or too low, or if feeling excessive soreness."
            }
        },
        overview: "This is a mock AI-generated overview based on the prompt.",
    };

    return mockContent;
};