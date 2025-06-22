"use client";

import { useCoachRoleInfo } from '@/lib/contexts/coach-role-context';
import { AthletesFilterBar, type AthletesFilterState } from "@/components/athletes-filter-bar";
import { ErrorMessage } from "@/components/ui/error-message";
import { PageCard, PageGrid } from "@/components/ui/page-wrapper";
import type { Athlete } from "@/lib/types";
import { PlusIcon, User } from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { useQuery } from "urql";
import { Button } from "@/components/ui/button";
import { canAddMoreAthletes, getAthleteExceedsLimitMessage } from '@/lib/utils/coach-role-limits';

const AthletesQuery = `
	query {
		athletes {
			id
			sport
			firstName
			lastName
			email
			createdAt
		}
	}
`;

interface AthletesListProps {
  athletes: Athlete[];
  uiMode: 'professional' | 'personal' | 'self';
}

function AthletesList({ athletes, uiMode }: AthletesListProps) {
  // Adjust grid columns based on UI mode
  const columns = uiMode === 'professional' ? 4 : uiMode === 'personal' ? 3 : 2;
  
  return (
    <PageGrid columns={columns}>
      {athletes.map((athlete) => (
        <PageCard
          key={athlete.id}
          href={`/athletes/${athlete.id}`}
          title={`${athlete.firstName} ${athlete.lastName}`}
          subtitle={athlete.sport}
        >&nbsp;</PageCard>
      ))}
    </PageGrid>
  );
}

interface PersonalCoachViewProps {
  athletes: Athlete[];
  canAddMore: boolean;
  maxAthletes: number;
}

function PersonalCoachView({ athletes, canAddMore, maxAthletes }: PersonalCoachViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Your Athletes</h2>
          <p className="text-sm text-muted-foreground">
            {athletes.length} of {maxAthletes} athletes
          </p>
        </div>
        {canAddMore && (
          <Button asChild size="sm">
            <Link href="/athletes/new">
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Athlete
            </Link>
          </Button>
        )}
      </div>
      
      {athletes.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-12 px-6">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted/50">
            <User className="size-8 text-muted-foreground/70" />
          </div>
          <div className="space-y-2 max-w-sm">
            <h3 className="text-lg font-semibold">No athletes yet</h3>
            <p className="text-sm text-muted-foreground">
              Add up to {maxAthletes} athletes to start tracking their progress.
            </p>
          </div>
          <div className="mt-4">
            <Button asChild>
              <Link href="/athletes/new">
                <PlusIcon className="size-4 mr-2" />
                Add First Athlete
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <AthletesList athletes={athletes} uiMode="personal" />
      )}
    </div>
  );
}

interface SelfCoachedViewProps {
  athletes: Athlete[];
  canAddMore: boolean;
}

function SelfCoachedView({ athletes, canAddMore }: SelfCoachedViewProps) {
  const athlete = athletes[0];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">My Training</h2>
        {!athlete && canAddMore && (
          <Button asChild size="sm">
            <Link href="/athletes/new">
              <PlusIcon className="w-4 h-4 mr-2" />
              Set Up Profile
            </Link>
          </Button>
        )}
      </div>
      
      {!athlete ? (
        <div className="flex flex-col items-center justify-center text-center py-12 px-6">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted/50">
            <User className="size-8 text-muted-foreground/70" />
          </div>
          <div className="space-y-2 max-w-sm">
            <h3 className="text-lg font-semibold">Set up your profile</h3>
            <p className="text-sm text-muted-foreground">
              Create your athlete profile to start tracking your training progress.
            </p>
          </div>
          <div className="mt-4">
            <Button asChild>
              <Link href="/athletes/new">
                <PlusIcon className="size-4 mr-2" />
                Create Profile
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">{athlete.firstName} {athlete.lastName}</h3>
            <p className="text-sm text-muted-foreground mb-4">{athlete.sport}</p>
            <div className="space-y-2">
              <Button asChild className="w-full" variant="outline">
                <Link href={`/athletes/${athlete.id}`}>
                  View Profile
                </Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href={`/athletes/${athlete.id}/goals/new`}>
                  Add Goal
                </Link>
              </Button>
            </div>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <Button asChild className="w-full" variant="outline">
                <Link href="/session-logs/new">
                  Log Session
                </Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href="/training-plans">
                  View Plans
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AthletesViewAdapter() {
  const { role, uiMode, displayConfig } = useCoachRoleInfo();
  const [{ data, fetching, error }] = useQuery<{ athletes: Athlete[] }>({
    query: AthletesQuery,
  });

  const [filters, setFilters] = useState<AthletesFilterState>({
    search: "",
    sport: "",
    sortBy: "name",
    sortOrder: "asc",
  });

  const filteredAndSortedAthletes = useMemo(() => {
    if (!data?.athletes) return [];

    let filtered = data.athletes;

    // Apply search filter (only for professional mode)
    if (uiMode === 'professional' && filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (athlete) =>
          athlete.firstName.toLowerCase().includes(searchLower) ||
          athlete.lastName.toLowerCase().includes(searchLower) ||
          (athlete.email && athlete.email.toLowerCase().includes(searchLower))
      );
    }

    // Apply sport filter (only for professional mode)
    if (uiMode === 'professional' && filters.sport) {
      filtered = filtered.filter((athlete) => athlete.sport === filters.sport);
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case "name":
          const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
          const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
          comparison = nameA.localeCompare(nameB);
          break;
        case "sport":
          comparison = a.sport.toLowerCase().localeCompare(b.sport.toLowerCase());
          break;
        case "createdAt":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return filters.sortOrder === "desc" ? -comparison : comparison;
    });

    return filtered;
  }, [data?.athletes, filters, uiMode]);

  // Role-specific logic
  const canAddMore = role ? canAddMoreAthletes(role, data?.athletes?.length || 0) : false;
  const maxAthletes = displayConfig?.maxAthletes || 0;

  if (fetching) return <div className="p-4">Loading athletes...</div>;
  if (error) return <ErrorMessage message={`Error loading athletes: ${error.message}`} />;
  if (!uiMode) return <ErrorMessage message="Unable to determine coaching mode" />;

  // Render based on UI mode
  switch (uiMode) {
    case 'personal':
      return (
        <PersonalCoachView 
          athletes={filteredAndSortedAthletes}
          canAddMore={canAddMore}
          maxAthletes={maxAthletes}
        />
      );
      
    case 'self':
      return (
        <SelfCoachedView 
          athletes={filteredAndSortedAthletes}
          canAddMore={canAddMore}
        />
      );
      
    case 'professional':
    default:
      return (
        <div className="space-y-6">
          <AthletesFilterBar
            filters={filters}
            onFiltersChangeAction={setFilters}
          />

          {filteredAndSortedAthletes.length === 0 && data?.athletes && data.athletes.length > 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No athletes match your current filters.
            </div>
          )}

          {filteredAndSortedAthletes.length === 0 && data?.athletes?.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center py-16 px-6">
              <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-muted/50">
                <PlusIcon className="size-10 text-muted-foreground/70" aria-hidden="true" />
              </div>
              <div className="space-y-2 max-w-sm">
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  No athletes yet
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Create athletes to start tracking their progress and training plans.
                </p>
              </div>
              <div className="mt-6">
                <Button asChild size="lg">
                  <Link href="/athletes/new">
                    <PlusIcon className="size-4" aria-hidden="true" />
                    Create First Athlete
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {filteredAndSortedAthletes.length > 0 && (
            <AthletesList athletes={filteredAndSortedAthletes} uiMode="professional" />
          )}
        </div>
      );
  }
}