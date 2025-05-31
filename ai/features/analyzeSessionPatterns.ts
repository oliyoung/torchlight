import { logger } from "@/lib/logger";
import { sessionLogRepository } from "@/lib/repository";
import type { SessionLog } from "@/lib/types";

import { z } from "zod";
import { loadAndProcessPrompt } from "../lib/promptLoader";
import { callOpenAI } from "../providers/openai";

const ANALYZE_SESSION_PATTERNS_PROMPT_FILE = "ai/prompts/analyze_session_patterns.prompt.yml";

/**
 * Session pattern analysis response schema
 */
export const sessionPatternAnalysisSchema = z.object({
    overallAssessment: z.object({
        progressSummary: z.string(),
        keyTrends: z.array(z.string()),
        concernAreas: z.array(z.string()),
        positivePatterns: z.array(z.string()),
    }),
    performanceMetrics: z.object({
        consistencyScore: z.number().min(0).max(10),
        improvementRate: z.string(),
        effortLevels: z.array(z.string()),
        technicalDevelopment: z.string(),
    }),
    patternInsights: z.object({
        motivationPatterns: z.array(z.string()),
        challengeRecurrence: z.array(z.string()),
        strengthAreas: z.array(z.string()),
        developmentAreas: z.array(z.string()),
    }),
    goalAlignment: z.object({
        onTrackGoals: z.array(z.string()),
        strugglingGoals: z.array(z.string()),
        suggestedAdjustments: z.array(z.string()),
    }),
    recommendations: z.object({
        immediate: z.array(z.string()),
        shortTerm: z.array(z.string()),
        longTerm: z.array(z.string()),
        coachingFocus: z.array(z.string()),
    }),
    nextSteps: z.object({
        priorityActions: z.array(z.string()),
        sessionsToSchedule: z.array(z.string()),
        metricsToTrack: z.array(z.string()),
    }),
});

export type SessionPatternAnalysis = z.infer<typeof sessionPatternAnalysisSchema>;

/**
 * Analyzes patterns across multiple session logs for an athlete.
 * Identifies trends, progress patterns, and provides insights for coaching.
 *
 * @param athleteId The ID of the athlete to analyze.
 * @param startDate Start date for analysis period.
 * @param endDate End date for analysis period.
 * @param goalIds Optional goal IDs to filter sessions.
 * @param userId The ID of the user performing the analysis.
 * @throws Error if no session logs are found or the analysis fails.
 */
export const analyzeSessionPatterns = async (
    athleteId: string,
    startDate: Date,
    endDate: Date,
    goalIds: string[] | undefined,
    userId: string | null,
): Promise<string> => {
    logger.info({ userId, athleteId, startDate, endDate, goalIds }, "Starting AI session pattern analysis");

    if (!userId) {
        logger.error("User ID is required for session pattern analysis.");
        throw new Error("Authentication required for session pattern analysis.");
    }

    // Get all session logs for the athlete in the specified date range
    const sessionLogs = await sessionLogRepository.getSessionLogsByAthlete(userId, athleteId);

    if (!sessionLogs || sessionLogs.length === 0) {
        logger.error({ athleteId, userId }, "No session logs found for pattern analysis.");
        throw new Error(`No session logs found for athlete ${athleteId}.`);
    }

    // Filter by date range and optionally by goals
    const filteredLogs = sessionLogs.filter((log: SessionLog) => {
        const logDate = new Date(log.date);
        const inDateRange = logDate >= startDate && logDate <= endDate;
        
        if (!goalIds || goalIds.length === 0) {
            return inDateRange;
        }
        
        // Check if any of the session's goals match the filter
        const hasMatchingGoals = log.goals?.some(goal => goalIds.includes(goal.id));
        return inDateRange && hasMatchingGoals;
    });

    if (filteredLogs.length === 0) {
        logger.error({ athleteId, startDate, endDate, goalIds }, "No session logs found in specified criteria.");
        throw new Error("No session logs found matching the specified criteria.");
    }

    // Prepare session data for analysis
    const sessionData = filteredLogs.map((log: SessionLog) => ({
        date: log.date,
        notes: log.notes || "",
        transcript: log.transcript || "",
        summary: log.summary || "",
        goals: log.goals?.map((g: any) => ({ id: g.id, title: g.title, description: g.description })) || [],
    }));

    // Load and process the prompt with variable substitution
    const prompt = loadAndProcessPrompt(ANALYZE_SESSION_PATTERNS_PROMPT_FILE, {
        sessionLogs: JSON.stringify(sessionData, null, 2),
        athleteId: athleteId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        sessionCount: filteredLogs.length.toString()
    });

    // Call the AI client function
    const generatedContent = await callOpenAI<SessionPatternAnalysis>(
        prompt.model,
        prompt.temperature,
        prompt.systemMessage,
        prompt.userMessage,
        sessionPatternAnalysisSchema
    );

    logger.info({ athleteId, sessionCount: filteredLogs.length }, "Successfully generated session pattern analysis.");

    // Return the analysis as a formatted string
    return JSON.stringify(generatedContent, null, 2);
};