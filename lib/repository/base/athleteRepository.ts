import type { Athlete } from "@/lib/types";
import { type EntityMapping, EntityRepository } from "./entityRepository";

// Athlete-specific column mappings
const athleteMapping: EntityMapping<Athlete> = {
  tableName: 'athletes',
  columnMappings: {
    firstName: 'first_name',
    lastName: 'last_name',
    emergencyContactName: 'emergency_contact_name',
    emergencyContactPhone: 'emergency_contact_phone',
    fitnessLevel: 'fitness_level',
    trainingHistory: 'training_history',
    goalsSummary: 'goals_summary',
    preferredTrainingTime: 'preferred_training_time',
    medicalConditions: 'medical_conditions'
    // Note: Athletes don't have userId field - they're scoped via coach_id and RLS
  }
  // No custom transform needed - auto-transform handles all field mappings and date conversions
};

export class AthleteRepository extends EntityRepository<Athlete> {
  constructor() {
    super(athleteMapping);
  }

  // Override base methods to include age calculation in SQL queries

  /**
   * Get all athletes for a coach with calculated age
   */
  async getAthletes(userId: string | null): Promise<Athlete[]> {
    try {
      let query = this.client
        .from(this.entityMapping.tableName)
        .select(`
          *,
          CASE
            WHEN birthday IS NOT NULL
            THEN EXTRACT(YEAR FROM AGE(birthday))::int
            ELSE NULL
          END as age
        `);

      query = this.withUserFilter(query, userId);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching athletes with age:', error);
        return [];
      }

      return this.transformArray(data);
    } catch (error) {
      console.error('Exception fetching athletes with age:', error);
      return [];
    }
  }

  /**
   * Get athlete by ID with calculated age
   */
  async getAthleteById(userId: string | null, id: string): Promise<Athlete | null> {
    try {
      let query = this.client
        .from(this.entityMapping.tableName)
        .select(`
          *,
          CASE
            WHEN birthday IS NOT NULL
            THEN EXTRACT(YEAR FROM AGE(birthday))::int
            ELSE NULL
          END as age
        `)
        .eq('id', id);

      query = this.withUserFilter(query, userId);

      const { data, error } = await query.single();

      if (error) {
        console.error('Error fetching athlete with age:', error);
        return null;
      }

      return this.transformResponse(data);
    } catch (error) {
      console.error('Exception fetching athlete with age:', error);
      return null;
    }
  }

  /**
   * Get athletes by IDs with calculated age
   */
  async getAthletesByIds(userId: string | null, ids: string[]): Promise<Athlete[]> {
    if (!ids.length) return [];

    try {
      let query = this.client
        .from(this.entityMapping.tableName)
        .select(`
          *,
          CASE
            WHEN birthday IS NOT NULL
            THEN EXTRACT(YEAR FROM AGE(birthday))::int
            ELSE NULL
          END as age
        `)
        .in('id', ids);

      query = this.withUserFilter(query, userId);

      const { data, error } = await query;

      if (error) {
        console.error('Error batch loading athletes with age:', error);
        return [];
      }

      return this.transformArray(data);
    } catch (error) {
      console.error('Exception batch loading athletes with age:', error);
      return [];
    }
  }

  /**
   * Create a new athlete
   */
  async createAthlete(userId: string | null, input: Partial<Athlete>): Promise<Athlete | null> {
    return this.create(userId, input);
  }

  /**
   * Update an athlete
   */
  async updateAthlete(userId: string | null, id: string, input: Partial<Athlete>): Promise<Athlete | null> {
    return this.update(userId, id, input);
  }

  /**
   * Delete an athlete
   */
  async deleteAthlete(userId: string | null, id: string): Promise<boolean> {
    return this.delete(userId, id);
  }

  /**
   * Calculate age from birthday
   */
  calculateAge(birthday: string): number {
    const birthDate = new Date(birthday);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // If birthday hasn't occurred this year yet, subtract 1
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }
}