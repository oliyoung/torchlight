// @ts-nocheck
import { logger } from "@/lib/logger";
import type { AiGenerateSessionInput, CreateSessionLogInput, SessionLog, UpdateSessionLogInput } from "@/lib/types";
import { type EntityMapping, EntityRepository } from "./entityRepository";
import { RelationRepository } from "./relationRepository";

// SessionLog-specific column mappings
const sessionLogMapping: EntityMapping<SessionLog> = {
  tableName: 'session_logs',
  columnMappings: {
    athleteId: 'athlete_id',
    sessionType: 'session_type',
    durationMinutes: 'duration_minutes',
    intensityLevel: 'intensity_level',
    coachRating: 'coach_rating',
    athleteFeedback: 'athlete_feedback',
    weatherConditions: 'weather_conditions',
    equipmentUsed: 'equipment_used',
    exercisesPerformed: 'exercises_performed',
    actionItems: 'action_items',
    aiMetadata: 'ai_metadata'
    // Note: Session logs don't have userId field - they're scoped via coach_id and RLS
  }
  // No custom transform needed - auto-transform handles all field mappings and date conversions
};

// Goal to session log relationship configuration
export const goalSessionLogsConfig = {
  tableName: 'goal_session_logs',
  sourceIdColumn: 'session_log_id',
  targetIdColumn: 'goal_id'
};

export class SessionLogRepository extends EntityRepository<SessionLog> {
  private readonly relationRepo: RelationRepository;

  constructor() {
    super(sessionLogMapping);
    this.relationRepo = new RelationRepository();
  }

  /**
   * Get all session logs for a coach across all their athletes
   */
  async getAllSessionLogs(coachId: string | null): Promise<SessionLog[]> {
    logger.info({ coachId }, 'Fetching all session logs for coach');

    if (!coachId) return [];

    return this.getAll(coachId);
  }

  /**
   * Get all session logs for a specific athlete
   */
  async getSessionLogsByAthleteId(coachId: string | null, athleteId: string): Promise<SessionLog[]> {
    logger.info({ coachId, athleteId }, 'Fetching session logs for athlete');

    if (!coachId) return [];

    return this.getByField(coachId, 'athlete_id', athleteId);
  }

  /**
   * Get a session log by ID
   */
  async getSessionLogById(coachId: string | null, sessionLogId: string): Promise<SessionLog | null> {
    logger.info({ coachId, sessionLogId }, 'Fetching session log by ID');

    return this.getById(coachId, sessionLogId);
  }

  /**
   * Get session logs by their IDs
   */
  async getSessionLogsByIds(coachId: string | null, sessionLogIds: string[]): Promise<SessionLog[]> {
    logger.info({ coachId, count: sessionLogIds.length }, 'Fetching session logs by IDs');

    return this.getByIds(coachId, sessionLogIds);
  }

  /**
   * Create a new session log
   */
  async createSessionLog(coachId: string | null, input: CreateSessionLogInput): Promise<SessionLog | null> {
    if (!coachId) return null;

    logger.info({ input }, "Creating session log");

    try {
      // Create the session log with all new fields
      const dbData = {
        athlete_id: input.athleteId,

        // Session Information
        session_type: input.sessionType,
        date: input.date,
        duration_minutes: input.durationMinutes || null,
        location: input.location || null,

        // Session Content
        notes: input.notes || null,
        transcript: input.transcript || null,

        // Session Metrics
        intensity_level: input.intensityLevel || null,
        coach_rating: input.coachRating || null,
        athlete_feedback: input.athleteFeedback || null,
        weather_conditions: input.weatherConditions || null,

        // Equipment and Resources
        equipment_used: input.equipmentUsed || [],
        exercises_performed: input.exercisesPerformed || null
      };

      const sessionLog = await this.create(coachId, dbData);

      if (!sessionLog) {
        logger.error({ input }, "Failed to create session log");
        return null;
      }

      // Add goal relations if provided
      if (input.goalIds?.length) {
        await this.relationRepo.addRelations(
          goalSessionLogsConfig,
          sessionLog.id,
          input.goalIds
        );
      }

      return sessionLog;
    } catch (error) {
      logger.error({ error, input }, "Exception creating session log");
      return null;
    }
  }

