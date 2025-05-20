import { logger } from "../../../lib/logger";
import type {
  Client,
  CreateGoalInput,
  Goal,
  UpdateGoalInput,
} from "../../../lib/types";
import { GoalStatus } from "../../../lib/types";
import { type EntityMapping, EntityRepository } from "./entityRepository";
import { RelationRepository } from "./relationRepository";

// Goal-specific column mappings
const goalMapping: EntityMapping<Goal> = {
  tableName: "goals",
  columnMappings: {
    clientId: "client_id",
    userId: "user_id",
    progressNotes: "progress_notes",
    dueDate: "due_date",
    trainingPlanId: "training_plan_id",
  },
  transform: (data: Record<string, unknown>) => {
    if (!data) return null as unknown as Goal;

    return {
      id: data.id as string,
      title: data.title as string,
      description: data.description as string | null,
      status: data.status as GoalStatus,
      clientId: data.client_id as string,
      userId: data.user_id as string,
      createdAt: new Date(data.created_at as string | number | Date),
      updatedAt: new Date(data.updated_at as string | number | Date),
      deletedAt: data.deleted_at ? new Date(data.deleted_at as string | number | Date) : null,
      dueDate: data.due_date ? new Date(data.due_date as string | number | Date) : null,
      progressNotes: data.progress_notes as string | null,
      sport: data.sport as string | null,
      trainingPlanId: data.training_plan_id as string | null,
      client: undefined, // Will be populated by GraphQL resolver
      sessionLogs: [], // To be resolved by GraphQL resolver
      trainingPlan: undefined, // Will be populated by GraphQL resolver
    } as unknown as Goal; // Use unknown as intermediate step
  },
};

// Session log to goal relationship configuration
const sessionLogGoalsConfig = {
  tableName: "goal_session_logs",
  sourceIdColumn: "goal_id",
  targetIdColumn: "session_log_id",
};

