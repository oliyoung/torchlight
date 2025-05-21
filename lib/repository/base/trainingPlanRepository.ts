import { logger } from "@/lib/logger";
import type { CreateTrainingPlanInput, TrainingPlan } from "@/lib/types";
import { type EntityMapping, EntityRepository } from "./entityRepository";
import { RelationRepository } from "./relationRepository";

// Training plan column mappings
const trainingPlanMapping: EntityMapping<TrainingPlan> = {
  tableName: 'training_plans',
  columnMappings: {
    athleteId: 'athlete_id',
    planJson: 'plan_json',
    generatedBy: 'generated_by',
    sourcePrompt: 'source_prompt'
  },
  transform: (data: any) => {
    if (!data) return null as unknown as TrainingPlan;

    return {
      id: data.id,
      title: data.title,
      overview: data.overview,
      planJson: data.plan_json,
      athleteId: data.athlete_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      deletedAt: data.deleted_at ? new Date(data.deleted_at) : null,
      generatedBy: data.generated_by || null,
      sourcePrompt: data.source_prompt || null,
      frequency: data.frequency || null,
      duration: data.duration || null,
      summary: data.summary || null,
    } as TrainingPlan;
  }
};

// Join table configurations
const trainingPlanAssistantsConfig = {
  tableName: 'training_plan_assistants',
  sourceIdColumn: 'training_plan_id',
  targetIdColumn: 'assistant_id'
};

const trainingPlanGoalsConfig = {
  tableName: 'training_plan_goals',
  sourceIdColumn: 'training_plan_id',
  targetIdColumn: 'goal_id'
};

export class TrainingPlanRepository extends EntityRepository<TrainingPlan> {
  private relationRepo: RelationRepository;

  constructor() {
    super(trainingPlanMapping);
    this.relationRepo = new RelationRepository();
  }

  /**
   * Get all training plans for a user
   */
  async getTrainingPlans(userId: string | null, athleteId?: string | null): Promise<TrainingPlan[]> {
    if (!userId) return [];

    if (athleteId) {
      return this.getByField(userId, 'athlete_id', athleteId);
    }

    return this.getAll(userId);
  }

  /**
   * Get a training plan by ID
   */
  async getTrainingPlanById(userId: string | null, id: string): Promise<TrainingPlan | null> {
    return this.getById(userId, id);
  }

  /**
   * Get multiple training plans by their IDs
   */
  async getTrainingPlansByIds(userId: string | null, ids: string[]): Promise<TrainingPlan[]> {
    return this.getByIds(userId, ids);
  }

  /**
   * Create a new training plan with related assistants and goals
   */
  async createTrainingPlan(
    userId: string | null,
    data: CreateTrainingPlanInput & { overview: string; planJson: any; generatedBy?: string; sourcePrompt?: string },
  ): Promise<TrainingPlan | null> {
    if (!userId) return null;

    logger.info({ data }, "Creating training plan");

    try {
      // Map the input fields to our database schema
      const dbTrainingPlan = {
        title: data.overview ? `Training Plan - ${new Date().toLocaleDateString()}` : "New Training Plan",
        overview: data.overview,
        plan_json: data.planJson,
        athlete_id: data.athleteId,
        generated_by: data.generatedBy,
        source_prompt: data.sourcePrompt
      };

      // Create the training plan
      const trainingPlan = await this.create(userId, dbTrainingPlan);

      if (!trainingPlan) {
        logger.error({ data }, "Failed to create training plan");
        return null;
      }

      // Add assistant relations if provided
      if (data.assistantIds?.length) {
        await this.relationRepo.addRelations(
          trainingPlanAssistantsConfig,
          trainingPlan.id,
          data.assistantIds
        );
      }

      // Add goal relations if provided
      if (data.goalIds?.length) {
        await this.relationRepo.addRelations(
          trainingPlanGoalsConfig,
          trainingPlan.id,
          data.goalIds
        );
      }

      return trainingPlan;
    } catch (error) {
      logger.error({ error, data }, "Exception creating training plan");
      return null;
    }
  }

