import { logger } from "@/lib/logger";
import { supabaseServiceRole } from "@/lib/supabase/serviceRoleClient";
import type { Assistant, AssistantsInput } from "@/lib/types";
import { type EntityMapping, EntityRepository } from "./entityRepository";

// Assistant-specific column mappings
const assistantMapping: EntityMapping<Assistant> = {
  tableName: 'assistants',
  columnMappings: {
    promptTemplate: 'prompt_template'
  },
  transform: (data: Record<string, unknown>) => {
    if (!data) return null as unknown as Assistant;

    return {
      id: data.id as string,
      name: data.name as string,
      sport: data.sport as string,
      role: data.role as string,
      strengths: data.strengths as string[],
      bio: data.bio as string,
      promptTemplate: data.prompt_template as string,
      createdAt: new Date(data.created_at as string),
      updatedAt: new Date(data.updated_at as string),
      deletedAt: data.deleted_at ? new Date(data.deleted_at as string) : null
    } as Assistant;
  }
};

export class AssistantRepository extends EntityRepository<Assistant> {
  constructor() {
    super(assistantMapping);
  }

  /**
   * Get all assistants, with optional filtering
   */
  async getAssistants(input?: AssistantsInput): Promise<Assistant[]> {
    const { filter } = input ?? {};
    const { sport, role, strengths } = filter ?? {};

    logger.info({ filter }, 'Fetching assistants with filter');

    try {
      // Start with a base query to get all assistants
      let query = supabaseServiceRole
        .from('assistants')
        .select('*');

      // Apply filters if provided - use ilike for case-insensitive matching
      if (sport) query = query.ilike('sport', `%${sport}%`);
      if (role) query = query.ilike('role', `%${role}%`);
      if (strengths && strengths.length > 0) {
        // Filter for assistants that have at least one of the requested strengths
        // This assumes strengths is stored as an array in Supabase
        query = query.contains('strengths', strengths);
      }

      const { data, error } = await query;

      if (error) {
        logger.error({ error, filter }, 'Error fetching assistants with filter');
        return [];
      }

      return this.transformArray(data);
    } catch (error) {
      logger.error({ error, filter }, 'Exception fetching assistants with filter');
      return [];
    }
  }

  /**
   * Get an assistant by ID
   */
  async getAssistantById(id: string): Promise<Assistant | null> {
    return this.getById(null, id);
  }

  /**
   * Get multiple assistants by their IDs
   */
  async getAssistantsByIds(ids: string[]): Promise<Assistant[]> {
    return this.getByIds(null, ids);
  }

  /**
   * Create a new assistant
   */
  async createAssistant(assistantData: Partial<Assistant>): Promise<Assistant | null> {
    // Assistants don't have a user_id as they're globally available
    return this.create(null, assistantData);
  }

  /**
   * Update an assistant
   */
  async updateAssistant(id: string, assistantData: Partial<Assistant>): Promise<Assistant | null> {
    // Assistants don't have a user_id as they're globally available
    return this.update(null, id, assistantData);
  }
}