// Training plan to goal relationship configuration
const trainingPlanGoalsConfig = {
  tableName: "training_plan_goals",
  sourceIdColumn: "goal_id",
  targetIdColumn: "training_plan_id",
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
  async getGoalsByClientId(
    userId: string | null,
    clientId: string,
  ): Promise<Goal[]> {
    logger.info({ userId, clientId }, "Fetching goals for client");

    if (!userId) return [];

    return this.getByField(userId, "client_id", clientId);
  }

  /**
   * Get a goal by ID
   */
  async getGoalById(
    userId: string | null,
    goalId: string,
  ): Promise<Goal | null> {
    logger.info({ userId, goalId }, "Fetching goal by ID");

    return this.getById(userId, goalId);
  }

  /**
   * Get goals by their IDs
   */
  async getGoalsByIds(
    userId: string | null,
    goalIds: string[],
  ): Promise<Goal[]> {
    logger.info({ userId, count: goalIds.length }, "Fetching goals by IDs");

    return this.getByIds(userId, goalIds);
  }

  /**
   * Create a new goal
   */
  async createGoal(
    userId: string | null,
    input: CreateGoalInput,
  ): Promise<Goal | null> {
    if (!userId) return null;

    logger.info({ input }, "Creating goal");

    try {
      // Map the input fields to our database schema
      const dbGoal = {
        title: input.title,
        description: input.description || null,
        status: GoalStatus.Active, // Use the enum value directly
        client_id: input.clientId, // Map clientId to client_id for database
        due_date: input.dueDate || null,
        progress_notes: null,
        sport: input.sport,
        // training_plan_id field removed, will use join table instead
      };

      // Create the goal first
      const newGoal = await this.create(userId, dbGoal);

      // If we have training plan IDs and the goal was created successfully
      if (newGoal && input.trainingPlanIds && input.trainingPlanIds.length > 0) {
        // Add relationships between the goal and training plans
        await this.addTrainingPlans(newGoal.id, input.trainingPlanIds);
      }

      return newGoal;
    } catch (error) {
      logger.error({ error, input }, "Exception creating goal");
      return null;
    }
  }

  /**
   * Update a goal
   */
  async updateGoal(
    userId: string | null,
    goalId: string,
    input: UpdateGoalInput,
  ): Promise<Goal | null> {
    if (!userId) return null;

    logger.info({ goalId, input }, "Updating goal");

    try {
      // Map the input fields to our database schema
      const dbGoal: Record<string, any> = {};

      if (input.title !== undefined) dbGoal.title = input.title;
      if (input.description !== undefined) dbGoal.description = input.description;
      if (input.status !== undefined) dbGoal.status = input.status;
      if (input.dueDate !== undefined) dbGoal.due_date = input.dueDate;
      if (input.progressNotes !== undefined) dbGoal.progress_notes = input.progressNotes;
      if (input.sport !== undefined) dbGoal.sport = input.sport;
      // training_plan_id field removed, will use join table instead

      // Update the goal first
      const updatedGoal = await this.update(userId, goalId, dbGoal);

      // If we have training plan IDs and the goal was updated successfully
      if (updatedGoal && input.trainingPlanIds !== undefined) {
        // Replace all training plan relationships
        await this.replaceTrainingPlans(goalId, input.trainingPlanIds);
      }

      return updatedGoal;
    } catch (error) {
      logger.error({ error, goalId, input }, "Exception updating goal");
      return null;
    }
  }

  /**
   * Get session log IDs associated with a goal
   */
  async getSessionLogIds(goalId: string): Promise<string[]> {
    return this.relationRepo.getRelatedIds(sessionLogGoalsConfig, goalId);
  }

  /**
   * Get goals associated with a training plan
   */
  async getGoalsByTrainingPlanId(
    userId: string | null,
    trainingPlanId: string,
  ): Promise<Goal[]> {
    try {
      // Get the goal IDs from the join table
      const goalIds = await this.relationRepo.getRelatedIds(
        {
          tableName: trainingPlanGoalsConfig.tableName,
          sourceIdColumn: trainingPlanGoalsConfig.targetIdColumn,
          targetIdColumn: trainingPlanGoalsConfig.sourceIdColumn,
        },
        trainingPlanId,
      );

      if (!goalIds.length) return [];

      // Get the actual goals
      return this.getByIds(userId, goalIds);
    } catch (error) {
      logger.error(
        { error, trainingPlanId },
        "Error getting goals by training plan ID",
      );
      return [];
    }
  }

  /**
   * Associate a goal with session logs
   */
  async addSessionLogs(
    goalId: string,
    sessionLogIds: string[],
  ): Promise<boolean> {
    return this.relationRepo.addRelations(
      sessionLogGoalsConfig,
      goalId,
      sessionLogIds,
    );
  }

  /**
   * Remove session log associations from a goal
   */
  async removeSessionLogs(
    goalId: string,
    sessionLogIds: string[],
  ): Promise<boolean> {
    const results = await Promise.all(
      sessionLogIds.map((sessionLogId) =>
        this.relationRepo.removeRelation(
          sessionLogGoalsConfig,
          goalId,
          sessionLogId,
        ),
      ),
    );

    return results.every((result) => result);
  }

  /**
   * Replace all session log associations for a goal
   */
  async replaceSessionLogs(
    goalId: string,
    sessionLogIds: string[],
  ): Promise<boolean> {
    return this.relationRepo.replaceRelations(
      sessionLogGoalsConfig,
      goalId,
      sessionLogIds,
    );
  }

  /**
   * Add training plan associations to a goal
   */
  async addTrainingPlans(
    goalId: string,
    trainingPlanIds: string[],
  ): Promise<boolean> {
    return this.relationRepo.addRelations(
      trainingPlanGoalsConfig,
      goalId,
      trainingPlanIds,
    );
  }

  /**
   * Remove training plan associations from a goal
   */
  async removeTrainingPlans(
    goalId: string,
    trainingPlanIds: string[],
  ): Promise<boolean> {
    const results = await Promise.all(
      trainingPlanIds.map((trainingPlanId) =>
        this.relationRepo.removeRelation(
          trainingPlanGoalsConfig,
          goalId,
          trainingPlanId,
        ),
      ),
    );

    return results.every((result) => result);
  }

  /**
   * Replace all training plan associations for a goal
   */
  async replaceTrainingPlans(
    goalId: string,
    trainingPlanIds: string[],
  ): Promise<boolean> {
    return this.relationRepo.replaceRelations(
      trainingPlanGoalsConfig,
      goalId,
      trainingPlanIds,
    );
  }
}
