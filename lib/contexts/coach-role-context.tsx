"use client";

import { createContext, useContext, type ReactNode } from 'react';
import type { Coach, CoachRole } from '@/lib/types';
import { getUIModeForRole, getRoleDisplayConfig } from '@/lib/utils/coach-role-limits';

interface CoachRoleContextValue {
  coach: Coach | null;
  role: CoachRole | null;
  uiMode: 'professional' | 'personal' | 'self' | null;
  displayConfig: ReturnType<typeof getRoleDisplayConfig> | null;
  isLoading: boolean;
}

const CoachRoleContext = createContext<CoachRoleContextValue | undefined>(undefined);

interface CoachRoleProviderProps {
  children: ReactNode;
  coach: Coach | null;
  isLoading?: boolean;
}

export function CoachRoleProvider({ children, coach, isLoading = false }: CoachRoleProviderProps) {
  const role = coach?.role || null;
  const uiMode = role ? getUIModeForRole(role) : null;
  const displayConfig = role ? getRoleDisplayConfig(role) : null;

  const value: CoachRoleContextValue = {
    coach,
    role,
    uiMode,
    displayConfig,
    isLoading,
  };

  return (
    <CoachRoleContext.Provider value={value}>
      {children}
    </CoachRoleContext.Provider>
  );
}

export function useCoachRole() {
  const context = useContext(CoachRoleContext);
  if (context === undefined) {
    throw new Error('useCoachRole must be used within a CoachRoleProvider');
  }
  return context;
}

/**
 * Hook to get coach role-specific information
 */
export function useCoachRoleInfo() {
  const { role, uiMode, displayConfig } = useCoachRole();
  
  return {
    role,
    uiMode,
    displayConfig,
    isProfessional: uiMode === 'professional',
    isPersonal: uiMode === 'personal',
    isSelf: uiMode === 'self',
  };
}