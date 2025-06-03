import { EntityRepository } from "./entityRepository";
import { logger } from "@/lib/logger";
import { supabaseServiceRole } from "@/lib/supabase/serviceRoleClient";
import type {
  Phase,
  PlayerPosition,
  Movement,
  Annotation,
  CreatePhaseInput,
  UpdatePhaseInput,
  PlayerPositionInput,
  CreateMovementInput,
  CreateAnnotationInput,
  MovementType,
  AnnotationType
} from "@/lib/types";

// Phase Repository
export class PhaseRepository extends EntityRepository<Phase> {
  constructor() {
    super({
      tableName: "phases",
      columnMappings: {
        playId: "play_id",
        order: "phase_order",
        delay: "delay_seconds",
      },
      transform: (data: any): Phase => ({
        id: data.id,
        title: data.title,
        description: data.description,
        order: data.phase_order,
        duration: data.duration,
        delay: data.delay_seconds,
        play: null as any, // Will be populated by data loader
        playerPositions: [], // Will be populated by data loader
        movements: [], // Will be populated by data loader
        annotations: [], // Will be populated by data loader
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      }),
    });
  }

  // Get phases for a play
  async getPhasesForPlay(playId: string): Promise<Phase[]> {
    logger.info({ playId }, "Fetching phases for play");

    try {
      const { data, error } = await supabaseServiceRole
        .from("phases")
        .select("*")
        .eq("play_id", playId)
        .order("phase_order", { ascending: true });

      if (error) {
        logger.error({ error, playId }, "Error fetching phases for play");
        return [];
      }

      return this.transformArray(data);
    } catch (error) {
      logger.error({ error, playId }, "Exception fetching phases for play");
      return [];
    }
  }

  // Create phase
  async createPhase(userId: string, input: CreatePhaseInput): Promise<Phase | null> {
    logger.info({ userId, input }, "Creating phase");

    try {
      // Verify play ownership through whiteboard
      const { data: playData, error: playError } = await supabaseServiceRole
        .from("plays")
        .select(`
          id,
          whiteboard:whiteboards!inner(user_id)
        `)
        .eq("id", input.playId)
        .eq("whiteboards.user_id", userId)
        .single();

      if (playError || !playData) {
        logger.warn({ userId, playId: input.playId }, "Play not found or not owned by user");
        return null;
      }

      const dbData = {
        play_id: input.playId,
        title: input.title,
        description: input.description,
        phase_order: input.order,
        duration: input.duration,
        delay_seconds: input.delay || 0,
      };

      const { data, error } = await supabaseServiceRole
        .from("phases")
        .insert(dbData)
        .select()
        .single();

      if (error) {
        logger.error({ error, input }, "Error creating phase");
        return null;
      }

      return this.transformResponse(data);
    } catch (error) {
      logger.error({ error, input }, "Exception creating phase");
      return null;
    }
  }
}

// PlayerPosition Repository
export class PlayerPositionRepository extends EntityRepository<PlayerPosition> {
  constructor() {
    super({
      tableName: "player_positions",
      columnMappings: {
        playId: "play_id",
        phaseId: "phase_id",
        playerId: "player_id",
        playerName: "player_name",
        playerRole: "player_role",
        x: "x_coordinate",
        y: "y_coordinate",
        z: "z_coordinate",
      },
      transform: (data: any): PlayerPosition => ({
        id: data.id,
        playerId: data.player_id,
        playerName: data.player_name,
        playerRole: data.player_role,
        x: data.x_coordinate,
        y: data.y_coordinate,
        z: data.z_coordinate || 0,
        color: data.color,
        jersey: data.jersey,
        phase: null as any, // Will be populated by data loader
        play: null as any, // Will be populated by data loader
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      }),
    });
  }

  // Get positions for a play
  async getPositionsForPlay(playId: string): Promise<PlayerPosition[]> {
    logger.info({ playId }, "Fetching positions for play");

    try {
      const { data, error } = await supabaseServiceRole
        .from("player_positions")
        .select("*")
        .eq("play_id", playId);

      if (error) {
        logger.error({ error, playId }, "Error fetching positions for play");
        return [];
      }

      return this.transformArray(data);
    } catch (error) {
      logger.error({ error, playId }, "Exception fetching positions for play");
      return [];
    }
  }