  /**
   * Update a training plan with related assistants and goals
   */
  async updateTrainingPlan(
    userId: string | null,
    id: string,
    data: Partial<TrainingPlan> & { assistantIds?: string[]; goalIds?: string[]; athleteId?: string; },
  ): Promise<TrainingPlan | null> {
    if (!userId) return null;

    logger.info({ id, data }, "Updating training plan");

    try {
      // Create a flag to track if we need to update the main entity
      const hasEntityChanges = !!(
        data.title !== undefined ||
        data.overview !== undefined ||
        data.planJson !== undefined ||
        data.athleteId !== undefined ||
        data.generatedBy !== undefined ||
        data.sourcePrompt !== undefined
      );

      let updatedPlan: TrainingPlan | null = null;

      // Map athlete properties to database fields, only including defined fields
      if (hasEntityChanges) {
        const dbTrainingPlan: Record<string, unknown> = {};

        if (data.title !== undefined) dbTrainingPlan.title = data.title;
        if (data.overview !== undefined) dbTrainingPlan.overview = data.overview;
        if (data.planJson !== undefined) dbTrainingPlan.plan_json = data.planJson;
        if (data.athleteId !== undefined) dbTrainingPlan.athlete_id = data.athleteId;
        if (data.generatedBy !== undefined) dbTrainingPlan.generated_by = data.generatedBy;
        if (data.sourcePrompt !== undefined) dbTrainingPlan.source_prompt = data.sourcePrompt;

        // Update the training plan basic data only if there are fields to update
        updatedPlan = await this.update(userId, id, dbTrainingPlan);

        if (!updatedPlan) {
          logger.error({ id, data }, "Failed to update training plan entity data");
          return null;
        }
      } else {
        // If we're only updating relations, we need to fetch the current plan
        logger.info({ id }, "Only updating relations, fetching current training plan");
        updatedPlan = await this.getTrainingPlanById(userId, id);

        if (!updatedPlan) {
          logger.error({ id }, "Training plan not found for relation update");
          return null;
        }
      }

      let relationsUpdated = true;

      // Update assistant relations if provided
      if (data.assistantIds !== undefined) {
        logger.info({ id, assistantIds: data.assistantIds }, "Updating training plan assistants");
        const assistantResult = await this.relationRepo.replaceRelations(
          trainingPlanAssistantsConfig,
          id,
          data.assistantIds
        );

        if (!assistantResult) {
          logger.error({ id, assistantIds: data.assistantIds }, "Failed to update training plan assistants");
          relationsUpdated = false;
        }
      }

      // Update goal relations if provided
      if (data.goalIds !== undefined) {
        logger.info({ id, goalIds: data.goalIds }, "Updating training plan goals");
        const goalResult = await this.relationRepo.replaceRelations(
          trainingPlanGoalsConfig,
          id,
          data.goalIds
        );

        if (!goalResult) {
          logger.error({ id, goalIds: data.goalIds }, "Failed to update training plan goals");
          relationsUpdated = false;
        }
      }

      // If relations failed to update but entity succeeded, still return the updated plan
      if (!relationsUpdated) {
        logger.warn({ id }, "Some training plan relations failed to update");
      }

      return updatedPlan;
    } catch (error) {
      logger.error({ error, id, data }, "Exception updating training plan");
      return null;
    }
  }

  /**
   * Get assistant IDs for a training plan
   */
  async getAssistantIds(trainingPlanId: string): Promise<string[]> {
    return this.relationRepo.getRelatedIds(
      trainingPlanAssistantsConfig,
      trainingPlanId
    );
  }

  /**
   * Get goal IDs for a training plan
   */
  async getGoalIds(trainingPlanId: string): Promise<string[]> {
    return this.relationRepo.getRelatedIds(
      trainingPlanGoalsConfig,
      trainingPlanId
    );
  }
}