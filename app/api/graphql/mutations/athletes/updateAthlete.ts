import { athleteRepository } from "@/lib/repository";
import { logger } from "@/lib/logger";
import type { UpdateAthleteInput, Athlete } from "@/lib/types";

export interface UpdateAthleteArgs {
  id: string;
  input: UpdateAthleteInput;
}

export const updateAthlete = async (
  _parent: unknown,
  args: UpdateAthleteArgs,
  context: { userId: string | null }
): Promise<Athlete> => {
  const { id, input } = args;
  const { userId } = context;

  logger.info({ userId, athleteId: id, input }, "updateAthlete mutation called");

  if (!userId) {
    logger.error("Unauthorized attempt to update athlete");
    throw new Error("Authentication required");
  }

  try {
    // Filter out null values from input to match Athlete type expectations
    const filteredInput = Object.fromEntries(
      Object.entries(input).filter(([_, value]) => value !== null)
    ) as Partial<Athlete>;

    const athlete = await athleteRepository.update(userId, id, filteredInput);

    if (!athlete) {
      logger.error({ userId, athleteId: id }, "Athlete not found or failed to update");
      throw new Error("Athlete not found or failed to update");
    }

    logger.info({ userId, athleteId: athlete.id }, "Athlete updated successfully");
    return athlete;
  } catch (error) {
    logger.error({ error, userId, athleteId: id, input }, "Failed to update athlete");
    throw error;
  }
};