// @ts-nocheck
import { EntityRepository } from './entityRepository'
import type { CoachBilling, UpdateCoachBillingInput, SubscriptionStatus, SubscriptionTier } from '@/lib/types'

/**
 * Repository for managing CoachBilling entities.
 * Handles subscription, billing, and usage tracking operations.
 * Integrated with Stripe for payment processing.
 */
export class CoachBillingRepository extends EntityRepository<CoachBilling> {
  protected supabase = this.getClient()
  protected tableName = 'coach_billing'

  constructor() {
    super({
      tableName: 'coach_billing',
      transform: (data: any) => this.mapFromDatabase(data)
    })
  }

  protected getClient() {
    // Access the protected client from parent
    return (this as any).client
  }

  /**
   * Creates billing record for a new coach with default trial settings.
   *
   * @param coachId - Coach ID to create billing for
   * @param email - Coach's email for billing
   * @returns Promise resolving to created billing record
   */
  async createForCoach(coachId: string, email: string): Promise<CoachBilling> {
    const now = new Date()
    const trialEndDate = new Date(now.getTime() + (14 * 24 * 60 * 60 * 1000)) // 14 days from now
    const usageResetDate = new Date(now.getFullYear(), now.getMonth(), 1) // First of current month

    const billingData = {
      coach_id: coachId,

      // Stripe integration - initially null until subscription setup
      stripe_customer_id: null,
      subscription_status: 'TRIAL' as SubscriptionStatus,
      subscription_tier: 'FREE' as SubscriptionTier,
      subscription_start_date: now.toISOString(),
      subscription_end_date: trialEndDate.toISOString(),
      trial_end_date: trialEndDate.toISOString(),
      billing_email: email,

      // Default limits for FREE tier
      monthly_athlete_limit: 5,
      current_athlete_count: 0,
      monthly_session_log_limit: 50,
      current_session_log_count: 0,
      ai_credits_remaining: 100,
      usage_reset_date: usageResetDate.toISOString(),

      // Billing metadata
      last_payment_date: null,
      next_billing_date: trialEndDate.toISOString(),
      billing_cycle_day: 1,
      currency: 'USD',

      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      deleted_at: null
    }

    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert(billingData)
      .select()
      .single()

    if (error) throw error

    return this.mapFromDatabase(data)
  }

  /**
   * Gets billing record by coach ID.
   *
   * @param coachId - Coach ID to get billing for
   * @returns Promise resolving to billing record or null
   */
  async getByCoachId(coachId: string): Promise<CoachBilling | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('coach_id', coachId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    return this.mapFromDatabase(data)
  }

  /**
   * Updates billing information from Stripe webhooks.
   *
   * @param coachId - Coach ID to update billing for
   * @param input - Billing data to update
   * @returns Promise resolving to updated billing record
   */
  async updateByCoachId(coachId: string, input: UpdateCoachBillingInput): Promise<CoachBilling> {
    const updateData = {
      ...input.stripeCustomerId !== undefined && { stripe_customer_id: input.stripeCustomerId },
      ...input.subscriptionStatus !== undefined && { subscription_status: input.subscriptionStatus },
      ...input.subscriptionTier !== undefined && { subscription_tier: input.subscriptionTier },
      ...input.subscriptionStartDate !== undefined && { subscription_start_date: input.subscriptionStartDate },
      ...input.subscriptionEndDate !== undefined && { subscription_end_date: input.subscriptionEndDate },
      ...input.trialEndDate !== undefined && { trial_end_date: input.trialEndDate },
      ...input.billingEmail !== undefined && { billing_email: input.billingEmail },
      ...input.monthlyAthleteLimit !== undefined && { monthly_athlete_limit: input.monthlyAthleteLimit },
      ...input.monthlySessionLogLimit !== undefined && { monthly_session_log_limit: input.monthlySessionLogLimit },
      ...input.aiCreditsRemaining !== undefined && { ai_credits_remaining: input.aiCreditsRemaining },
      ...input.lastPaymentDate !== undefined && { last_payment_date: input.lastPaymentDate },
      ...input.nextBillingDate !== undefined && { next_billing_date: input.nextBillingDate },
      ...input.billingCycleDay !== undefined && { billing_cycle_day: input.billingCycleDay },
      ...input.currency !== undefined && { currency: input.currency },
      updated_at: new Date().toISOString()
    }

    const { data, error } = await this.supabase
      .from(this.tableName)
      .update(updateData)
      .eq('coach_id', coachId)
      .eq('deleted_at', null)
      .select()
      .single()

    if (error) throw error

    return this.mapFromDatabase(data)
  }

