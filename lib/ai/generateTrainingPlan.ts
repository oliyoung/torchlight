import type { JSON } from "@/lib/types";

export const generateMockTrainingPlan = (
    clientId: string,
    assistantIds: string[],
    goalIds: string[],
): { overview: string; planJson: JSON } => {
    console.log("Generating mock training plan for:", { clientId, assistantIds, goalIds });

    // Basic mock logic
    const overview = `Mock training plan generated for client ${clientId} based on goals ${goalIds.join(", ")} and assistants ${assistantIds.join(", ")}.`;

    const planJson: JSON = {
        title: "Sample Training Plan",
        sections: [
            {
                title: "Week 1",
                days: [
                    {
                        day: "Monday",
                        focus: "Strength",
                        exercises: [
                            { name: "Squats", sets: 3, reps: 10 },
                            { name: "Bench Press", sets: 3, reps: 10 },
                        ],
                    },
                    {
                        day: "Wednesday",
                        focus: "Cardio",
                        exercises: [
                            { name: "Running", duration: "30 min", intensity: "moderate" },
                        ],
                    },
                ],
            },
            {
                title: "Week 2",
                days: [
                    {
                        day: "Monday",
                        focus: "Strength",
                        exercises: [
                            { name: "Deadlifts", sets: 3, reps: 8 },
                            { name: "Overhead Press", sets: 3, reps: 8 },
                        ],
                    },
                    {
                        day: "Thursday",
                        focus: "Flexibility",
                        exercises: [
                            { name: "Yoga", duration: "45 min" },
                        ],
                    },
                ]
            }
        ],
        notes: "This is a mock plan. Adjust as needed.",
    };

    return { overview, planJson };
};