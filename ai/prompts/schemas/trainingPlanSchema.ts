import { z } from "zod";

export const trainingPlanSchema = z.object({
    planOverview: z.object({
        title: z.string(),
        durationWeeks: z.number(),
        sessionsPerWeek: z.number(),
        equipment: z.array(z.string()),
        primaryGoals: z.array(z.string()),
        secondaryGoals: z.array(z.string()),
        intensityGuidelines: z.string(),
    }),
    weeklyStructure: z.array(
        z.object({
            week: z.number(),
            focus: z.string(),
            sessions: z.array(
                z.object({
                    type: z.string(),
                    focusArea: z.string(),
                    templateRef: z.string(),
                }),
            ),
        }),
    ),
    sessionTemplates: z.array(
        z.object({
            templateRef: z.string(),
            structure: z.object({
                warmup: z.string(),
                mainBlock: z.string(),
                supplementary: z.string(),
                cooldown: z.string(),
            }),
        }),
    ),
    progressionGuidelines: z.string(),
    tracking: z.object({
        keyMetrics: z.array(z.string()),
        warningSigns: z.array(z.string()),
        adjustmentCriteria: z.string(),
    }),
});