  // Update player positions for a play
  async updatePlayerPositions(
    userId: string,
    playId: string,
    positions: PlayerPositionInput[]
  ): Promise<PlayerPosition[]> {
    logger.info({ userId, playId, count: positions.length }, "Updating player positions");

    try {
      // Verify play ownership
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
        return [];
      }

      // Delete existing starting positions (phase_id = null)
      await supabaseServiceRole
        .from("player_positions")
        .delete()
        .eq("play_id", playId)
        .is("phase_id", null);

      // Insert new positions
      const dbPositions = positions.map(pos => ({
        play_id: playId,
        phase_id: null, // Starting positions
        player_id: pos.playerId,
        player_name: pos.playerName,
        player_role: pos.playerRole,
        x_coordinate: pos.x,
        y_coordinate: pos.y,
        z_coordinate: pos.z || 0,
        color: pos.color,
        jersey: pos.jersey,
      }));

      const { data, error } = await supabaseServiceRole
        .from("player_positions")
        .insert(dbPositions)
        .select();

      if (error) {
        logger.error({ error, playId }, "Error updating player positions");
        return [];
      }

      return this.transformArray(data);
    } catch (error) {
      logger.error({ error, playId }, "Exception updating player positions");
      return [];
    }
  }
}

// Movement Repository
export class MovementRepository extends EntityRepository<Movement> {
  constructor() {
    super({
      tableName: "movements",
      columnMappings: {
        phaseId: "phase_id",
        playerId: "player_id",
        fromX: "from_x",
        fromY: "from_y",
        toX: "to_x",
        toY: "to_y",
        movementType: "movement_type",
        curveData: "curve_data",
        showTrail: "show_trail",
        trailColor: "trail_color",
      },
      transform: (data: any): Movement => ({
        id: data.id,
        playerId: data.player_id,
        fromX: data.from_x,
        fromY: data.from_y,
        toX: data.to_x,
        toY: data.to_y,
        movementType: data.movement_type as MovementType,
        speed: data.speed,
        curve: data.curve_data,
        showTrail: data.show_trail,
        trailColor: data.trail_color,
        phase: null as any, // Will be populated by data loader
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      }),
    });
  }

  // Get movements for a phase
  async getMovementsForPhase(phaseId: string): Promise<Movement[]> {
    logger.info({ phaseId }, "Fetching movements for phase");

    try {
      const { data, error } = await supabaseServiceRole
        .from("movements")
        .select("*")
        .eq("phase_id", phaseId);

      if (error) {
        logger.error({ error, phaseId }, "Error fetching movements for phase");
        return [];
      }

      return this.transformArray(data);
    } catch (error) {
      logger.error({ error, phaseId }, "Exception fetching movements for phase");
      return [];
    }
  }
}

// Annotation Repository
export class AnnotationRepository extends EntityRepository<Annotation> {
  constructor() {
    super({
      tableName: "annotations",
      columnMappings: {
        playId: "play_id",
        phaseId: "phase_id",
        type: "annotation_type",
        text: "text_content",
        strokeWidth: "stroke_width",
        fontSize: "font_size",
      },
      transform: (data: any): Annotation => ({
        id: data.id,
        type: data.annotation_type as AnnotationType,
        text: data.text_content,
        coordinates: data.coordinates,
        color: data.color,
        strokeWidth: data.stroke_width,
        fontSize: data.font_size,
        play: null as any, // Will be populated by data loader
        phase: null as any, // Will be populated by data loader
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      }),
    });
  }

  // Get annotations for a play
  async getAnnotationsForPlay(playId: string): Promise<Annotation[]> {
    logger.info({ playId }, "Fetching annotations for play");

    try {
      const { data, error } = await supabaseServiceRole
        .from("annotations")
        .select("*")
        .eq("play_id", playId);

      if (error) {
        logger.error({ error, playId }, "Error fetching annotations for play");
        return [];
      }

      return this.transformArray(data);
    } catch (error) {
      logger.error({ error, playId }, "Exception fetching annotations for play");
      return [];
    }
  }

  // Get annotations for a phase
  async getAnnotationsForPhase(phaseId: string): Promise<Annotation[]> {
    logger.info({ phaseId }, "Fetching annotations for phase");

    try {
      const { data, error } = await supabaseServiceRole
        .from("annotations")
        .select("*")
        .eq("phase_id", phaseId);

      if (error) {
        logger.error({ error, phaseId }, "Error fetching annotations for phase");
        return [];
      }

      return this.transformArray(data);
    } catch (error) {
      logger.error({ error, phaseId }, "Exception fetching annotations for phase");
      return [];
    }
  }
}