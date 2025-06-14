import { EntityRepository, type EntityMapping } from './entityRepository'
import type { CoachBilling, UpdateCoachBillingInput, SubscriptionStatus, SubscriptionTier } from '@/lib/types'

// CoachBilling-specific column mappings
const coachBillingMapping: EntityMapping<CoachBilling> = {
  tableName: 'coach_billing',
  columnMappings: {
    coachId: 'coach_id',
    stripeCustomerId: 'stripe_customer_id',
    subscriptionStatus: 'subscription_status',
    subscriptionTier: 'subscription_tier',
    subscriptionStartDate: 'subscription_start_date',
    subscriptionEndDate: 'subscription_end_date',
    trialEndDate: 'trial_end_date',
    billingEmail: 'billing_email',
    monthlyAthleteLimit: 'monthly_athlete_limit',
    currentAthleteCount: 'current_athlete_count',
    monthlySessionLogLimit: 'monthly_session_log_limit',
    currentSessionLogCount: 'current_session_log_count',
    aiCreditsRemaining: 'ai_credits_remaining',
    usageResetDate: 'usage_reset_date',
    lastPaymentDate: 'last_payment_date',
    nextBillingDate: 'next_billing_date',
    billingCycleDay: 'billing_cycle_day'
  },
  transform: (data: Record<string, unknown>) => {
    if (!data) return null as unknown as CoachBilling;

    return {
      id: data.id?.toString() || '',

      // Stripe integration
      stripeCustomerId: data.stripe_customer_id as string | null,
      subscriptionStatus: data.subscription_status as SubscriptionStatus,
      subscriptionTier: data.subscription_tier as SubscriptionTier,
      subscriptionStartDate: data.subscription_start_date as string | null,
      subscriptionEndDate: data.subscription_end_date as string | null,
      trialEndDate: data.trial_end_date as string | null,
      billingEmail: data.billing_email as string | null,

      // Usage tracking
      monthlyAthleteLimit: data.monthly_athlete_limit as number,
      currentAthleteCount: data.current_athlete_count as number,
      monthlySessionLogLimit: data.monthly_session_log_limit as number,
      currentSessionLogCount: data.current_session_log_count as number,
      aiCreditsRemaining: data.ai_credits_remaining as number | null,
      usageResetDate: data.usage_reset_date as string,

      // Billing metadata
      lastPaymentDate: data.last_payment_date as string | null,
      nextBillingDate: data.next_billing_date as string | null,
      billingCycleDay: data.billing_cycle_day as number | null,
      currency: data.currency as string,

      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
      deletedAt: data.deleted_at as string | null,

      // Will be populated by data loader
      coach: undefined as any
    } as CoachBilling;
  }
};

/**
 * Repository for managing CoachBilling entities.
 * Handles subscription, billing, and usage tracking operations.
 * Integrated with Stripe for payment processing.
 */
export class CoachBillingRepository extends EntityRepository<CoachBilling> {
  constructor() {
    super(coachBillingMapping);
  }

  /**
   * Creates billing record for a new coach with default trial settings.
   *
   * @param coachId - Coach ID to create billing for
   * @param email - Coach's email for billing
   * @returns Promise resolving to created billing record
   */
  async createForCoach(coachId: string, email: string): Promise<CoachBilling | null> {
    const now = new Date();
    const trialEndDate = new Date(now.getTime() + (14 * 24 * 60 * 60 * 1000)); // 14 days from now
    const usageResetDate = new Date(now.getFullYear(), now.getMonth(), 1); // First of current month

    // Create raw data object for database insertion
    const billingData = {
      coach_id: coachId, // Use database field name directly

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
      currency: 'USD'
    };

    // Use the base class create method with raw database data
    return this.create(null, billingData as any);
  }

  /**
   * Gets billing record by coach ID.
   * Uses the base class getByField method with coach_id field.
   *
   * @param coachId - Coach ID to get billing for
   * @returns Promise resolving to billing record or null
   */
  async getByCoachId(coachId: string): Promise<CoachBilling | null> {
    const billingRecords = await this.getByField(null, 'coach_id', coachId);
    return billingRecords.length > 0 ? billingRecords[0] : null;
  }

