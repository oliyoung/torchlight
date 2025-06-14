import { createTrainingPlan } from "../createTrainingPlan";
import { trainingPlanRepository, athleteRepository, goalRepository } from "@/lib/repository";
import { generateTrainingPlanContent } from "@/ai/features/generateTrainingPlan";
import { TrainingPlanDifficulty } from "@/lib/types";

jest.mock("@/lib/repository");
jest.mock("@/ai/features/generateTrainingPlan");
jest.mock("@/lib/logger");

const mockContext = { coachId: "user-1", pubsub: {} };
const mockInput = {
    athleteId: "athlete-1",
    goalIds: ["goal-1", "goal-2"],
    assistantIds: ["assistant-1"],
    difficulty: TrainingPlanDifficulty.Beginner
};
const mockAthlete = { id: "athlete-1" };
const mockGoals = [{ id: "goal-1" }, { id: "goal-2" }];
const mockTrainingPlan = { id: "plan-1", ...mockInput };

describe("createTrainingPlan", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (trainingPlanRepository.createTrainingPlan as jest.Mock).mockResolvedValue(mockTrainingPlan);
        (athleteRepository.getAthleteById as jest.Mock).mockResolvedValue(mockAthlete);
        (goalRepository.getGoalsByIds as jest.Mock).mockResolvedValue(mockGoals);
        (generateTrainingPlanContent as jest.Mock).mockResolvedValue(undefined);
    });

    it("creates a training plan and triggers async generation", async () => {
        const result = await createTrainingPlan(
            undefined,
            { input: mockInput },
            mockContext as any
        );
        expect(trainingPlanRepository.createTrainingPlan).toHaveBeenCalled();
        expect(athleteRepository.getAthleteById).toHaveBeenCalled();
        expect(goalRepository.getGoalsByIds).toHaveBeenCalled();
        expect(generateTrainingPlanContent).toHaveBeenCalledWith(
            mockTrainingPlan.id,
            mockContext.coachId,
            mockInput.assistantIds,
            mockAthlete,
            mockGoals,
            mockContext.pubsub
        );
        expect(result).toEqual(mockTrainingPlan);
    });

    it("throws if training plan creation fails", async () => {
        (trainingPlanRepository.createTrainingPlan as jest.Mock).mockResolvedValue(null);
        await expect(
            createTrainingPlan(undefined, { input: mockInput }, mockContext as any)
        ).rejects.toThrow("Failed to create training plan");
    });

    it("logs error if athlete or goals are missing but still proceeds", async () => {
        (athleteRepository.getAthleteById as jest.Mock).mockResolvedValue(null);
        (goalRepository.getGoalsByIds as jest.Mock).mockResolvedValue([mockGoals[0]]);
        const consoleSpy = jest.spyOn(console, "error").mockImplementation();
        const result = await createTrainingPlan(
            undefined,
            { input: mockInput },
            mockContext as any
        );
        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining("Failed to fetch athlete"),
        );
        expect(result).toEqual(mockTrainingPlan);
        consoleSpy.mockRestore();
    });
});