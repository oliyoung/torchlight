import extractAndEvaluateGoalMutation from "../extractAndEvaluateGoal";
import { extractAndEvaluateGoal, type GoalEvaluationResponse } from "@/ai/features/extractAndEvaluateGoal";
import type { AiExtractAndEvaluateGoalInput } from "@/lib/types";

// Mock environment variables before any imports
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";

// Mock Supabase config module
jest.mock("@/lib/supabase/config", () => ({
  supabaseConfig: {
    url: "https://test.supabase.co",
    anonKey: "test-anon-key",
    serviceRoleKey: "test-service-role-key"
  }
}));

jest.mock("@/ai/features/extractAndEvaluateGoal");
jest.mock("@/lib/logger");

const mockExtractAndEvaluateGoal = extractAndEvaluateGoal as jest.MockedFunction<typeof extractAndEvaluateGoal>;

describe("extractAndEvaluateGoal GraphQL mutation", () => {
    const mockInput: AiExtractAndEvaluateGoalInput = {
        athleteId: "athlete-1",
        goalText: "I want to run a 10K in under 45 minutes by the end of the year"
    };

    const mockContext = {
        coachId: "coach-1"
    };

    const mockGoalEvaluationResponse: GoalEvaluationResponse = {
        coreGoal: {
            type: "Performance",
            primaryObjective: "Complete 10K run in under 45 minutes",
            sport: "Running",
            measurableOutcome: "10K completion time under 45:00"
        },
        goalEvaluation: {
            overallQualityScore: 8,
            specificityScore: 9,
            feasibilityScore: 7,
            relevanceScore: 8,
            timeStructureScore: 8,
            motivationScore: 7,
            evaluationSummary: {
                strengths: ["Clear time target", "Specific distance"],
                weaknesses: ["No training plan mentioned"],
                riskFactors: ["Potential overexertion"],
                improvementPriorities: ["Define training progression"]
            }
        },
        refinedGoalSuggestion: {
            improvedGoalStatement: "Complete a 10K run in under 45 minutes by December 31st, following a structured 12-week training program",
            keyChanges: ["Added specific end date", "Mentioned training structure"],
            rationale: "Adding timeline and training approach improves goal quality"
        },
        timeline: {
            targetDate: "2024-12-31",
            duration: "6 months",
            urgencyLevel: "MEDIUM_TERM",
            milestones: ["5K under 22:30", "8K completion", "10K under 50 minutes"]
        },
        motivation: {
            whyItMatters: "Personal achievement and fitness improvement",
            externalDrivers: ["Health goals"],
            emotionalContext: "Desire for personal accomplishment",
            supportSystem: ["Coach", "Running group"]
        },
        availability: {
            trainingTime: "Not specified",
            scheduleConstraints: [],
            location: null,
            equipment: ["Running shoes"],
            budget: null
        },
        constraints: {
            physicalLimitations: [],
            experienceLevel: "INTERMEDIATE",
            previousChallenges: [],
            riskFactors: ["Overtraining risk"]
        },
        successIndicators: {
            measurementMethods: ["GPS watch timing", "Official race results"],
            successDefinition: "Completing 10K in under 45 minutes",
            secondaryBenefits: ["Improved cardiovascular health"]
        },
        extractionConfidence: {
            overallConfidence: "HIGH",
            missingInformation: ["Current fitness level", "Training availability"],
            assumptions: ["Athlete is injury-free"],
            suggestedQuestions: ["How many days per week can you train?"]
        },
        coachingFeedback: {
            dataQuality: "GOOD",
            keyGapsIdentified: ["Training schedule", "Current performance baseline"],
            improvementSuggestions: ["Add specific training plan", "Include progress milestones"],
            riskFlags: ["Monitor for overtraining"],
            coachDevelopmentInsight: "Well-defined goal with clear measurable outcome"
        }
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockExtractAndEvaluateGoal.mockResolvedValue(mockGoalEvaluationResponse);
    });

    describe("successful execution", () => {
        it("should successfully call AI feature and return result", async () => {
            const result = await extractAndEvaluateGoalMutation(
                undefined,
                { input: mockInput },
                mockContext
            );

            expect(result).toEqual(mockGoalEvaluationResponse);
            expect(mockExtractAndEvaluateGoal).toHaveBeenCalledWith({
                athleteId: mockInput.athleteId,
                goalText: mockInput.goalText,
                userId: mockContext.coachId
            });
        });

        it("should pass through the correct parameters to AI feature", async () => {
            const customInput = {
                athleteId: "different-athlete",
                goalText: "Train for a marathon in 6 months"
            };
            const customContext = { coachId: "different-coach" };

            await extractAndEvaluateGoalMutation(
                undefined,
                { input: customInput },
                customContext
            );

            expect(mockExtractAndEvaluateGoal).toHaveBeenCalledWith({
                athleteId: customInput.athleteId,
                goalText: customInput.goalText,
                userId: customContext.coachId
            });
        });
    });

    describe("authentication validation", () => {
        it("should throw error when coach is not authenticated", async () => {
            const unauthenticatedContext = { coachId: null };

            await expect(
                extractAndEvaluateGoalMutation(
                    undefined,
                    { input: mockInput },
                    unauthenticatedContext
                )
            ).rejects.toThrow("Authentication required.");

            expect(mockExtractAndEvaluateGoal).not.toHaveBeenCalled();
        });

        it("should throw error when coachId is undefined", async () => {
            const undefinedContext = { coachId: undefined as any };

            await expect(
                extractAndEvaluateGoalMutation(
                    undefined,
                    { input: mockInput },
                    undefinedContext
                )
            ).rejects.toThrow("Authentication required.");

            expect(mockExtractAndEvaluateGoal).not.toHaveBeenCalled();
        });

        it("should throw error when coachId is empty string", async () => {
            const emptyContext = { coachId: "" };

            await expect(
                extractAndEvaluateGoalMutation(
                    undefined,
                    { input: mockInput },
                    emptyContext
                )
            ).rejects.toThrow("Authentication required.");

            expect(mockExtractAndEvaluateGoal).not.toHaveBeenCalled();
        });
    });

    describe("input validation", () => {
        it("should throw error when goalText is missing", async () => {
            const invalidInput = { ...mockInput, goalText: undefined as any };

            await expect(
                extractAndEvaluateGoalMutation(
                    undefined,
                    { input: invalidInput },
                    mockContext
                )
            ).rejects.toThrow("Goal text cannot be empty.");

            expect(mockExtractAndEvaluateGoal).not.toHaveBeenCalled();
        });

        it("should throw error when goalText is empty string", async () => {
            const invalidInput = { ...mockInput, goalText: "" };

            await expect(
                extractAndEvaluateGoalMutation(
                    undefined,
                    { input: invalidInput },
                    mockContext
                )
            ).rejects.toThrow("Goal text cannot be empty.");

            expect(mockExtractAndEvaluateGoal).not.toHaveBeenCalled();
        });

        it("should throw error when goalText is only whitespace", async () => {
            const invalidInput = { ...mockInput, goalText: "   \n\t  " };

            await expect(
                extractAndEvaluateGoalMutation(
                    undefined,
                    { input: invalidInput },
                    mockContext
                )
            ).rejects.toThrow("Goal text cannot be empty.");

            expect(mockExtractAndEvaluateGoal).not.toHaveBeenCalled();
        });

        it("should accept goalText with valid content surrounded by whitespace", async () => {
            const validInput = { ...mockInput, goalText: "  valid goal text  " };

            await extractAndEvaluateGoalMutation(
                undefined,
                { input: validInput },
                mockContext
            );

            expect(mockExtractAndEvaluateGoal).toHaveBeenCalledWith({
                athleteId: validInput.athleteId,
                goalText: validInput.goalText,
                userId: mockContext.coachId
            });
        });
    });

    describe("AI feature error handling", () => {
        it("should propagate errors from AI feature", async () => {
            const aiError = new Error("AI service unavailable");
            mockExtractAndEvaluateGoal.mockRejectedValue(aiError);

            await expect(
                extractAndEvaluateGoalMutation(
                    undefined,
                    { input: mockInput },
                    mockContext
                )
            ).rejects.toThrow("AI service unavailable");
        });

        it("should propagate athlete not found errors", async () => {
            const athleteError = new Error("Athlete not found");
            mockExtractAndEvaluateGoal.mockRejectedValue(athleteError);

            await expect(
                extractAndEvaluateGoalMutation(
                    undefined,
                    { input: mockInput },
                    mockContext
                )
            ).rejects.toThrow("Athlete not found");
        });

        it("should propagate validation errors from AI feature", async () => {
            const validationError = new Error("Goal text cannot be empty.");
            mockExtractAndEvaluateGoal.mockRejectedValue(validationError);

            await expect(
                extractAndEvaluateGoalMutation(
                    undefined,
                    { input: mockInput },
                    mockContext
                )
            ).rejects.toThrow("Goal text cannot be empty.");
        });
    });

    describe("edge cases", () => {
        it("should handle athleteId as empty string", async () => {
            const edgeCaseInput = { ...mockInput, athleteId: "" };

            await extractAndEvaluateGoalMutation(
                undefined,
                { input: edgeCaseInput },
                mockContext
            );

            expect(mockExtractAndEvaluateGoal).toHaveBeenCalledWith({
                athleteId: "",
                goalText: mockInput.goalText,
                userId: mockContext.coachId
            });
        });

        it("should handle very long goal text", async () => {
            const longGoalText = "I want to achieve ".repeat(100) + "my running goals";
            const longTextInput = { ...mockInput, goalText: longGoalText };

            await extractAndEvaluateGoalMutation(
                undefined,
                { input: longTextInput },
                mockContext
            );

            expect(mockExtractAndEvaluateGoal).toHaveBeenCalledWith({
                athleteId: mockInput.athleteId,
                goalText: longGoalText,
                userId: mockContext.coachId
            });
        });

        it("should handle special characters in goal text", async () => {
            const specialCharsText = "I want to run 10K in <45 minutes & achieve 90% effort! 🏃‍♂️";
            const specialInput = { ...mockInput, goalText: specialCharsText };

            await extractAndEvaluateGoalMutation(
                undefined,
                { input: specialInput },
                mockContext
            );

            expect(mockExtractAndEvaluateGoal).toHaveBeenCalledWith({
                athleteId: mockInput.athleteId,
                goalText: specialCharsText,
                userId: mockContext.coachId
            });
        });
    });

    describe("GraphQL resolver interface", () => {
        it("should accept undefined parent parameter", async () => {
            const result = await extractAndEvaluateGoalMutation(
                undefined,
                { input: mockInput },
                mockContext
            );

            expect(result).toEqual(mockGoalEvaluationResponse);
        });

        it("should accept null parent parameter", async () => {
            const result = await extractAndEvaluateGoalMutation(
                null,
                { input: mockInput },
                mockContext
            );

            expect(result).toEqual(mockGoalEvaluationResponse);
        });

        it("should handle parent parameter with any value", async () => {
            const result = await extractAndEvaluateGoalMutation(
                { someParentField: "value" },
                { input: mockInput },
                mockContext
            );

            expect(result).toEqual(mockGoalEvaluationResponse);
        });
    });

    describe("response structure", () => {
        it("should return the exact response from AI feature", async () => {
            const customResponse = {
                ...mockGoalEvaluationResponse,
                goalEvaluation: {
                    ...mockGoalEvaluationResponse.goalEvaluation,
                    overallQualityScore: 10
                }
            };
            mockExtractAndEvaluateGoal.mockResolvedValue(customResponse);

            const result = await extractAndEvaluateGoalMutation(
                undefined,
                { input: mockInput },
                mockContext
            );

            expect(result).toEqual(customResponse);
            expect(result.goalEvaluation.overallQualityScore).toBe(10);
        });

        it("should preserve all response fields from AI feature", async () => {
            const result = await extractAndEvaluateGoalMutation(
                undefined,
                { input: mockInput },
                mockContext
            );

            expect(result).toHaveProperty("coreGoal");
            expect(result).toHaveProperty("goalEvaluation");
            expect(result).toHaveProperty("refinedGoalSuggestion");
            expect(result).toHaveProperty("timeline");
            expect(result).toHaveProperty("motivation");
            expect(result).toHaveProperty("availability");
            expect(result).toHaveProperty("constraints");
            expect(result).toHaveProperty("successIndicators");
            expect(result).toHaveProperty("extractionConfidence");
            expect(result).toHaveProperty("coachingFeedback");
        });
    });
});