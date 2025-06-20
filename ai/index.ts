/**
 * AI Features Export Index
 * 
 * This file provides clean exports for all AI features,
 * making it easier to import and use them throughout the application.
 */

// Core AI Features
export { summarizeSessionLog } from "./features/summarizeSessionLog";
export { analyzeSessionPatterns } from "./features/analyzeSessionPatterns";
export { generateTrainingPlanContent } from "./features/generateTrainingPlan";
export { extractAndEvaluateGoal } from "./features/extractAndEvaluateGoal";
export { 
    generateFollowUpQuestions, 
    needsExpansion, 
    combineExpandedFeedback 
} from "./features/expandYouthFeedback";

// Utilities
export { loadPrompt, loadAndProcessPrompt } from "./lib/promptLoader";

// Providers
export { callOpenAI } from "./providers/openai";
export { callAnthropic } from "./providers/anthropic";

// Types
export type { ProcessedPrompt } from "./lib/promptLoader";
export type { SessionSummary } from "./features/summarizeSessionLog";
export type { SessionPatternAnalysis } from "./features/analyzeSessionPatterns";
export type { FollowUpQuestions } from "./features/expandYouthFeedback";

/**
 * AI Feature Registry
 * 
 * Central registry of all available AI features for dynamic access
 */
export const AI_FEATURES = {
    sessionSummarization: {
        name: "Session Log Summarization",
        description: "Transform athlete feedback into structured summaries",
        function: "summarizeSessionLog",
        category: "individual"
    },
    patternAnalysis: {
        name: "Session Pattern Analysis", 
        description: "Identify trends across multiple sessions",
        function: "analyzeSessionPatterns",
        category: "longitudinal"
    },
    trainingPlanGeneration: {
        name: "Training Plan Generation",
        description: "Create personalized training programs",
        function: "generateTrainingPlanContent", 
        category: "planning"
    },
    goalEvaluation: {
        name: "Goal Evaluation",
        description: "Analyze and improve goal setting",
        function: "extractAndEvaluateGoal",
        category: "goal-setting"
    },
    youthFeedbackExpansion: {
        name: "Youth Feedback Expansion",
        description: "Help youth athletes provide detailed feedback",
        function: "generateFollowUpQuestions",
        category: "youth-support"
    }
} as const;

/**
 * Feature Categories
 */
export const AI_CATEGORIES = {
    individual: "Individual Session Processing",
    longitudinal: "Multi-Session Analysis", 
    planning: "Training Program Generation",
    goalSetting: "Goal Setting and Evaluation",
    youthSupport: "Youth Athlete Support"
} as const;