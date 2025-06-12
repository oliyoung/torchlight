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

  // Inherited methods from EntityRepository provide all basic CRUD operations:
  // - getAll(userId) -> getAthletes
  // - getById(userId, id) -> getAthleteById
  // - getByIds(userId, ids) -> getAthletesByIds
  // - create(userId, data) -> createAthlete
  // - update(userId, id, data) -> updateAthlete

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