import { EntityRepository } from "./entityRepository";
import { logger } from "@/lib/logger";
import { supabaseServiceRole } from "@/lib/supabase/serviceRoleClient";
import type {
  Whiteboard,
  Play,
  CourtType,
  DifficultyLevel,
  CreateWhiteboardInput,
  UpdateWhiteboardInput
} from "@/lib/types";

export class WhiteboardRepository extends EntityRepository<Whiteboard> {
  constructor() {
    super({
      tableName: "whiteboards",
      columnMappings: {
        courtType: "court_type",
        isPublic: "is_public",
      },
      transform: (data: any): Whiteboard => ({
        id: data.id,
        title: data.title,
        description: data.description,
        sport: data.sport,
        courtType: data.court_type as CourtType,
        difficulty: data.difficulty as DifficultyLevel,
        tags: data.tags || [],
        isPublic: data.is_public || false,
        coach: null as any, // Will be populated by data loader
        athletes: [], // Will be populated by data loader
        trainingPlans: [], // Will be populated by data loader
        plays: [], // Will be populated by data loader
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        deletedAt: data.deleted_at ? new Date(data.deleted_at) : null,
      }),
    });
  }

  // Get whiteboards with optional filters
  async getWhiteboards(
    userId: string | null,
    filters?: {
      sport?: string;
      difficulty?: DifficultyLevel;
      isPublic?: boolean;
    }
  ): Promise<Whiteboard[]> {
    logger.info({ userId, filters }, "Fetching whiteboards with filters");

    try {
      let query = supabaseServiceRole
        .from("whiteboards")
        .select("*");

      // Apply user filter (coaches can see their own + public ones)
      if (userId) {
        if (filters?.isPublic === true) {
          query = query.eq("is_public", true);
        } else if (filters?.isPublic === false) {
          query = query.eq("user_id", userId).eq("is_public", false);
        } else {
          // Default: user's own whiteboards + public ones
          query = query.or(`user_id.eq.${userId},is_public.eq.true`);
        }
      } else {
        // No user: only public whiteboards
        query = query.eq("is_public", true);
      }

      // Apply additional filters
      if (filters?.sport) {
        query = query.eq("sport", filters.sport);
      }
      if (filters?.difficulty) {
        query = query.eq("difficulty", filters.difficulty);
      }

      // Filter out soft-deleted
      query = query.is("deleted_at", null);

      const { data, error } = await query;

      if (error) {
        logger.error({ error, filters }, "Error fetching whiteboards");
        return [];
      }

      return this.transformArray(data);
    } catch (error) {
      logger.error({ error, filters }, "Exception fetching whiteboards");
      return [];
    }
  }

  // Create whiteboard with proper validation
  async createWhiteboard(userId: string, input: CreateWhiteboardInput): Promise<Whiteboard | null> {
    if (!userId) {
      logger.warn("Attempted to create whiteboard without userId");
      return null;
    }

    logger.info({ userId, input }, "Creating whiteboard");

    try {
      const dbData = {
        user_id: userId,
        title: input.title,
        description: input.description,
        sport: input.sport,
        court_type: input.courtType,
        difficulty: input.difficulty || "INTERMEDIATE",
        tags: input.tags || [],
        is_public: input.isPublic || false,
      };

      const { data, error } = await supabaseServiceRole
        .from("whiteboards")
        .insert(dbData)
        .select()
        .single();

      if (error) {
        logger.error({ error, input }, "Error creating whiteboard");
        return null;
      }

      return this.transformResponse(data);
    } catch (error) {
      logger.error({ error, input }, "Exception creating whiteboard");
      return null;
    }
  }

  // Update whiteboard with ownership validation
  async updateWhiteboard(
    userId: string,
    whiteboardId: string,
    input: UpdateWhiteboardInput
  ): Promise<Whiteboard | null> {
    if (!userId) {
      logger.warn("Attempted to update whiteboard without userId");
      return null;
    }

    logger.info({ userId, whiteboardId, input }, "Updating whiteboard");

    // First verify ownership
    const existing = await this.getById(userId, whiteboardId);
    if (!existing) {
      logger.warn({ userId, whiteboardId }, "Whiteboard not found or not owned by user");
      return null;
    }

    return this.update(userId, whiteboardId, input as Partial<Whiteboard>);
  }

  // Get whiteboards for a specific athlete
  async getWhiteboardsForAthlete(userId: string, athleteId: string): Promise<Whiteboard[]> {
    logger.info({ userId, athleteId }, "Fetching whiteboards for athlete");

    try {
      const { data, error } = await supabaseServiceRole
        .from("whiteboard_athletes")
        .select(`
          whiteboard:whiteboards!inner(*)
        `)
        .eq("athlete_id", athleteId)
        .eq("whiteboards.user_id", userId)
        .is("whiteboards.deleted_at", null);

      if (error) {
        logger.error({ error, athleteId }, "Error fetching whiteboards for athlete");
        return [];
      }

      return this.transformArray(data.map((item: any) => item.whiteboard));
    } catch (error) {
      logger.error({ error, athleteId }, "Exception fetching whiteboards for athlete");
      return [];
    }
  }

  // Associate whiteboard with athlete
  async addAthleteToWhiteboard(
    userId: string,
    whiteboardId: string,
    athleteId: string
  ): Promise<boolean> {
    logger.info({ userId, whiteboardId, athleteId }, "Adding athlete to whiteboard");

    try {
      // Verify ownership of whiteboard
      const whiteboard = await this.getById(userId, whiteboardId);
      if (!whiteboard) {
        logger.warn({ userId, whiteboardId }, "Whiteboard not found or not owned by user");
        return false;
      }

      const { error } = await supabaseServiceRole
        .from("whiteboard_athletes")
        .insert({
          whiteboard_id: whiteboardId,
          athlete_id: athleteId,
        });

      if (error) {
        // Handle duplicate key constraint gracefully
        if (error.code === "23505") {
          logger.info({ whiteboardId, athleteId }, "Athlete already associated with whiteboard");
          return true;
        }
        logger.error({ error, whiteboardId, athleteId }, "Error adding athlete to whiteboard");
        return false;
      }

      return true;
    } catch (error) {
      logger.error({ error, whiteboardId, athleteId }, "Exception adding athlete to whiteboard");
      return false;
    }
  }

  // Remove athlete from whiteboard
  async removeAthleteFromWhiteboard(
    userId: string,
    whiteboardId: string,
    athleteId: string
  ): Promise<boolean> {
    logger.info({ userId, whiteboardId, athleteId }, "Removing athlete from whiteboard");

    try {
      // Verify ownership
      const whiteboard = await this.getById(userId, whiteboardId);
      if (!whiteboard) {
        logger.warn({ userId, whiteboardId }, "Whiteboard not found or not owned by user");
        return false;
      }

      const { error } = await supabaseServiceRole
        .from("whiteboard_athletes")
        .delete()
        .eq("whiteboard_id", whiteboardId)
        .eq("athlete_id", athleteId);

      if (error) {
        logger.error({ error, whiteboardId, athleteId }, "Error removing athlete from whiteboard");
        return false;
      }

      return true;
    } catch (error) {
      logger.error({ error, whiteboardId, athleteId }, "Exception removing athlete from whiteboard");
      return false;
    }
  }
}