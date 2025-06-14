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

  /**
   * Get the select clause with age calculation
   */
  private getSelectWithAge(): string {
    return `
      *,
      CASE
        WHEN birthday IS NOT NULL
        THEN EXTRACT(YEAR FROM AGE(birthday))::int
        ELSE NULL
      END as age
    `;
  }

  /**
   * Execute a query with age calculation and proper error handling
   */
  private async executeQueryWithAge<T>(
    queryBuilder: () => any,
    errorMessage: string,
    isSingle = false
  ): Promise<T> {
    try {
      const query = queryBuilder();
      const { data, error } = isSingle ? await query.single() : await query;

      if (error) {
        console.error(`${errorMessage}:`, error);
        return (isSingle ? null : []) as T;
      }

      return (isSingle ? this.transformResponse(data) : this.transformArray(data)) as T;
    } catch (error) {
      console.error(`Exception ${errorMessage.toLowerCase()}:`, error);
      return (isSingle ? null : []) as T;
    }
  }

  /**
   * Get all athletes for a coach with calculated age
   */
  async getAthletes(coachId: string | null): Promise<Athlete[]> {
    return this.executeQueryWithAge<Athlete[]>(
      () => {
        let query = this.client
          .from(this.entityMapping.tableName)
          .select(this.getSelectWithAge());
        return this.withUserFilter(query, coachId);
      },
      'Error fetching athletes with age'
    );
  }

  /**
   * Get athlete by ID with calculated age
   */
  async getAthleteById(coachId: string | null, id: string): Promise<Athlete | null> {
    return this.executeQueryWithAge<Athlete | null>(
      () => {
        let query = this.client
          .from(this.entityMapping.tableName)
          .select(this.getSelectWithAge())
          .eq('id', id);
        return this.withUserFilter(query, coachId);
      },
      'Error fetching athlete with age',
      true
    );
  }

  /**
   * Get athletes by IDs with calculated age
   */
  async getAthletesByIds(coachId: string | null, ids: string[]): Promise<Athlete[]> {
    if (!ids.length) return [];

    return this.executeQueryWithAge<Athlete[]>(
      () => {
        let query = this.client
          .from(this.entityMapping.tableName)
          .select(this.getSelectWithAge())
          .in('id', ids);
        return this.withUserFilter(query, coachId);
      },
      'Error batch loading athletes with age'
    );
  }

  /**
   * Create a new athlete
   */
  async createAthlete(coachId: string | null, input: Partial<Athlete>): Promise<Athlete | null> {
    return this.create(coachId, input);
  }

  /**
   * Update an athlete with calculated age
   */
  async updateAthlete(coachId: string | null, id: string, input: Partial<Athlete>): Promise<Athlete | null> {
    if (!coachId) {
      console.warn('Attempted to update athlete without coachId');
      return null;
    }

    try {
      // Filter out undefined/null values to avoid overwriting with nulls
      const filteredInput = Object.fromEntries(
        Object.entries(input).filter(([_, value]) => value !== undefined && value !== null)
      ) as Partial<Athlete>;

      // Check if we have any fields to update after filtering
      if (Object.keys(filteredInput).length === 0) {
        console.warn(`No valid fields to update for athlete ${id}`);
        // Return the existing record with age calculation
        return this.getAthleteById(coachId, id);
      }

      const dbData = this.mapToDbColumns(filteredInput);

      let query = this.client
        .from(this.entityMapping.tableName)
        .update(dbData)
        .eq('id', id);

      query = this.withUserFilter(query, coachId);

      // Use our custom select with age calculation
      const { data, error } = await query
        .select(this.getSelectWithAge())
        .maybeSingle();

      if (error) {
        console.error('Error updating athlete:', error);
        return null;
      }

      if (!data) {
        console.warn(`No rows affected when updating athlete ${id}`);
        return null;
      }

      return this.transformResponse(data);
    } catch (error) {
      console.error('Exception updating athlete:', error);
      return null;
    }
  }

  /**
   * Delete an athlete
   */
  async deleteAthlete(coachId: string | null, id: string): Promise<boolean> {
    return this.delete(coachId, id);
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