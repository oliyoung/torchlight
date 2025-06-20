// @ts-nocheck
import { logger } from "@/lib/logger";
import { supabaseServiceRole } from "@/lib/supabase/serviceRoleClient";
import type { SupabaseClient } from "@supabase/supabase-js";

// Interface for join table configuration
export interface JoinTableConfig {
  tableName: string;
  sourceIdColumn: string;
  targetIdColumn: string;
}

export class RelationRepository {
  private readonly client: SupabaseClient;

  constructor() {
    this.client = supabaseServiceRole;
  }

  /**
   * Get related entity IDs for a source entity
   * @param config Join table configuration
   * @param sourceId ID of the source entity
   * @returns Array of related entity IDs
   */
  async getRelatedIds(config: JoinTableConfig, sourceId: string): Promise<string[]> {
    try {
      const { data, error } = await this.client
        .from(config.tableName)
        .select(config.targetIdColumn)
        .eq(config.sourceIdColumn, sourceId);

      if (error) {
        logger.error({
          error,
          sourceId,
          tableName: config.tableName
        }, `Error fetching related IDs from ${config.tableName}`);
        return [];
      }

      return data.map(item => item[config.targetIdColumn] as string);
    } catch (error) {
      logger.error({
        error,
        sourceId,
        tableName: config.tableName
      }, `Exception fetching related IDs from ${config.tableName}`);
      return [];
    }
  }

  /**
   * Add relationship between entities
   * @param config Join table configuration
   * @param sourceId ID of the source entity
   * @param targetId ID of the target entity
   * @returns Success indicator
   */
  async addRelation(config: JoinTableConfig, sourceId: string, targetId: string): Promise<boolean> {
    try {
      const { error } = await this.client
        .from(config.tableName)
        .insert({
          [config.sourceIdColumn]: sourceId,
          [config.targetIdColumn]: targetId
        });

      if (error) {
        logger.error({
          error,
          sourceId,
          targetId,
          tableName: config.tableName
        }, `Error adding relation in ${config.tableName}`);
        return false;
      }

      return true;
    } catch (error) {
      logger.error({
        error,
        sourceId,
        targetId,
        tableName: config.tableName
      }, `Exception adding relation in ${config.tableName}`);
      return false;
    }
  }

  /**
   * Add multiple relationships for a source entity
   * @param config Join table configuration
   * @param sourceId ID of the source entity
   * @param targetIds Array of target entity IDs
   * @returns Success indicator
   */
  async addRelations(config: JoinTableConfig, sourceId: string, targetIds: string[]): Promise<boolean> {
    if (!targetIds.length) return true;

    try {
      const { error } = await this.client
        .from(config.tableName)
        .insert(
          targetIds.map(targetId => ({
            [config.sourceIdColumn]: sourceId,
            [config.targetIdColumn]: targetId
          }))
        );

      if (error) {
        logger.error({
          error,
          sourceId,
          targetCount: targetIds.length,
          tableName: config.tableName
        }, `Error adding relations in ${config.tableName}`);
        return false;
      }

      return true;
    } catch (error) {
      logger.error({
        error,
        sourceId,
        targetCount: targetIds.length,
        tableName: config.tableName
      }, `Exception adding relations in ${config.tableName}`);
      return false;
    }
  }

  /**
   * Remove a relationship between entities
   * @param config Join table configuration
   * @param sourceId ID of the source entity
   * @param targetId ID of the target entity
   * @returns Success indicator
   */
  async removeRelation(config: JoinTableConfig, sourceId: string, targetId: string): Promise<boolean> {
    try {
      const { error } = await this.client
        .from(config.tableName)
        .delete()
        .eq(config.sourceIdColumn, sourceId)
        .eq(config.targetIdColumn, targetId);

      if (error) {
        logger.error({
          error,
          sourceId,
          targetId,
          tableName: config.tableName
        }, `Error removing relation in ${config.tableName}`);
        return false;
      }

      return true;
    } catch (error) {
      logger.error({
        error,
        sourceId,
        targetId,
        tableName: config.tableName
      }, `Exception removing relation in ${config.tableName}`);
      return false;
    }
  }

  /**
   * Remove all relationships for a source entity
   * @param config Join table configuration
   * @param sourceId ID of the source entity
   * @returns Success indicator
   */
  async removeAllRelations(config: JoinTableConfig, sourceId: string): Promise<boolean> {
    try {
      const { error } = await this.client
        .from(config.tableName)
        .delete()
        .eq(config.sourceIdColumn, sourceId);

      if (error) {
        logger.error({
          error,
          sourceId,
          tableName: config.tableName
        }, `Error removing all relations for ${sourceId} in ${config.tableName}`);
        return false;
      }

      return true;
    } catch (error) {
      logger.error({
        error,
        sourceId,
        tableName: config.tableName
      }, `Exception removing all relations for ${sourceId} in ${config.tableName}`);
      return false;
    }
  }

  /**
   * Replace all relationships for a source entity
   * @param config Join table configuration
   * @param sourceId ID of the source entity
   * @param targetIds New set of target entity IDs
   * @returns Success indicator
   */
  async replaceRelations(config: JoinTableConfig, sourceId: string, targetIds: string[]): Promise<boolean> {
    try {
      // Delete existing relations
      const deleteSuccess = await this.removeAllRelations(config, sourceId);
      if (!deleteSuccess) return false;

      // If no new relations to add, we're done
      if (!targetIds.length) return true;

      // Add new relations
      return this.addRelations(config, sourceId, targetIds);
    } catch (error) {
      logger.error({
        error,
        sourceId,
        targetCount: targetIds.length,
        tableName: config.tableName
      }, `Exception replacing relations in ${config.tableName}`);
      return false;
    }
  }
}