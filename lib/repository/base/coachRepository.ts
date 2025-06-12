import { EntityRepository, type EntityMapping } from './entityRepository'
import type { Coach, CreateCoachInput, UpdateCoachInput, AccountStatus } from '@/lib/types'

// Coach-specific column mappings
const coachMapping: EntityMapping<Coach> = {
  tableName: 'coaches',
  columnMappings: {
    userId: 'user_id',
    firstName: 'first_name',
    lastName: 'last_name',
    displayName: 'display_name',
    onboardingCompleted: 'onboarding_completed',
    lastLoginAt: 'last_login_at'
  },
  transform: (data: Record<string, unknown>) => {
    if (!data) return null as unknown as Coach;

    return {
      id: data.id?.toString() || '',
      userId: data.user_id as string,
      email: data.email as string,
      firstName: data.first_name as string | null,
      lastName: data.last_name as string | null,
      displayName: data.display_name as string | null,
      avatar: data.avatar as string | null,
      timezone: data.timezone as string | null,

      onboardingCompleted: data.onboarding_completed as boolean,
      lastLoginAt: data.last_login_at as string | null,
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
      deletedAt: data.deleted_at as string | null,

      // These will be populated by data loaders
      billing: null,
      athletes: [],
      trainingPlans: []
    } as Coach;
  }
};

/**
 * Repository for managing Coach entities.
 * Handles CRUD operations for coach profiles.
 * Coaches are the main users of the platform and own all other entities.
 */
export class CoachRepository extends EntityRepository<Coach> {
  constructor() {
    super(coachMapping);
  }

  /**
   * Creates a new coach profile during onboarding.
   * Sets default account status and profile information.
   * Billing information is handled separately by CoachBillingRepository.
   *
   * @param userId - Supabase auth user UUID
   * @param email - User's email from auth
   * @param input - Optional coach profile data
   * @returns Promise resolving to created coach
   */
  async createCoach(userId: string, email: string, input: CreateCoachInput = {}): Promise<Coach | null> {
    const coachData: Partial<Coach> = {
      userId,
      email,
      firstName: input.firstName || null,
      lastName: input.lastName || null,
      displayName: input.displayName || null,
      avatar: null,
      timezone: input.timezone || 'UTC',
      onboardingCompleted: true,
      lastLoginAt: new Date().toISOString()
    };

    return this.create(userId, coachData);
  }

  /**
   * Gets a coach by their Supabase user ID.
   * Uses the base class getByField method with user_id field.
   *
   * @param userId - Supabase auth user UUID
   * @returns Promise resolving to coach or null if not found
   */
  async getByUserId(userId: string): Promise<Coach | null> {
    const coaches = await this.getByField(null, 'user_id', userId);
    return coaches.length > 0 ? coaches[0] : null;
  }

  /**
   * Updates coach profile information.
   * Note: This method needs custom implementation due to user_id lookup.
   *
   * @param userId - Supabase auth user UUID
   * @param input - Fields to update
   * @returns Promise resolving to updated coach or null
   */
  async updateByUserId(userId: string, input: UpdateCoachInput): Promise<Coach | null> {
    // First get the coach to find their ID
    const coach = await this.getByUserId(userId);
    if (!coach) return null;

    // Convert UpdateCoachInput to Partial<Coach> format
    const updateData: Partial<Coach> = {
      ...(input.firstName !== undefined && { firstName: input.firstName }),
      ...(input.lastName !== undefined && { lastName: input.lastName }),
      ...(input.displayName !== undefined && { displayName: input.displayName }),
      ...(input.avatar !== undefined && { avatar: input.avatar }),
      ...(input.timezone !== undefined && { timezone: input.timezone }),
      ...(input.onboardingCompleted !== undefined && { onboardingCompleted: Boolean(input.onboardingCompleted) })
    };

    // Use the base class update method
    return this.update(userId, coach.id, updateData);
  }

  /**
   * Records last login timestamp.
   *
   * @param userId - Supabase auth user UUID
   * @returns Promise resolving to updated coach or null
   */
  async updateLastLogin(userId: string): Promise<Coach | null> {
    // First get the coach to find their ID
    const coach = await this.getByUserId(userId);
    if (!coach) return null;

    // Use the base class update method with lastLoginAt
    return this.update(userId, coach.id, {
      lastLoginAt: new Date().toISOString()
    });
  }
}