  /**
   * Updates billing information from Stripe webhooks.
   *
   * @param coachId - Coach ID to update billing for
   * @param input - Billing data to update
   * @returns Promise resolving to updated billing record or null
   */
  async updateByCoachId(coachId: string, input: UpdateCoachBillingInput): Promise<CoachBilling | null> {
    // First get the billing record to find its ID
    const billing = await this.getByCoachId(coachId);
    if (!billing) return null;

    // Convert UpdateCoachBillingInput to raw database format
    const updateData: Record<string, unknown> = {};

    if (input.stripeCustomerId !== undefined) updateData.stripe_customer_id = input.stripeCustomerId;
    if (input.subscriptionStatus !== undefined) updateData.subscription_status = input.subscriptionStatus;
    if (input.subscriptionTier !== undefined) updateData.subscription_tier = input.subscriptionTier;
    if (input.subscriptionStartDate !== undefined) updateData.subscription_start_date = input.subscriptionStartDate;
    if (input.subscriptionEndDate !== undefined) updateData.subscription_end_date = input.subscriptionEndDate;
    if (input.trialEndDate !== undefined) updateData.trial_end_date = input.trialEndDate;
    if (input.billingEmail !== undefined) updateData.billing_email = input.billingEmail;
    if (input.monthlyAthleteLimit !== undefined) updateData.monthly_athlete_limit = input.monthlyAthleteLimit;
    if (input.monthlySessionLogLimit !== undefined) updateData.monthly_session_log_limit = input.monthlySessionLogLimit;
    if (input.aiCreditsRemaining !== undefined) updateData.ai_credits_remaining = input.aiCreditsRemaining;
    if (input.lastPaymentDate !== undefined) updateData.last_payment_date = input.lastPaymentDate;
    if (input.nextBillingDate !== undefined) updateData.next_billing_date = input.nextBillingDate;
    if (input.billingCycleDay !== undefined) updateData.billing_cycle_day = input.billingCycleDay;
    if (input.currency !== undefined) updateData.currency = input.currency;

    // Use the base class update method
    return this.update(null, billing.id, updateData as any);
  }

  /**
   * Updates usage counters and handles monthly resets.
   *
   * @param coachId - Coach ID to update usage for
   * @param updates - Usage counter updates
   * @returns Promise resolving to updated billing record or null
   */
  async updateUsageCounters(coachId: string, updates: {
    currentAthleteCount?: number
    currentSessionLogCount?: number
    aiCreditsRemaining?: number
  }): Promise<CoachBilling | null> {
    // First get the billing record to find its ID
    const billing = await this.getByCoachId(coachId);
    if (!billing) return null;

    // Convert to raw database format
    const updateData: Record<string, unknown> = {};
    if (updates.currentAthleteCount !== undefined) updateData.current_athlete_count = updates.currentAthleteCount;
    if (updates.currentSessionLogCount !== undefined) updateData.current_session_log_count = updates.currentSessionLogCount;
    if (updates.aiCreditsRemaining !== undefined) updateData.ai_credits_remaining = updates.aiCreditsRemaining;

    // Use the base class update method
    return this.update(null, billing.id, updateData as any);
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
    const billing = await this.getByCoachId(coachId);
    if (!billing) {
      throw new Error('Billing record not found for coach');
    }

    const athletesRemaining = Math.max(0, billing.monthlyAthleteLimit - billing.currentAthleteCount);
    const sessionLogsRemaining = Math.max(0, billing.monthlySessionLogLimit - billing.currentSessionLogCount);
    const aiCreditsRemaining = billing.aiCreditsRemaining ?? 0;

    return {
      canCreateAthlete: athletesRemaining > 0,
      canCreateSessionLog: sessionLogsRemaining > 0,
      canUseAI: aiCreditsRemaining > 0,
      athletesRemaining,
      sessionLogsRemaining,
      aiCreditsRemaining
    };
  }
}