  /**
   * Updates usage counters and handles monthly resets.
   *
   * @param coachId - Coach ID to update usage for
   * @param updates - Usage counter updates
   * @returns Promise resolving to updated billing record
   */
  async updateUsageCounters(coachId: string, updates: {
    currentAthleteCount?: number
    currentSessionLogCount?: number
    aiCreditsRemaining?: number
  }): Promise<CoachBilling> {
    const updateData = {
      ...updates.currentAthleteCount !== undefined && { current_athlete_count: updates.currentAthleteCount },
      ...updates.currentSessionLogCount !== undefined && { current_session_log_count: updates.currentSessionLogCount },
      ...updates.aiCreditsRemaining !== undefined && { ai_credits_remaining: updates.aiCreditsRemaining },
      updated_at: new Date().toISOString()
    }

    const { data, error } = await this.supabase
      .from(this.tableName)
      .update(updateData)
      .eq('coach_id', coachId)
      .eq('deleted_at', null)
      .select()
      .single()

    if (error) throw error

    return this.mapFromDatabase(data)
  }

  /**
   * Resets monthly usage counters for all coaches.
   * Called by a scheduled job at the beginning of each month.
   *
   * @returns Promise resolving to number of records updated
   */
  async resetMonthlyUsage(): Promise<number> {
    const now = new Date()
    const usageResetDate = new Date(now.getFullYear(), now.getMonth(), 1)

    const { data, error } = await this.supabase
      .from(this.tableName)
      .update({
        current_athlete_count: 0,
        current_session_log_count: 0,
        usage_reset_date: usageResetDate.toISOString(),
        updated_at: now.toISOString()
      })
      .eq('deleted_at', null)
      .select('id')

    if (error) throw error

    return data?.length || 0
  }

  /**
   * Checks if coach has reached their subscription limits.
   *
   * @param coachId - Coach ID to check limits for
   * @returns Promise resolving to limit check results
   */
  async checkLimits(coachId: string): Promise<{
    canCreateAthlete: boolean
    canCreateSessionLog: boolean
    canUseAI: boolean
    athletesRemaining: number
    sessionLogsRemaining: number
    aiCreditsRemaining: number
  }> {
    const billing = await this.getByCoachId(coachId)
    if (!billing) {
      throw new Error('Billing record not found for coach')
    }

    const athletesRemaining = Math.max(0, billing.monthlyAthleteLimit - billing.currentAthleteCount)
    const sessionLogsRemaining = Math.max(0, billing.monthlySessionLogLimit - billing.currentSessionLogCount)
    const aiCreditsRemaining = billing.aiCreditsRemaining || 0

    return {
      canCreateAthlete: athletesRemaining > 0,
      canCreateSessionLog: sessionLogsRemaining > 0,
      canUseAI: aiCreditsRemaining > 0,
      athletesRemaining,
      sessionLogsRemaining,
      aiCreditsRemaining
    }
  }

  /**
   * Gets billing records that need usage reset (monthly job).
   *
   * @returns Promise resolving to billing records needing reset
   */
  async getBillingNeedingUsageReset(): Promise<CoachBilling[]> {
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .lt('usage_reset_date', currentMonthStart.toISOString())
      .eq('deleted_at', null)

    if (error) throw error

    return data.map(row => this.mapFromDatabase(row))
  }

  /**
   * Maps database row to CoachBilling type with proper field transformations.
   */
  protected mapFromDatabase(row: any): CoachBilling {
    return {
      id: row.id.toString(),
      coachId: row.coach_id.toString(),

      // Stripe integration
      stripeCustomerId: row.stripe_customer_id,
      subscriptionStatus: row.subscription_status,
      subscriptionTier: row.subscription_tier,
      subscriptionStartDate: row.subscription_start_date,
      subscriptionEndDate: row.subscription_end_date,
      trialEndDate: row.trial_end_date,
      billingEmail: row.billing_email,

      // Usage tracking
      monthlyAthleteLimit: row.monthly_athlete_limit,
      currentAthleteCount: row.current_athlete_count,
      monthlySessionLogLimit: row.monthly_session_log_limit,
      currentSessionLogCount: row.current_session_log_count,
      aiCreditsRemaining: row.ai_credits_remaining,
      usageResetDate: row.usage_reset_date,

      // Billing metadata
      lastPaymentDate: row.last_payment_date,
      nextBillingDate: row.next_billing_date,
      billingCycleDay: row.billing_cycle_day,
      currency: row.currency,

      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at
    }
  }
}