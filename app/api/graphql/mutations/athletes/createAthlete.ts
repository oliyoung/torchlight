import { athleteRepository } from "@/lib/repository";
import { logger } from "@/lib/logger";
import type { CreateAthleteInput, Athlete } from "@/lib/types";

export const createAthlete = async (
    _parent: any,
    args: { input: CreateAthleteInput },
    context: { coachId: string | null }
): Promise<Athlete> => {
    const { coachId } = context;

    logger.info({ coachId, input: args.input }, "createAthlete mutation called");

    if (!coachId) {
        throw new Error("Authentication required");
    }

    try {
        // Handle empty email strings by converting to null to avoid constraint violation
        const sanitizedInput = {
            ...args.input,
            email: args.input.email?.trim() || null
        };

        const athlete = await athleteRepository.create(coachId, sanitizedInput);

        if (!athlete) {
            logger.error({ coachId, input: args.input }, "Failed to create athlete - null returned from repository");
            throw new Error("Failed to create athlete");
        }

        logger.info({ coachId, athleteId: athlete.id }, "Athlete created successfully");
        return athlete;
    } catch (error) {
        logger.error({ error, coachId, input: args.input }, "Failed to create athlete");
        throw error;
    }
}