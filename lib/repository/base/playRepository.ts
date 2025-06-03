import { EntityRepository } from "./entityRepository";
import { logger } from "@/lib/logger";
import { supabaseServiceRole } from "@/lib/supabase/serviceRoleClient";
import type {
  Play,
  CreatePlayInput,
  UpdatePlayInput
} from "@/lib/types";

export class PlayRepository extends EntityRepository<Play> {
  constructor() {
    super({
      tableName: "plays",
      columnMappings: {
        whiteboardId: "whiteboard_id",
        playerCount: "player_count",
        order: "play_order",
      },
      transform: (data: any): Play => ({
        id: data.id,
        title: data.title,
        description: data.description,
        playerCount: data.player_count,
        duration: data.duration,
        order: data.play_order,
        whiteboard: null as any, // Will be populated by data loader
        phases: [], // Will be populated by data loader
        startingPositions: [], // Will be populated by data loader
        annotations: [], // Will be populated by data loader
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      }),
    });
  }

  // Get plays for a whiteboard
  async getPlaysForWhiteboard(whiteboardId: string): Promise<Play[]> {
    logger.info({ whiteboardId }, "Fetching plays for whiteboard");

    try {
      const { data, error } = await supabaseServiceRole
        .from("plays")
        .select("*")
        .eq("whiteboard_id", whiteboardId)
        .order("play_order", { ascending: true });

      if (error) {
        logger.error({ error, whiteboardId }, "Error fetching plays for whiteboard");
        return [];
      }

      return this.transformArray(data);
    } catch (error) {
      logger.error({ error, whiteboardId }, "Exception fetching plays for whiteboard");
      return [];
    }
  }

  // Create play
  async createPlay(userId: string, input: CreatePlayInput): Promise<Play | null> {
    if (!userId) {
      logger.warn("Attempted to create play without userId");
      return null;
    }

    logger.info({ userId, input }, "Creating play");

    try {
      // Verify whiteboard ownership
      const { data: whiteboardData, error: whiteboardError } = await supabaseServiceRole
        .from("whiteboards")
        .select("id")
        .eq("id", input.whiteboardId)
        .eq("user_id", userId)
        .single();

      if (whiteboardError || !whiteboardData) {
        logger.warn({ userId, whiteboardId: input.whiteboardId }, "Whiteboard not found or not owned by user");
        return null;
      }

      const dbData = {
        whiteboard_id: input.whiteboardId,
        title: input.title,
        description: input.description,
        player_count: input.playerCount,
        duration: input.duration,
        play_order: 1, // Default order, can be updated later
      };

      const { data, error } = await supabaseServiceRole
        .from("plays")
        .insert(dbData)
        .select()
        .single();

      if (error) {
        logger.error({ error, input }, "Error creating play");
        return null;
      }

      return this.transformResponse(data);
    } catch (error) {
      logger.error({ error, input }, "Exception creating play");
      return null;
    }
  }

  // Update play with ownership validation
  async updatePlay(
    userId: string,
    playId: string,
    input: UpdatePlayInput
  ): Promise<Play | null> {
    if (!userId) {
      logger.warn("Attempted to update play without userId");
      return null;
    }

    logger.info({ userId, playId, input }, "Updating play");

    try {
      // Verify ownership through whiteboard
      const { data: playData, error: playError } = await supabaseServiceRole
        .from("plays")
        .select(`
          id,
          whiteboard:whiteboards!inner(user_id)
        `)
        .eq("id", playId)
        .eq("whiteboards.user_id", userId)
        .single();

      if (playError || !playData) {
        logger.warn({ userId, playId }, "Play not found or not owned by user");
        return null;
      }

      const dbData = this.mapToDbColumns(input as Partial<Play>);

      const { data, error } = await supabaseServiceRole
        .from("plays")
        .update(dbData)
        .eq("id", playId)
        .select()
        .single();

      if (error) {
        logger.error({ error, playId, input }, "Error updating play");
        return null;
      }

      return this.transformResponse(data);
    } catch (error) {
      logger.error({ error, playId, input }, "Exception updating play");
      return null;
    }
  }

  // Delete play with ownership validation
  async deletePlay(userId: string, playId: string): Promise<boolean> {
    if (!userId) {
      logger.warn("Attempted to delete play without userId");
      return false;
    }

    logger.info({ userId, playId }, "Deleting play");

    try {
      // Verify ownership through whiteboard
      const { data: playData, error: playError } = await supabaseServiceRole
        .from("plays")
        .select(`
          id,
          whiteboard:whiteboards!inner(user_id)
        `)
        .eq("id", playId)
        .eq("whiteboards.user_id", userId)
        .single();

      if (playError || !playData) {
        logger.warn({ userId, playId }, "Play not found or not owned by user");
        return false;
      }

      // Delete the play (cascade will handle related data)
      const { error } = await supabaseServiceRole
        .from("plays")
        .delete()
        .eq("id", playId);

      if (error) {
        logger.error({ error, playId }, "Error deleting play");
        return false;
      }

      return true;
    } catch (error) {
      logger.error({ error, playId }, "Exception deleting play");
      return false;
    }
  }

  // Get plays by IDs for data loader
  async getPlaysByIds(playIds: string[]): Promise<Play[]> {
    if (!playIds.length) return [];

    logger.info({ count: playIds.length }, "Batch loading plays");

    try {
      const { data, error } = await supabaseServiceRole
        .from("plays")
        .select("*")
        .in("id", playIds)
        .order("play_order", { ascending: true });

      if (error) {
        logger.error({ error }, "Error batch loading plays");
        return [];
      }

      return this.transformArray(data);
    } catch (error) {
      logger.error({ error }, "Exception batch loading plays");
      return [];
    }
  }
}