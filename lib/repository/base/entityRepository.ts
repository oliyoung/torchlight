import { logger } from "@/lib/logger";
import { supabaseServiceRole } from "@/lib/supabase/serviceRoleClient";
import type { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import type { SupabaseClient } from "@supabase/supabase-js";

// Type to represent entity mapping configurations
export type EntityMapping<T> = {
  tableName: string;
  // Optional column mappings from camelCase to snake_case
  columnMappings?: Record<string, string>;
  // Optional function to transform database response into entity
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  transform?: (data: any) => T;
};

export class EntityRepository<T extends { id: string | number }> {
  private client: SupabaseClient;
  private entityMapping: EntityMapping<T>;

  constructor(entityMapping: EntityMapping<T>) {
    this.client = supabaseServiceRole;
    this.entityMapping = entityMapping;
  }

  // Helper to transform DB response to entity format
  protected transformResponse(data: unknown): T {
    if (!data) return null as unknown as T;

    // Handle date fields conversion
    const processDateFields = (obj: Record<string, unknown> = {}): Record<string, unknown> => {
      const result = { ...obj };
      if (obj.created_at) result.createdAt = new Date(obj.created_at as string);
      if (obj.updated_at) result.updatedAt = new Date(obj.updated_at as string);
      if (obj.deleted_at) result.deletedAt = obj.deleted_at ? new Date(obj.deleted_at as string) : null;
      return result;
    };

    // Apply custom transform if provided
    if (this.entityMapping.transform) {
      return this.entityMapping.transform(data);
    }

    // Apply basic transform with date handling
    return processDateFields(data as Record<string, unknown>) as unknown as T;
  }

  // Transform array of entities
  protected transformArray(data: unknown[]): T[] {
    if (!data || !Array.isArray(data)) return [];
    return data.map(item => this.transformResponse(item));
  }

  // Helper to map camelCase fields to snake_case for DB inserts/updates
  protected mapToDbColumns(input: Partial<T>): Record<string, unknown> {
    if (!input) return {};

    const result: Record<string, unknown> = {};
    const { columnMappings } = this.entityMapping;

    for (const [key, value] of Object.entries(input)) {
      if (columnMappings?.[key]) {
        result[columnMappings[key]] = value;
      } else {
        // Default transformation from camelCase to snake_case
        const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
        result[snakeKey] = value;
      }
    }

    return result;
  }

  // Helper to add common filters like user_id
  protected withUserFilter(
    // biome-ignore lint/suspicious/noExplicitAny: Required for compatibility with PostgrestFilterBuilder
    query: PostgrestFilterBuilder<any, any, any>,
    userId: string | null
    // biome-ignore lint/suspicious/noExplicitAny: Required for compatibility with PostgrestFilterBuilder
  ): PostgrestFilterBuilder<any, any, any> {
    if (!userId) return query;
    return query.eq('user_id', userId);
  }

  // Generic getById method
  async getById(userId: string | null, id: string | number): Promise<T | null> {
    logger.info({ userId, id, entity: this.entityMapping.tableName }, `Fetching ${this.entityMapping.tableName} by ID`);

    try {
      let query = this.client
        .from(this.entityMapping.tableName)
        .select('*')
        .eq('id', id);

      query = this.withUserFilter(query, userId);

      const { data, error } = await query.single();

      if (error) {
        logger.error({ error, id }, `Error fetching ${this.entityMapping.tableName}`);
        return null;
      }

      return this.transformResponse(data);
    } catch (error) {
      logger.error({ error, id }, `Exception fetching ${this.entityMapping.tableName}`);
      return null;
    }
  }

  // Generic getByIds method for batching
  async getByIds(userId: string | null, ids: (string | number)[]): Promise<T[]> {
    if (!ids.length) return [];

    logger.info({ userId, count: ids.length, entity: this.entityMapping.tableName }, `Batch loading ${this.entityMapping.tableName}`);

    try {
      let query = this.client
        .from(this.entityMapping.tableName)
        .select('*')
        .in('id', ids);

      query = this.withUserFilter(query, userId);

      const { data, error } = await query;

      if (error) {
        logger.error({ error }, "Error batch loading");
        return [];
      }

      return this.transformArray(data);
    } catch (error) {
      logger.error({ error }, "Exception batch loading");
      return [];
    }
  }

  // Generic getAll method
  async getAll(userId: string | null): Promise<T[]> {
    logger.info({ userId, entity: this.entityMapping.tableName }, "Fetching all entities");

    try {
      let query = this.client
        .from(this.entityMapping.tableName)
        .select('*');

      query = this.withUserFilter(query, userId);

      const { data, error } = await query;

      if (error) {
        logger.error({ error }, "Error fetching all entities");
        return [];
      }

      return this.transformArray(data);
    } catch (error) {
      logger.error({ error }, "Exception fetching all entities");
      return [];
    }
  }

  // Generic create method
  async create(userId: string | null, input: Partial<T>): Promise<T | null> {
    if (!userId) {
      logger.warn({ entity: this.entityMapping.tableName }, `Attempted to create ${this.entityMapping.tableName} without userId`);
      return null;
    }

    logger.info({ entity: this.entityMapping.tableName }, `Creating ${this.entityMapping.tableName}`);

    try {
      const dbData = this.mapToDbColumns(input);

      // Add user_id
      if (!dbData.user_id) {
        dbData.user_id = userId;
      }

      const { data, error } = await this.client
        .from(this.entityMapping.tableName)
        .insert(dbData)
        .select()
        .single();

      if (error) {
        logger.error({ error }, `Error creating ${this.entityMapping.tableName}`);
        return null;
      }

      return this.transformResponse(data);
    } catch (error) {
      logger.error({ error }, `Exception creating ${this.entityMapping.tableName}`);
      return null;
    }
  }

  // Generic update method
  async update(userId: string | null, id: string | number, input: Partial<T>): Promise<T | null> {
    if (!userId) {
      logger.warn({ entity: this.entityMapping.tableName }, `Attempted to update ${this.entityMapping.tableName} without userId`);
      return null;
    }

    logger.info({ id, entity: this.entityMapping.tableName, input }, `Updating ${this.entityMapping.tableName}`);

    try {
      // Filter out undefined/null values to avoid overwriting with nulls
      const filteredInput = Object.fromEntries(
        Object.entries(input).filter(([_, value]) => value !== undefined && value !== null)
      ) as Partial<T>; // Cast to ensure type safety

      // Check if we have any fields to update after filtering
      if (Object.keys(filteredInput).length === 0) {
        logger.warn({ id, entity: this.entityMapping.tableName }, `No valid fields to update for ${this.entityMapping.tableName}`);

        // Return the existing record instead of attempting an empty update
        let query = this.client
          .from(this.entityMapping.tableName)
          .select('*')
          .eq('id', id);

        query = this.withUserFilter(query, userId);

        const { data, error } = await query.maybeSingle();

        if (error) {
          logger.error({ error, id }, `Error fetching ${this.entityMapping.tableName} for empty update`);
          return null;
        }

        return this.transformResponse(data);
      }

      const dbData = this.mapToDbColumns(filteredInput);
      logger.debug({ dbData, id, entity: this.entityMapping.tableName }, 'Mapped data for update');

      let query = this.client
        .from(this.entityMapping.tableName)
        .update(dbData)
        .eq('id', id);

      query = this.withUserFilter(query, userId);

      // Use maybeSingle instead of single to avoid PGRST116 error when no rows match
      const { data, error } = await query
        .select()
        .maybeSingle();

      if (error) {
        logger.error({ error, id, dbData }, `Error updating ${this.entityMapping.tableName}`);
        return null;
      }

      if (!data) {
        logger.warn({ id, userId }, `No rows affected when updating ${this.entityMapping.tableName}`);
        return null;
      }

      return this.transformResponse(data);
    } catch (error) {
      logger.error({ error, id, input }, `Exception updating ${this.entityMapping.tableName}`);
      return null;
    }
  }

  // Generic delete method (soft delete if deleted_at column exists)
  async delete(userId: string | null, id: string | number): Promise<boolean> {
    if (!userId) {
      logger.warn({ entity: this.entityMapping.tableName }, `Attempted to delete ${this.entityMapping.tableName} without userId`);
      return false;
    }

    logger.info({ id, entity: this.entityMapping.tableName }, `Deleting ${this.entityMapping.tableName}`);

    try {
      // Try soft delete first
      let query = this.client
        .from(this.entityMapping.tableName)
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      query = this.withUserFilter(query, userId);

      const { error } = await query;

      if (error?.message?.includes('deleted_at')) {
        // If soft delete fails (column might not exist), try hard delete
        let deleteQuery = this.client
          .from(this.entityMapping.tableName)
          .delete()
          .eq('id', id);

        deleteQuery = this.withUserFilter(deleteQuery, userId);

        const { error: deleteError } = await deleteQuery;

        if (deleteError) {
          logger.error({ error: deleteError, id }, `Error hard deleting ${this.entityMapping.tableName}`);
          return false;
        }
      } else if (error) {
        logger.error({ error, id }, `Error soft deleting ${this.entityMapping.tableName}`);
        return false;
      }

      return true;
    } catch (error) {
      logger.error({ error, id }, `Exception deleting ${this.entityMapping.tableName}`);
      return false;
    }
  }

  // Generic method to get entities by a field value
  async getByField(userId: string | null, field: string, value: unknown): Promise<T[]> {
    logger.info({ userId, field, entity: this.entityMapping.tableName }, `Fetching ${this.entityMapping.tableName} by field ${field}`);

    try {
      let query = this.client
        .from(this.entityMapping.tableName)
        .select('*')
        .eq(field, String(value));

      query = this.withUserFilter(query, userId);

      const { data, error } = await query;

      if (error) {
        logger.error({ error, field, value }, `Error fetching ${this.entityMapping.tableName} by field`);
        return [];
      }

      return this.transformArray(data);
    } catch (error) {
      logger.error({ error, field, value }, `Exception fetching ${this.entityMapping.tableName} by field`);
      return [];
    }
  }
}