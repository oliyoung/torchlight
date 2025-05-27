
import { trainingPlanRepository } from "@/lib/repository";
import { updateTrainingPlan } from "../updateTrainingPlan";

jest.mock("@/lib/repository");
jest.mock("@/lib/logger");

const mockContext = { user: { id: "user-1" } };
const mockInput = {
    title: "Updated Plan",
    overview: "Updated overview",
    assistantIds: ["assistant-1"],
    goalIds: ["goal-1", "goal-2"]
};
const mockExistingPlan = { id: "plan-1", title: "Old Plan" };
const mockUpdatedPlan = { id: "plan-1", ...mockInput };

describe("updateTrainingPlan", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (trainingPlanRepository.getTrainingPlanById as jest.Mock).mockResolvedValue(mockExistingPlan);
        (trainingPlanRepository.updateTrainingPlan as jest.Mock).mockResolvedValue(mockUpdatedPlan);
    });

    it("updates a training plan successfully", async () => {
        const result = await updateTrainingPlan(
            undefined,
            { id: mockExistingPlan.id, input: mockInput },
            mockContext as any
        );
        expect(trainingPlanRepository.getTrainingPlanById).toHaveBeenCalledWith(
            mockContext.user.id,
            mockExistingPlan.id
        );
        expect(trainingPlanRepository.updateTrainingPlan).toHaveBeenCalledWith(
            mockContext.user.id,
            mockExistingPlan.id,
            expect.objectContaining({
                title: mockInput.title,
                overview: mockInput.overview,
                assistantIds: mockInput.assistantIds,
                goalIds: mockInput.goalIds
            })
        );
        expect(result).toEqual(mockUpdatedPlan);
    });

    it("throws if the training plan is not found", async () => {
        (trainingPlanRepository.getTrainingPlanById as jest.Mock).mockResolvedValue(null);
        await expect(
            updateTrainingPlan(undefined, { id: mockExistingPlan.id, input: mockInput }, mockContext as any)
        ).rejects.toThrow(`Training plan with ID ${mockExistingPlan.id} not found`);
    });

    it("throws if the repository fails to update the plan", async () => {
        (trainingPlanRepository.updateTrainingPlan as jest.Mock).mockResolvedValue(null);
        await expect(
            updateTrainingPlan(undefined, { id: mockExistingPlan.id, input: mockInput }, mockContext as any)
        ).rejects.toThrow(`Failed to update training plan with ID ${mockExistingPlan.id}`);
    });
});