import { logger } from "@/lib/logger";
import type { CreateTrainingPlanInput, TrainingPlan } from "@/lib/types";
import { TrainingPlanStatus } from "@/lib/types";
import { type EntityMapping, EntityRepository } from "./entityRepository";
import { RelationRepository } from "./relationRepository";

// Training plan column mappings
const trainingPlanMapping: EntityMapping<TrainingPlan> = {
  tableName: 'training_plans',
  columnMappings: {
    athleteId: 'athlete_id',
    startDate: 'start_date',
    endDate: 'end_date',
    durationWeeks: 'duration_weeks',
    completionPercentage: 'completion_percentage',
    planJson: 'plan_json',
    sourcePrompt: 'source_prompt',
    generatedBy: 'generated_by',
    generationMetadata: 'generation_metadata'
  }
  // No custom transform needed - auto-transform handles all field mappings and date conversions
};

// Join table configurations
export const trainingPlanAssistantsConfig = {
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
  private readonly relationRepo: RelationRepository;

  constructor() {
    super(trainingPlanMapping);
    this.relationRepo = new RelationRepository();
  }

  /**
   * Get all training plans for a coach
   */
  async getTrainingPlans(coachId: string | null, athleteId?: string | null): Promise<TrainingPlan[]> {
    if (!coachId) return [];

    if (athleteId) {
      return this.getByField(coachId, 'athlete_id', athleteId);
    }

    return this.getAll(coachId);
  }

  /**
   * Get a training plan by ID
   */
  async getTrainingPlanById(coachId: string | null, id: string): Promise<TrainingPlan | null> {
    return this.getById(coachId, id);
  }

  /**
   * Get multiple training plans by their IDs
   */
  async getTrainingPlansByIds(coachId: string | null, ids: string[]): Promise<TrainingPlan[]> {
    return this.getByIds(coachId, ids);
  }

  /**
   * Create a new training plan with related assistants and goals
   */
  async createTrainingPlan(
    coachId: string | null,
    data: CreateTrainingPlanInput
  ): Promise<TrainingPlan | null> {
    if (!coachId) return null;

    logger.info({ data }, "Creating training plan");

    try {
      // Create training plan with all new fields
      const dbTrainingPlan = {
        overview: data.overview ?? null,
        difficulty: data.difficulty,
        athlete_id: data.athleteId,
        start_date: data.startDate ?? null,
        end_date: data.endDate ?? null,
        notes: data.notes ?? null,
        status: TrainingPlanStatus.Draft
      };

      // Create the training plan
      const trainingPlan = await this.create(coachId, dbTrainingPlan);

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
    coachId: string | null,
    id: string,
    data: Partial<TrainingPlan> & { assistantIds?: string[]; goalIds?: string[]; athleteId?: string; },
  ): Promise<TrainingPlan | null> {
    if (!coachId) return null;

    logger.info({ id, data }, "Updating training plan");

    try {
      // Create a flag to track if we need to update the main entity
      const hasEntityChanges = !!(
        data.overview !== undefined ||
        data.difficulty !== undefined ||
        data.startDate !== undefined ||
        data.endDate !== undefined ||
        data.status !== undefined ||
        data.completionPercentage !== undefined ||
        data.planJson !== undefined ||
        data.notes !== undefined
      );

      let updatedPlan: TrainingPlan | null = null;

      // Map all properties to database fields, only including defined fields
      if (hasEntityChanges) {
        const dbTrainingPlan: Record<string, unknown> = {};

        // Plan Information
        if (data.overview !== undefined) dbTrainingPlan.overview = data.overview;
        if (data.difficulty !== undefined) dbTrainingPlan.difficulty = data.difficulty;

        // Timeline
        if (data.startDate !== undefined) dbTrainingPlan.start_date = data.startDate;
        if (data.endDate !== undefined) dbTrainingPlan.end_date = data.endDate;

        // Status and Progress
        if (data.status !== undefined) dbTrainingPlan.status = data.status;
        if (data.completionPercentage !== undefined) dbTrainingPlan.completion_percentage = data.completionPercentage;

        // Content
        if (data.planJson !== undefined) dbTrainingPlan.plan_json = data.planJson;
        if (data.notes !== undefined) dbTrainingPlan.notes = data.notes;

        // Update the training plan basic data only if there are fields to update
        updatedPlan = await this.update(coachId, id, dbTrainingPlan);

        if (!updatedPlan) {
          logger.error({ id, data }, "Failed to update training plan entity data");
          return null;
        }
      } else {
        // If we're only updating relations, we need to fetch the current plan
        logger.info({ id }, "Only updating relations, fetching current training plan");
        updatedPlan = await this.getTrainingPlanById(coachId, id);

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