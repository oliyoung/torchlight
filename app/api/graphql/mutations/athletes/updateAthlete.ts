import { athleteRepository } from "@/lib/repository";
import { logger } from "@/lib/logger";
import type { UpdateAthleteInput, Athlete } from "@/lib/types";

export const updateAthlete = async (
  _parent: any,
  args: { id: string; input: UpdateAthleteInput },
  context: { coachId: string | null }
): Promise<Athlete> => {
  const { id, input } = args;
  const { coachId } = context;

  logger.info({ coachId, athleteId: id, input }, "updateAthlete mutation called");

  if (!coachId) {
    throw new Error("Authentication required");
  }

  try {
    // Filter out undefined values to avoid overwriting with undefined
    const filteredInput = Object.fromEntries(
      Object.entries(input).filter(([_, value]) => value !== undefined)
    ) as Partial<Athlete>;

    // Use the specific updateAthlete method that includes age calculation
    const athlete = await athleteRepository.updateAthlete(coachId, id, filteredInput);

    if (!athlete) {
      logger.error({ coachId, athleteId: id }, "Athlete not found or failed to update");
      throw new Error("Failed to update athlete");
    }

    logger.info({ coachId, athleteId: athlete.id }, "Athlete updated successfully");
    return athlete;
  } catch (error) {
    logger.error({ error, coachId, athleteId: id, input }, "Failed to update athlete");
    throw error;
  }
};