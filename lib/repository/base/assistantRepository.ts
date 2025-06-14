import { logger } from "@/lib/logger";
import { supabaseServiceRole } from "@/lib/supabase/serviceRoleClient";
import type { Assistant, AssistantsInput } from "@/lib/types";
import { type EntityMapping, EntityRepository } from "./entityRepository";

// Assistant-specific column mappings
const assistantMapping: EntityMapping<Assistant> = {
  tableName: 'assistants',
  columnMappings: {
    promptTemplate: 'prompt_template'
  }
  // No custom transform needed - auto-transform handles all field mappings and date conversions
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
      if (strengths?.length) {
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
   * Get assistant by ID
   */
  async getAssistantById(id: string): Promise<Assistant | null> {
    return this.getById(null, id);
  }

  /**
   * Get assistants by IDs
   */
  async getAssistantsByIds(ids: string[]): Promise<Assistant[]> {
    return this.getByIds(null, ids);
  }

  /**
   * Create a new assistant
   */
  async createAssistant(input: Partial<Assistant>): Promise<Assistant | null> {
    return this.create(null, input);
  }

  /**
   * Update an assistant
   */
  async updateAssistant(id: string, input: Partial<Assistant>): Promise<Assistant | null> {
    return this.update(null, id, input);
  }
}