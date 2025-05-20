import type { TrainingPlan, CreateTrainingPlanInput } from "@/lib/types";
import { EntityRepository, type EntityMapping } from "./entityRepository";
import { RelationRepository } from "./relationRepository";
import { logger } from "@/lib/logger";

// Training plan column mappings
const trainingPlanMapping: EntityMapping<TrainingPlan> = {
  tableName: 'training_plans',
  columnMappings: {
    clientId: 'client_id',
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
      client_id: data.client_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      deletedAt: data.deleted_at ? new Date(data.deleted_at) : null,
      generatedBy: data.generated_by || null,
      sourcePrompt: data.source_prompt || null,
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
  async getTrainingPlans(userId: string | null, clientId?: string | null): Promise<TrainingPlan[]> {
    if (!userId) return [];

    if (clientId) {
      return this.getByField(userId, 'client_id', clientId);
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
        client_id: data.clientId,
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
    data: Partial<TrainingPlan> & { assistantIds?: string[]; goalIds?: string[]; clientId?: string; },
  ): Promise<TrainingPlan | null> {
    if (!userId) return null;

    logger.info({ id, data }, "Updating training plan");

    try {
      // Map client properties to database fields
      const dbTrainingPlan = {
        title: data.title,
        overview: data.overview,
        plan_json: data.planJson,
        client_id: data.clientId,
        generated_by: data.generatedBy,
        source_prompt: data.sourcePrompt
      };

      // Update the training plan basic data
      const updatedPlan = await this.update(userId, id, dbTrainingPlan);

      if (!updatedPlan) {
        logger.error({ id, data }, "Failed to update training plan");
        return null;
      }

      // Update assistant relations if provided
      if (data.assistantIds) {
        await this.relationRepo.replaceRelations(
          trainingPlanAssistantsConfig,
          id,
          data.assistantIds
        );
      }

      // Update goal relations if provided
      if (data.goalIds) {
        await this.relationRepo.replaceRelations(
          trainingPlanGoalsConfig,
          id,
          data.goalIds
        );
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