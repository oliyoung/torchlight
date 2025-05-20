import type { Goal, Client, CreateGoalInput, UpdateGoalInput } from "@/lib/types";
import { EntityRepository, type EntityMapping } from "./entityRepository";
import { RelationRepository } from "./relationRepository";
import { logger } from "@/lib/logger";

// Goal-specific column mappings
const goalMapping: EntityMapping<Goal> = {
  tableName: 'goals',
  columnMappings: {
    clientId: 'client_id',
    userId: 'user_id',
    progressNotes: 'progress_notes',
    dueDate: 'due_date'
  },
  transform: (data: Record<string, unknown>) => {
    if (!data) return null as unknown as Goal;

    return {
      id: data.id as string,
      title: data.title as string,
      description: data.description as string | null,
      status: data.status as string,
      clientId: data.client_id as string,
      userId: data.user_id as string,
      createdAt: new Date(data.created_at as string),
      updatedAt: new Date(data.updated_at as string),
      deletedAt: data.deleted_at ? new Date(data.deleted_at as string) : null,
      dueDate: data.due_date ? new Date(data.due_date as string) : null,
      progressNotes: data.progress_notes as string | null,
      client: undefined, // To be resolved by GraphQL resolver
      sessionLogs: [] // To be resolved by GraphQL resolver
    } as Goal;
  }
};

// Session log to goal relationship configuration
const sessionLogGoalsConfig = {
  tableName: 'goal_session_logs',
  sourceIdColumn: 'goal_id',
  targetIdColumn: 'session_log_id'
};

// Training plan to goal relationship configuration
const trainingPlanGoalsConfig = {
  tableName: 'training_plan_goals',
  sourceIdColumn: 'goal_id',
  targetIdColumn: 'training_plan_id'
};

export class GoalRepository extends EntityRepository<Goal> {
  private relationRepo: RelationRepository;

  constructor() {
    super(goalMapping);
    this.relationRepo = new RelationRepository();
  }

  /**
   * Get all goals for a specific client
   */
  async getGoalsByClientId(userId: string | null, clientId: string): Promise<Goal[]> {
    logger.info({ userId, clientId }, 'Fetching goals for client');

    if (!userId) return [];

    return this.getByField(userId, 'client_id', clientId);
  }

  /**
   * Get a goal by ID
   */
  async getGoalById(userId: string | null, goalId: string): Promise<Goal | null> {
    logger.info({ userId, goalId }, 'Fetching goal by ID');

    return this.getById(userId, goalId);
  }

  /**
   * Get goals by their IDs
   */
  async getGoalsByIds(userId: string | null, goalIds: string[]): Promise<Goal[]> {
    logger.info({ userId, count: goalIds.length }, 'Fetching goals by IDs');

    return this.getByIds(userId, goalIds);
  }

  /**
   * Create a new goal
   */
  async createGoal(userId: string | null, input: CreateGoalInput): Promise<Goal | null> {
    logger.info({ userId, input }, 'Creating goal');

    if (!userId) return null;

    try {
      // Create the goal
      const goal = await this.create(userId, {
        title: input.title,
        description: input.description || null,
        status: 'ACTIVE', // Default status for new goals
        clientId: input.clientId,
        dueDate: input.dueDate || null,
        progressNotes: null
      });

      return goal;
    } catch (error) {
      logger.error({ error, input }, 'Error creating goal');
      return null;
    }
  }

  /**
   * Update a goal
   */
  async updateGoal(userId: string | null, goalId: string, input: UpdateGoalInput): Promise<Goal | null> {
    logger.info({ userId, goalId, input }, 'Updating goal');

    if (!userId) return null;

    return this.update(userId, goalId, input);
  }

  /**
   * Get session log IDs associated with a goal
   */
  async getSessionLogIds(goalId: string): Promise<string[]> {
    return this.relationRepo.getRelatedIds(
      sessionLogGoalsConfig,
      goalId
    );
  }

  /**
   * Get goals associated with a training plan
   */
  async getGoalsByTrainingPlanId(userId: string | null, trainingPlanId: string): Promise<Goal[]> {
    try {
      // Get the goal IDs from the join table
      const goalIds = await this.relationRepo.getRelatedIds(
        {
          tableName: trainingPlanGoalsConfig.tableName,
          sourceIdColumn: trainingPlanGoalsConfig.targetIdColumn,
          targetIdColumn: trainingPlanGoalsConfig.sourceIdColumn
        },
        trainingPlanId
      );

      if (!goalIds.length) return [];

      // Get the actual goals
      return this.getByIds(userId, goalIds);
    } catch (error) {
      logger.error({ error, trainingPlanId }, 'Error getting goals by training plan ID');
      return [];
    }
  }

  /**
   * Associate a goal with session logs
   */
  async addSessionLogs(goalId: string, sessionLogIds: string[]): Promise<boolean> {
    return this.relationRepo.addRelations(
      sessionLogGoalsConfig,
      goalId,
      sessionLogIds
    );
  }

  /**
   * Remove session log associations from a goal
   */
  async removeSessionLogs(goalId: string, sessionLogIds: string[]): Promise<boolean> {
    const results = await Promise.all(
      sessionLogIds.map(sessionLogId =>
        this.relationRepo.removeRelation(
          sessionLogGoalsConfig,
          goalId,
          sessionLogId
        )
      )
    );

    return results.every(result => result);
  }

  /**
   * Replace all session log associations for a goal
   */
  async replaceSessionLogs(goalId: string, sessionLogIds: string[]): Promise<boolean> {
    return this.relationRepo.replaceRelations(
      sessionLogGoalsConfig,
      goalId,
      sessionLogIds
    );
  }
}