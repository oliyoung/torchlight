import { extractAndEvaluateGoal, type ExtractAndEvaluateGoalInput, type GoalEvaluationResponse } from "../extractAndEvaluateGoal";
import { loadAndProcessPrompt } from "../../lib/promptLoader";
import { callOpenAI } from "../../providers/openai";
import { athleteRepository } from "@/lib/repository";

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

jest.mock("../../lib/promptLoader");
jest.mock("../../providers/openai");
jest.mock("@/lib/repository");
jest.mock("@/lib/logger");

const mockLoadAndProcessPrompt = loadAndProcessPrompt as jest.MockedFunction<typeof loadAndProcessPrompt>;
const mockCallOpenAI = callOpenAI as jest.MockedFunction<typeof callOpenAI>;
const mockAthleteRepository = athleteRepository as jest.Mocked<typeof athleteRepository>;

describe("extractAndEvaluateGoal", () => {
    const mockInput: ExtractAndEvaluateGoalInput = {
        athleteId: "athlete-1",
        goalText: "I want to run a 10K in under 45 minutes by the end of the year",
        userId: "coach-1"
    };

    const mockAthlete = {
        id: "athlete-1",
        firstName: "John",
        lastName: "Doe",
        sport: "Running",
        birthday: "1995-05-15",
        trainingHistory: "2 years of recreational running",
        fitnessLevel: "Intermediate",
        gender: "Male",
        height: 175,
        weight: 70,
        coach: { id: "coach-1" },
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        trainingPlans: []
    };

    const mockPrompt = {
        model: "gpt-4o-mini",
        temperature: 0.3,
        systemMessage: "You are an expert coach",
        userMessage: "Evaluate this goal: I want to run a 10K in under 45 minutes"
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
        mockAthleteRepository.getAthleteById.mockResolvedValue(mockAthlete);
        mockLoadAndProcessPrompt.mockReturnValue(mockPrompt);
        mockCallOpenAI.mockResolvedValue(mockGoalEvaluationResponse);
    });

    describe("successful goal evaluation", () => {
        it("should successfully extract and evaluate a goal", async () => {
            const result = await extractAndEvaluateGoal(mockInput);

            expect(result).toEqual(mockGoalEvaluationResponse);
            expect(mockAthleteRepository.getAthleteById).toHaveBeenCalledWith("coach-1", "athlete-1");
            expect(mockLoadAndProcessPrompt).toHaveBeenCalledWith(
                "ai/prompts/goal_evaluation.prompt.yml",
                expect.objectContaining({
                    athleteName: "John Doe",
                    athleteAge: expect.any(String),
                    athleteSport: "Running",
                    goalText: mockInput.goalText
                })
            );
            expect(mockCallOpenAI).toHaveBeenCalledWith(
                mockPrompt.model,
                mockPrompt.temperature,
                mockPrompt.systemMessage,
                mockPrompt.userMessage,
                expect.any(Object) // Zod schema
            );
        });

        it("should calculate athlete age correctly", async () => {
            await extractAndEvaluateGoal(mockInput);

            const currentYear = new Date().getFullYear();
            const expectedAge = currentYear - 1995;

            expect(mockLoadAndProcessPrompt).toHaveBeenCalledWith(
                "ai/prompts/goal_evaluation.prompt.yml",
                expect.objectContaining({
                    athleteAge: expectedAge.toString()
                })
            );
        });

        it("should handle athlete with missing birthday", async () => {
            const athleteWithoutBirthday = { ...mockAthlete, birthday: null };
            mockAthleteRepository.getAthleteById.mockResolvedValue(athleteWithoutBirthday);

            await extractAndEvaluateGoal(mockInput);

            expect(mockLoadAndProcessPrompt).toHaveBeenCalledWith(
                "ai/prompts/goal_evaluation.prompt.yml",
                expect.objectContaining({
                    athleteAge: "25"
                })
            );
        });

        it("should handle athlete with missing optional fields", async () => {
            const minimalAthlete = {
                id: "athlete-1",
                firstName: "John",
                lastName: "Doe",
                sport: "Running",
                birthday: "1995-05-15",
                trainingHistory: null,
                fitnessLevel: null,
                gender: null,
                height: null,
                weight: null,
                coach: { id: "coach-1" },
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z",
                trainingPlans: []
            };
            mockAthleteRepository.getAthleteById.mockResolvedValue(minimalAthlete);

            await extractAndEvaluateGoal(mockInput);

            expect(mockLoadAndProcessPrompt).toHaveBeenCalledWith(
                "ai/prompts/goal_evaluation.prompt.yml",
                expect.objectContaining({
                    athleteExperience: "Not specified",
                    athleteFitnessLevel: "Not specified",
                    athleteGender: "Not specified",
                    athleteHeight: "Not specified",
                    athleteWeight: "Not specified"
                })
            );
        });
    });

    describe("input validation", () => {
        it("should throw error when userId is missing", async () => {
            const invalidInput = { ...mockInput, userId: "" };

            await expect(extractAndEvaluateGoal(invalidInput)).rejects.toThrow(
                "Authentication required for goal evaluation."
            );
        });

        it("should throw error when goalText is empty", async () => {
            const invalidInput = { ...mockInput, goalText: "" };

            await expect(extractAndEvaluateGoal(invalidInput)).rejects.toThrow(
                "Goal text cannot be empty."
            );
        });

        it("should throw error when goalText is only whitespace", async () => {
            const invalidInput = { ...mockInput, goalText: "   " };

            await expect(extractAndEvaluateGoal(invalidInput)).rejects.toThrow(
                "Goal text cannot be empty."
            );
        });
    });

    describe("athlete repository errors", () => {
        it("should throw error when athlete is not found", async () => {
            mockAthleteRepository.getAthleteById.mockResolvedValue(null);

            await expect(extractAndEvaluateGoal(mockInput)).rejects.toThrow(
                "Athlete not found"
            );
        });

        it("should throw error when athlete repository throws", async () => {
            const dbError = new Error("Database connection failed");
            mockAthleteRepository.getAthleteById.mockRejectedValue(dbError);

            await expect(extractAndEvaluateGoal(mockInput)).rejects.toThrow(
                "Database connection failed"
            );
        });
    });

    describe("AI provider errors", () => {
        it("should throw error when AI call fails", async () => {
            const aiError = new Error("AI service unavailable");
            mockCallOpenAI.mockRejectedValue(aiError);

            await expect(extractAndEvaluateGoal(mockInput)).rejects.toThrow(
                "AI service unavailable"
            );
        });

        it("should throw error when AI returns null", async () => {
            mockCallOpenAI.mockResolvedValue(null);

            await expect(extractAndEvaluateGoal(mockInput)).rejects.toThrow(
                "AI goal evaluation failed or returned unexpected format."
            );
        });

        it("should throw error when AI returns invalid format", async () => {
            mockCallOpenAI.mockResolvedValue("invalid response" as any);

            await expect(extractAndEvaluateGoal(mockInput)).rejects.toThrow(
                "AI goal evaluation failed or returned unexpected format."
            );
        });

        it("should throw error when AI response is missing required fields", async () => {
            const invalidResponse = {
                ...mockGoalEvaluationResponse,
                coreGoal: undefined
            };
            mockCallOpenAI.mockResolvedValue(invalidResponse as any);

            await expect(extractAndEvaluateGoal(mockInput)).rejects.toThrow(
                "Invalid goal evaluation response structure."
            );
        });
    });

    describe("prompt loading errors", () => {
        it("should propagate error when prompt loading fails", async () => {
            const promptError = new Error("Prompt file not found");
            mockLoadAndProcessPrompt.mockImplementation(() => {
                throw promptError;
            });

            await expect(extractAndEvaluateGoal(mockInput)).rejects.toThrow(
                "Prompt file not found"
            );
        });
    });

    describe("edge cases", () => {
        it("should handle very long goal text", async () => {
            const longGoalText = "I want to run ".repeat(1000) + "a marathon";
            const inputWithLongText = { ...mockInput, goalText: longGoalText };

            await extractAndEvaluateGoal(inputWithLongText);

            expect(mockCallOpenAI).toHaveBeenCalled();
        });

        it("should handle special characters in goal text", async () => {
            const specialGoalText = "I want to run 10K in <45 minutes & achieve 90% effort!";
            const inputWithSpecialChars = { ...mockInput, goalText: specialGoalText };

            await extractAndEvaluateGoal(inputWithSpecialChars);

            expect(mockLoadAndProcessPrompt).toHaveBeenCalledWith(
                "ai/prompts/goal_evaluation.prompt.yml",
                expect.objectContaining({
                    goalText: specialGoalText
                })
            );
        });
    });

    describe("response validation", () => {
        it("should accept response with all optional fields as null", async () => {
            const responseWithNulls = {
                ...mockGoalEvaluationResponse,
                coreGoal: {
                    ...mockGoalEvaluationResponse.coreGoal,
                    measurableOutcome: null
                },
                refinedGoalSuggestion: {
                    ...mockGoalEvaluationResponse.refinedGoalSuggestion,
                    improvedGoalStatement: null
                },
                timeline: {
                    ...mockGoalEvaluationResponse.timeline,
                    targetDate: null,
                    duration: null
                }
            };
            mockCallOpenAI.mockResolvedValue(responseWithNulls);

            const result = await extractAndEvaluateGoal(mockInput);

            expect(result).toEqual(responseWithNulls);
        });

        it("should validate enum values in response", async () => {
            const responseWithValidEnums = {
                ...mockGoalEvaluationResponse,
                timeline: {
                    ...mockGoalEvaluationResponse.timeline,
                    urgencyLevel: "IMMEDIATE" as const
                },
                constraints: {
                    ...mockGoalEvaluationResponse.constraints,
                    experienceLevel: "BEGINNER" as const
                },
                extractionConfidence: {
                    ...mockGoalEvaluationResponse.extractionConfidence,
                    overallConfidence: "LOW" as const
                },
                coachingFeedback: {
                    ...mockGoalEvaluationResponse.coachingFeedback,
                    dataQuality: "INSUFFICIENT" as const
                }
            };
            mockCallOpenAI.mockResolvedValue(responseWithValidEnums);

            const result = await extractAndEvaluateGoal(mockInput);

            expect(result).toEqual(responseWithValidEnums);
        });
    });
});