import { z } from "zod";

export const sessionPlanSchema = z.object({
    sessionPlan: z.object({
        title: z.string(),
        focusArea: z.string(),
        targetGoalIds: z.array(z.string()), // Assuming ID is string based on GraphQL schema context
        duration: z.string(),
        intensityLevel: z.string(),
        equipment: z.array(z.string()),
        preparationNotes: z.string(),
    }),
    warmup: z.object({
        duration: z.string(),
        description: z.string(),
        exercises: z.array(
            z.object({
                name: z.string(),
                instruction: z.string(),
                duration: z.string(),
                sets: z.number(),
                reps: z.string(),
            }),
        ),
    }),
    mainBlock: z.object({
        exercises: z.array(
            z.object({
                name: z.string(),
                focusArea: z.string(),
                sets: z.number(),
                reps: z.string(),
                load: z.string(),
                rest: z.string(),
                tempoOrTiming: z.string(),
                techniqueCues: z.array(z.string()),
                modifications: z.object({
                    progression: z.string(),
                    regression: z.string(),
                }),
            }),
        ),
    }),
    supplementaryWork: z.object({
        exercises: z.array(
            z.object({
                name: z.string(),
                purpose: z.string(),
                sets: z.number(),
                reps: z.string(),
                intensity: z.string(),
                notes: z.string(),
            }),
        ),
    }),
    cooldown: z.object({
        duration: z.string(),
        components: z.array(z.string()),
        keyFocus: z.string(),
    }),
    sessionNotes: z.object({
        keyMetricsToTrack: z.array(z.string()),
        warningSignsToMonitor: z.array(z.string()),
        adjustmentGuidelines: z.string(),
        nextSessionConnection: z.string(),
    }),
});