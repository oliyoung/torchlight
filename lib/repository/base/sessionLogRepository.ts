import { logger } from "@/lib/logger";
import type { CreateSessionLogInput, SessionLog, UpdateSessionLogInput } from "@/lib/types";
import { type EntityMapping, EntityRepository } from "./entityRepository";
import { RelationRepository } from "./relationRepository";

// SessionLog-specific column mappings
const sessionLogMapping: EntityMapping<SessionLog> = {
  tableName: 'session_logs',
  columnMappings: {
    athleteId: 'athlete_id',
    userId: 'user_id',
    actionItems: 'action_items',
    aiMetadata: 'ai_metadata'
  },
  transform: (data: Record<string, unknown>) => {
    if (!data) return null as unknown as SessionLog;

    return {
      id: data.id as string,
      athleteId: data.athlete_id as string,
      date: new Date(data.date as string),
      notes: data.notes as string | null,
      transcript: data.transcript as string | null,
      summary: data.summary as string | null,
      actionItems: (data.action_items as string[]) || [],
      aiMetadata: data.ai_metadata as Record<string, unknown> | null,
      createdAt: new Date(data.created_at as string),
      updatedAt: new Date(data.updated_at as string),
      deletedAt: data.deleted_at ? new Date(data.deleted_at as string) : null,
      athlete: undefined, // Populated by GraphQL resolver
      goals: [] // Populated by GraphQL resolver
    } as unknown as SessionLog;
  }
};

// Goal to session log relationship configuration
const goalSessionLogsConfig = {
  tableName: 'goal_session_logs',
  sourceIdColumn: 'session_log_id',
  targetIdColumn: 'goal_id'
};

export class SessionLogRepository extends EntityRepository<SessionLog> {
  private relationRepo: RelationRepository;

  constructor() {
    super(sessionLogMapping);
    this.relationRepo = new RelationRepository();
  }

  /**
   * Get all session logs for a specific athlete
   */
  async getSessionLogsByAthleteId(userId: string | null, athleteId: string): Promise<SessionLog[]> {
    logger.info({ userId, athleteId }, 'Fetching session logs for athlete');

    if (!userId) return [];

    return this.getByField(userId, 'athlete_id', athleteId);
  }

  /**
   * Get a session log by ID
   */
  async getSessionLogById(userId: string | null, sessionLogId: string): Promise<SessionLog | null> {
    logger.info({ userId, sessionLogId }, 'Fetching session log by ID');

    return this.getById(userId, sessionLogId);
  }

  /**
   * Get session logs by their IDs
   */
  async getSessionLogsByIds(userId: string | null, sessionLogIds: string[]): Promise<SessionLog[]> {
    logger.info({ userId, count: sessionLogIds.length }, 'Fetching session logs by IDs');

    return this.getByIds(userId, sessionLogIds);
  }

  /**
   * Create a new session log
   */
  async createSessionLog(userId: string | null, input: CreateSessionLogInput): Promise<SessionLog | null> {
    if (!userId) return null;

    logger.info({ input }, "Creating session log");

    try {
      // Create the session log with mapped column names
      const dbData = {
        date: input.date,
        notes: input.notes || null,
        transcript: input.transcript || null,
        athlete_id: input.athleteId // Use database column name (will be mapped by EntityRepository)
      };

      const sessionLog = await this.create(userId, dbData);

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
  async updateSessionLog(userId: string | null, sessionLogId: string, input: UpdateSessionLogInput): Promise<SessionLog | null> {
    logger.info({ userId, sessionLogId, input }, 'Updating session log');

    if (!userId) return null;

    try {
      // Update the session log basic data
      const sessionLog = await this.update(userId, sessionLogId, {
        notes: input.notes,
        transcript: input.transcript,
        summary: input.summary,
        actionItems: input.actionItems
      });

      if (!sessionLog) {
        logger.error({ sessionLogId, input }, 'Failed to update session log');
        return null;
      }

      // Update goal associations if provided
      if (input.goalIds) {
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
  async summarizeSessionLog(userId: string | null, sessionLogId: string): Promise<SessionLog | null> {
    logger.info({ userId, sessionLogId }, 'Summarizing session log');

    const sessionLog = await this.getById(userId, sessionLogId);
    if (!sessionLog) return null;

    // In a real implementation, this would call an AI service
    // For now, we'll just update the session log with a mock summary
    return this.update(userId, sessionLogId, {
      summary: "This is a mock AI-generated summary of the session.",
      aiMetadata: {
        ...sessionLog.aiMetadata,
        summaryGenerated: true,
        nextStepsGenerated: false
      }
    });
  }

  /**
   * Generate action items for a session log (mock implementation)
   */
  async generateActionItems(userId: string | null, sessionLogId: string): Promise<SessionLog | null> {
    logger.info({ userId, sessionLogId }, 'Generating action items for session log');

    const sessionLog = await this.getById(userId, sessionLogId);
    if (!sessionLog) return null;

    // In a real implementation, this would call an AI service
    // For now, we'll just update the session log with mock action items
    return this.update(userId, sessionLogId, {
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
  async addSummary(userId: string | null, sessionLogId: string, summary: string, actionItems: string[] = []): Promise<SessionLog | null> {
    if (!userId) return null;

    logger.info({ sessionLogId, summary, actionItems }, "Adding summary to session log");

    try {
      const updatedLog = await this.update(userId, sessionLogId, {
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
  async addNextSteps(userId: string | null, sessionLogId: string, actionItems: string[]): Promise<SessionLog | null> {
    if (!userId) return null;

    logger.info({ sessionLogId, actionItems }, "Adding next steps to session log");

    try {
      const updatedLog = await this.update(userId, sessionLogId, {
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