  /**
   * Update a session log
   */
  async updateSessionLog(coachId: string | null, sessionLogId: string, input: UpdateSessionLogInput): Promise<SessionLog | null> {
    logger.info({ coachId, sessionLogId, input }, 'Updating session log');

    if (!coachId) return null;

    try {
      // Build update data with all possible fields
      const updateData: Record<string, unknown> = {};

      // Session Information
      if (input.sessionType !== undefined) updateData.sessionType = input.sessionType;
      if (input.date !== undefined) updateData.date = input.date;
      if (input.durationMinutes !== undefined) updateData.durationMinutes = input.durationMinutes;
      if (input.location !== undefined) updateData.location = input.location;

      // Session Content
      if (input.notes !== undefined) updateData.notes = input.notes;
      if (input.transcript !== undefined) updateData.transcript = input.transcript;
      if (input.summary !== undefined) updateData.summary = input.summary;
      if (input.actionItems !== undefined) updateData.actionItems = input.actionItems;

      // Session Metrics
      if (input.intensityLevel !== undefined) updateData.intensityLevel = input.intensityLevel;
      if (input.coachRating !== undefined) updateData.coachRating = input.coachRating;
      if (input.athleteFeedback !== undefined) updateData.athleteFeedback = input.athleteFeedback;
      if (input.weatherConditions !== undefined) updateData.weatherConditions = input.weatherConditions;

      // Equipment and Resources
      if (input.equipmentUsed !== undefined) updateData.equipmentUsed = input.equipmentUsed;
      if (input.exercisesPerformed !== undefined) updateData.exercisesPerformed = input.exercisesPerformed;

      const sessionLog = await this.update(coachId, sessionLogId, updateData);

      if (!sessionLog) {
        logger.error({ sessionLogId, input }, 'Failed to update session log');
        return null;
      }

      // Update goal associations if provided
      if (input.goalIds !== undefined) {
        await this.relationRepo.replaceRelations(
          goalSessionLogsConfig,
          sessionLogId,
          input.goalIds
        );
      }

      return sessionLog;
    } catch (error) {
      logger.error({ error, sessionLogId, input }, 'Error updating session log');
      return null;
    }
  }

  /**
   * Get goal IDs associated with a session log
   */
  async getGoalIds(sessionLogId: string): Promise<string[]> {
    return this.relationRepo.getRelatedIds(
      goalSessionLogsConfig,
      sessionLogId
    );
  }

  /**
   * Associate a session log with goals
   */
  async addGoals(sessionLogId: string, goalIds: string[]): Promise<boolean> {
    return this.relationRepo.addRelations(
      goalSessionLogsConfig,
      sessionLogId,
      goalIds
    );
  }

  /**
   * Remove goal associations from a session log
   */
  async removeGoals(sessionLogId: string, goalIds: string[]): Promise<boolean> {
    const results = await Promise.all(
      goalIds.map(goalId =>
        this.relationRepo.removeRelation(
          goalSessionLogsConfig,
          sessionLogId,
          goalId
        )
      )
    );

    return results.every(result => result);
  }

  /**
   * Replace all goal associations for a session log
   */
  async replaceGoals(sessionLogId: string, goalIds: string[]): Promise<boolean> {
    return this.relationRepo.replaceRelations(
      goalSessionLogsConfig,
      sessionLogId,
      goalIds
    );
  }

  /**
   * Summarize a session log (mock implementation)
   */
  async summarizeSessionLog(coachId: string | null, sessionLogId: string): Promise<SessionLog | null> {
    logger.info({ coachId, sessionLogId }, 'Summarizing session log');

    const sessionLog = await this.getById(coachId, sessionLogId);
    if (!sessionLog) return null;

    // In a real implementation, this would call an AI service
    // For now, we'll just update the session log with a mock summary
    return this.update(coachId, sessionLogId, {
      summary: "This is a mock AI-generated summary of the session.",
      aiMetadata: {
        ...sessionLog.aiMetadata,
        summaryGenerated: true,
        nextStepsGenerated: false
      }
    });
  }

  async generateSession(coachId: string | null, input: AiGenerateSessionInput): Promise<SessionLog | null> {
    logger.info({ coachId, input }, 'Generating session');

    const sessionLog = await this.createSessionLog(coachId, {
      ...input,
      date: new Date()
    } as CreateSessionLogInput);
    return sessionLog;
  }

  /**
   * Generate action items for a session log (mock implementation)
   */
  async generateActionItems(coachId: string | null, sessionLogId: string): Promise<SessionLog | null> {
    logger.info({ coachId, sessionLogId }, 'Generating action items for session log');

    const sessionLog = await this.getById(coachId, sessionLogId);
    if (!sessionLog) return null;

    // In a real implementation, this would call an AI service
    // For now, we'll just update the session log with mock action items
    return this.update(coachId, sessionLogId, {
      actionItems: ["This is a mock action item 1", "This is a mock action item 2"],
      aiMetadata: {
        ...sessionLog.aiMetadata,
        nextStepsGenerated: true,
        summaryGenerated: false
      }
    });
  }

  /**
   * Add summary to a session log
   */
  async addSummary(coachId: string | null, sessionLogId: string, summary: string, actionItems: string[] = []): Promise<SessionLog | null> {
    if (!coachId) return null;

    logger.info({ sessionLogId, summary, actionItems }, "Adding summary to session log");

    try {
      const updatedLog = await this.update(coachId, sessionLogId, {
        summary,
        actionItems,
        aiMetadata: {
          summaryGenerated: true,
          nextStepsGenerated: false
        }
      });

      return updatedLog;
    } catch (error) {
      logger.error({ error, sessionLogId }, "Exception adding summary to session log");
      return null;
    }
  }

  /**
   * Add next steps to a session log
   */
  async addNextSteps(coachId: string | null, sessionLogId: string, actionItems: string[]): Promise<SessionLog | null> {
    if (!coachId) return null;

    logger.info({ sessionLogId, actionItems }, "Adding next steps to session log");

    try {
      const updatedLog = await this.update(coachId, sessionLogId, {
        actionItems,
        aiMetadata: {
          nextStepsGenerated: true,
          summaryGenerated: false
        }
      });

      return updatedLog;
    } catch (error) {
      logger.error({ error, sessionLogId }, "Exception adding next steps to session log");
      return null;
    }
  }
}