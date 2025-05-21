import type { Athlete } from "@/lib/types";
import { type EntityMapping, EntityRepository } from "./entityRepository";

// Athlete-specific column mappings
const athleteMapping: EntityMapping<Athlete> = {
  tableName: 'athletes',
  columnMappings: {
    firstName: 'first_name',
    lastName: 'last_name',
    userId: 'user_id',
    fitnessLevel: 'fitness_level',
    trainingHistory: 'training_history'
  },
  // Custom transform to handle specific fields
  transform: (data: Record<string, unknown>) => {
    if (!data) return null as unknown as Athlete;

    return {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      birthday: data.birthday,
      gender: data.gender,
      fitnessLevel: data.fitness_level,
      trainingHistory: data.training_history,
      height: data.height,
      weight: data.weight,
      tags: data.tags,
      notes: data.notes,
      sport: data.sport,
      userId: data.user_id,
      createdAt: new Date(data.created_at as string),
      updatedAt: new Date(data.updated_at as string),
      deletedAt: data.deleted_at ? new Date(data.deleted_at as string) : null,
      trainingPlans: [] // Initialize as empty array, will be populated by resolvers
    } as unknown as Athlete;
  }
};

export class AthleteRepository extends EntityRepository<Athlete> {
  constructor() {
    super(athleteMapping);
  }

  /**
   * Get all athletes for a user with proper field mapping
   */
  async getAthletes(userId: string | null): Promise<Athlete[]> {
    return this.getAll(userId);
  }

  /**
   * Get an athlete by ID with proper field mapping
   */
  async getAthleteById(userId: string | null, athleteId: string): Promise<Athlete | null> {
    return this.getById(userId, athleteId);
  }

  /**
   * Get multiple athletes by their IDs with proper field mapping
   */
  async getAthletesByIds(userId: string | null, athleteIds: string[]): Promise<Athlete[]> {
    return this.getByIds(userId, athleteIds);
  }

  /**
   * Create a new athlete with proper field mapping
   */
  async createAthlete(userId: string | null, athleteData: Partial<Athlete>): Promise<Athlete | null> {
    return this.create(userId, athleteData);
  }

  /**
   * Update an athlete with proper field mapping
   */
  async updateAthlete(userId: string | null, athleteId: string, athleteData: Partial<Athlete>): Promise<Athlete | null> {
    return this.update(userId, athleteId, athleteData);
  }

  /**
   * Calculate age from birthday
   */
  calculateAge(birthday: string): number {
    const birthDate = new Date(birthday);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }
}