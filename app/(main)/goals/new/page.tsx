"use client";

import { CreateGoalForm } from "@/components/forms/create-goal";
import { GoalEvaluationDisplay } from "@/components/ui/goal-evaluation-display";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { GoalEvaluationResponse } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "urql";
import { useCoachRoleInfo } from "@/lib/contexts/coach-role-context";
import { Athlete } from "@/lib/types";
import { AthleteCombobox } from "@/components/ui/athlete-combobox";
import { useState, useEffect } from "react";

const AthletesQuery = `
  query {
    athletes {
      id
      firstName
      lastName
      email
      sport
      createdAt
    }
  }
`;

export default function NewGoalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSelf } = useCoachRoleInfo();
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);

  // Query all athletes
  const [{ data, fetching, error }] = useQuery<{ athletes: Athlete[] }>({
    query: AthletesQuery,
  });

  const athletes = data?.athletes || [];

  // Determine athlete ID from URL param or solo mode
  useEffect(() => {
    const athleteIdFromUrl = searchParams.get('athleteId');

    if (athleteIdFromUrl) {
      // Use athlete ID from URL parameter
      setSelectedAthleteId(athleteIdFromUrl);
    } else if (isSelf || athletes.length === 1) {
      // Solo mode: use the only available athlete
      if (athletes.length === 1) {
        setSelectedAthleteId(athletes[0].id);
      }
    }
  }, [searchParams, isSelf, athletes]);

  const handleSuccess = (goalId: string) => {
    // Navigate to the goal or goals list
    if (selectedAthleteId) {
      router.push(`/athletes/${selectedAthleteId}/goals`);
    } else {
      router.push("/goals");
    }
  };

  const handleCancel = () => {
    if (selectedAthleteId) {
      router.push(`/athletes/${selectedAthleteId}`);
    } else {
      router.push("/goals");
    }
  };

  const handleAthleteSelect = (athleteId: string) => {
    setSelectedAthleteId(athleteId);
  };

  if (fetching) {
    return (
      <PageWrapper
        title="Construct New Goal"
        breadcrumbs={[
          { label: "Goals", href: "/goals" },
          { label: "New Goal", href: "#" },
        ]}
      >
        <div className="flex items-center justify-center py-8">
          <p>Loading athletes...</p>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper
        title="Construct New Goal"
        breadcrumbs={[
          { label: "Goals", href: "/goals" },
          { label: "New Goal", href: "#" },
        ]}
      >
        <div className="flex items-center justify-center py-8">
          <p className="text-red-500">Error loading athletes: {error.message}</p>
        </div>
      </PageWrapper>
    );
  }

  if (athletes.length === 0) {
    return (
      <PageWrapper
        title="Construct New Goal"
        breadcrumbs={[
          { label: "Goals", href: "/goals" },
          { label: "New Goal", href: "#" },
        ]}
      >
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <p>No athletes found. You need to create an athlete first.</p>
          <button
            onClick={() => router.push('/athletes/new')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create Athlete
          </button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Construct New Goal"
      breadcrumbs={[
        { label: "Goals", href: "/goals" },
        { label: "New Goal", href: "#" },
      ]}
    >
      <div className="space-y-6">
        {/* Show athlete selector only if not in solo mode and not pre-selected */}
        {!isSelf && athletes.length > 1 && !searchParams.get('athleteId') && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Athlete</label>
            <AthleteCombobox
              onChange={handleAthleteSelect} value={selectedAthleteId ?? ''} />
          </div>
        )}

        {/* Only show form when athlete is selected */}
        {selectedAthleteId ? (
          <CreateGoalForm
            athleteId={selectedAthleteId}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Please select an athlete to create a goal.</p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}