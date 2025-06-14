import { logger } from "../../../lib/logger";
import type {
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
    athleteId: "athlete_id",
    progressNotes: "progress_notes",
    dueDate: "due_date",
    targetValue: "target_value",
    currentValue: "current_value",
    progressPercentage: "progress_percentage",
    completedAt: "completed_at",
    evaluationResponse: "evaluation_response"
    // Note: Goals don't have userId field - they belong to athletes via coach_id
  }
  // No custom transform needed - auto-transform handles all field mappings and date conversions
};

// Session log to goal relationship configuration
const sessionLogGoalsConfig = {
  tableName: "goal_session_logs",
  sourceIdColumn: "goal_id",
  targetIdColumn: "session_log_id",
};

// Training plan to goal relationship configuration
export const trainingPlanGoalsConfig = {
  tableName: "training_plan_goals",
  sourceIdColumn: "goal_id",
  targetIdColumn: "training_plan_id",
};

export class GoalRepository extends EntityRepository<Goal> {
  private readonly relationRepo: RelationRepository;

  constructor() {
    super(goalMapping);
    this.relationRepo = new RelationRepository();
  }

  /**
   * Get all goals for a coach across all their athletes
   */
  async getAllGoals(coachId: string | null): Promise<Goal[]> {
    logger.info({ coachId }, "Fetching all goals for coach");

    if (!coachId) return [];

    return this.getAll(coachId);
  }

  /**
   * Get all goals for a specific athlete
   */
  async getGoalsByAthleteId(
    coachId: string | null,
    athleteId: string,
  ): Promise<Goal[]> {
    logger.info({ coachId, athleteId }, "Fetching goals for athlete");

    if (!coachId) return [];

    return this.getByField(coachId, "athlete_id", athleteId);
  }

  /**
   * Get a goal by ID
   */
  async getGoalById(
    coachId: string | null,
    goalId: string,
  ): Promise<Goal | null> {
    logger.info({ coachId, goalId }, "Fetching goal by ID");

    return this.getById(coachId, goalId);
  }

  /**
   * Get goals by their IDs
   */
  async getGoalsByIds(
    coachId: string | null,
    goalIds: string[],
  ): Promise<Goal[]> {
    logger.info({ coachId, count: goalIds.length }, "Fetching goals by IDs");

    return this.getByIds(coachId, goalIds);
  }

  /**
   * Create a new goal
   */
  async createGoal(
    coachId: string | null,
    input: CreateGoalInput & { trainingPlanIds?: string[] },
  ): Promise<Goal | null> {
    if (!coachId) return null;

    logger.info({ input }, "Creating goal");

    try {
      // Map the input fields to our database schema with all new fields
      const dbGoal = {
        athlete_id: input.athleteId,
        title: input.title,
        description: input.description ?? null,
        category: input.category,
        priority: input.priority,
        sport: input.sport,

        // Progress Tracking
        target_value: input.targetValue ?? null,
        current_value: input.currentValue ?? 0,
        unit: input.unit ?? null,

        // Status and Timeline
        status: GoalStatus.Active,
        due_date: input.dueDate ?? null,

        // Notes
        progress_notes: input.progressNotes ?? null
      };

      // Create the goal first
      const newGoal = await this.create(coachId, dbGoal);

      // If we have training plan IDs and the goal was created successfully
      if (newGoal && input.trainingPlanIds?.length) {
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
    coachId: string | null,
    goalId: string,
    input: UpdateGoalInput,
  ): Promise<Goal | null> {
    if (!coachId) return null;

    logger.info({ goalId, input }, "Updating goal");

    try {
      // Map the input fields to our database schema with all new fields
      const dbGoal: Record<string, unknown> = {};

      if (input.title !== undefined) dbGoal.title = input.title;
      if (input.description !== undefined) dbGoal.description = input.description;
      if (input.category !== undefined) dbGoal.category = input.category;
      if (input.priority !== undefined) dbGoal.priority = input.priority;
      if (input.sport !== undefined) dbGoal.sport = input.sport;

      // Progress Tracking
      if (input.targetValue !== undefined) dbGoal.target_value = input.targetValue;
      if (input.currentValue !== undefined) dbGoal.current_value = input.currentValue;
      if (input.unit !== undefined) dbGoal.unit = input.unit;

      // Status and Timeline
      if (input.status !== undefined) dbGoal.status = input.status;
      if (input.dueDate !== undefined) dbGoal.due_date = input.dueDate;
      if (input.completedAt !== undefined) dbGoal.completed_at = input.completedAt;

      // Notes
      if (input.progressNotes !== undefined) dbGoal.progress_notes = input.progressNotes;

      // Update the goal first
      const updatedGoal = await this.update(coachId, goalId, dbGoal);

      // If we have training plan IDs and the goal was updated successfully
      if (updatedGoal && input.trainingPlanIds !== undefined) {
        // Replace all training plan relationships
        await this.replaceTrainingPlans(goalId, input.trainingPlanIds || []);
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
    coachId: string | null,
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
      return this.getByIds(coachId, goalIds);
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
