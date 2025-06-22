import type { CoachRole } from '@/lib/types';

/**
 * Configuration for coach role limits and UI behavior
 */
export const COACH_ROLE_CONFIG = {
  PROFESSIONAL: {
    maxAthletes: Number.MAX_SAFE_INTEGER, // Unlimited
    displayName: 'Professional Coach',
    description: 'Professional coach managing unlimited athletes with full features',
    uiMode: 'professional' as const,
  },
  PERSONAL: {
    maxAthletes: 3,
    displayName: 'Personal Coach',
    description: 'Personal coach (parent) managing up to 3 athletes with simplified UI',
    uiMode: 'personal' as const,
  },
  SELF: {
    maxAthletes: 1,
    displayName: 'Self-Coached',
    description: 'Individual managing their own training with personal dashboard',
    uiMode: 'self' as const,
  },
} as const;

/**
 * Get the maximum number of athletes allowed for a coach role
 */
export function getMaxAthletesForRole(role: CoachRole): number {
  return COACH_ROLE_CONFIG[role].maxAthletes;
}

/**
 * Check if a coach can add more athletes based on their role and current count
 */
export function canAddMoreAthletes(role: CoachRole, currentAthleteCount: number): boolean {
  const maxAthletes = getMaxAthletesForRole(role);
  return currentAthleteCount < maxAthletes;
}

/**
 * Get the UI mode for a coach role
 */
export function getUIModeForRole(role: CoachRole): 'professional' | 'personal' | 'self' {
  return COACH_ROLE_CONFIG[role].uiMode;
}

/**
 * Get display configuration for a coach role
 */
export function getRoleDisplayConfig(role: CoachRole) {
  return {
    displayName: COACH_ROLE_CONFIG[role].displayName,
    description: COACH_ROLE_CONFIG[role].description,
    maxAthletes: COACH_ROLE_CONFIG[role].maxAthletes,
    uiMode: COACH_ROLE_CONFIG[role].uiMode,
  };
}

/**
 * Validate if athlete count is within limits for role
 */
export function validateAthleteLimit(role: CoachRole, athleteCount: number): {
  isValid: boolean;
  maxAllowed: number;
  message?: string;
} {
  const maxAthletes = getMaxAthletesForRole(role);
  const isValid = athleteCount <= maxAthletes;
  
  if (!isValid) {
    const roleConfig = COACH_ROLE_CONFIG[role];
    return {
      isValid: false,
      maxAllowed: maxAthletes,
      message: `${roleConfig.displayName} accounts are limited to ${maxAthletes} athlete${maxAthletes === 1 ? '' : 's'}.`,
    };
  }
  
  return {
    isValid: true,
    maxAllowed: maxAthletes,
  };
}

/**
 * Get appropriate error message when athlete limit is exceeded
 */
export function getAthleteExceedsLimitMessage(role: CoachRole): string {
  const config = COACH_ROLE_CONFIG[role];
  const limit = config.maxAthletes;
  
  if (limit === 1) {
    return `${config.displayName} accounts can only manage 1 athlete (yourself).`;
  }
  
  return `${config.displayName} accounts are limited to ${limit} athletes.`;
}