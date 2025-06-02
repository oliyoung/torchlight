import { EntityRepository } from './entityRepository'
import type { Coach, CreateCoachInput, UpdateCoachInput, AccountStatus } from '@/lib/types'

/**
 * Repository for managing Coach entities.
 * Handles CRUD operations for coach profiles.
 * Coaches are the main users of the platform and own all other entities.
 */
export class CoachRepository extends EntityRepository<Coach> {
  protected supabase = this.getClient()
  protected tableName = 'coaches'

  constructor() {
    super({
      tableName: 'coaches',
      transform: (data: any) => this.mapFromDatabase(data)
    })
  }

  protected getClient() {
    // Access the protected client from parent
    return (this as any).client
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
  async createCoach(userId: string, email: string, input: CreateCoachInput = {}): Promise<Coach> {
    console.log('Entering createCoach with:', { userId, email, input });
    const now = new Date()

    const coachData = {
      user_id: userId,
      email,
      first_name: input.firstName || null,
      last_name: input.lastName || null,
      display_name: input.displayName || null,
      avatar: null,
      timezone: input.timezone || 'UTC',

      // Account management
      account_status: 'ACTIVE' as AccountStatus,
      onboarding_completed: false,
      last_login_at: now ? now.toISOString() : null,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      deleted_at: null
    }

    console.log('createCoach - inserting coachData:', coachData);

    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert(coachData)
      .select()
      .single()

    if (error) throw error

    return this.mapFromDatabase(data)
  }

  /**
   * Gets a coach by their Supabase user ID.
   *
   * @param userId - Supabase auth user UUID
   * @returns Promise resolving to coach or null if not found
   */
  async getByUserId(userId: string): Promise<Coach | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .single()

    console.log('getByUserId - raw data:', data);

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    return this.mapFromDatabase(data)
  }

  /**
   * Updates coach profile information.
   *
   * @param userId - Supabase auth user UUID
   * @param input - Fields to update
   * @returns Promise resolving to updated coach
   */
  async updateByUserId(userId: string, input: UpdateCoachInput): Promise<Coach> {
    const updateData = {
      ...input.firstName !== undefined && { first_name: input.firstName },
      ...input.lastName !== undefined && { last_name: input.lastName },
      ...input.displayName !== undefined && { display_name: input.displayName },
      ...input.avatar !== undefined && { avatar: input.avatar },
      ...input.timezone !== undefined && { timezone: input.timezone },
      ...input.onboardingCompleted !== undefined && { onboarding_completed: input.onboardingCompleted },
      updated_at: new Date()
    }

    console.log('updateByUserId - updating with updateData:', updateData);

    const { data, error } = await this.supabase
      .from(this.tableName)
      .update(updateData)
      .eq('user_id', userId)
      .eq('deleted_at', null)
      .select()
      .single()

    if (error) throw error

    return this.mapFromDatabase(data)
  }

  /**
   * Records last login timestamp.
   *
   * @param userId - Supabase auth user UUID
   * @returns Promise resolving to updated coach
   */
  async updateLastLogin(userId: string): Promise<Coach> {
    const updateData = {
      last_login_at: new Date(),
      updated_at: new Date()
    }

    const { data, error } = await this.supabase
      .from(this.tableName)
      .update(updateData)
      .eq('user_id', userId)
      .eq('deleted_at', null)
      .select()
      .single()

    if (error) throw error

    return this.mapFromDatabase(data)
  }

  /**
   * Maps database row to Coach type with proper field transformations.
   */
  protected mapFromDatabase(row: any): Coach {
    return {
      id: row.id.toString(),
      userId: row.user_id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      displayName: row.display_name,
      avatar: row.avatar,
      timezone: row.timezone,

      // Account management
      accountStatus: row.account_status,
      onboardingCompleted: row.onboarding_completed,
      lastLoginAt: row.last_login_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,

      // These will be populated by data loaders
      billing: null, // Will be populated by data loader
      athletes: [],
      trainingPlans: []
    }
  }
}