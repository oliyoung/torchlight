"use client";

import { CreateGoalForm } from "@/components/forms/create-goal";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { useRouter } from "next/navigation";
import { useQuery } from "urql";
import { Athlete } from "@/lib/types";

const AthleteQuery = `
  query($id: ID!) {
    athlete(id: $id) {
      id
      firstName
      lastName
      email
      sport
    }
  }
`;

interface AthleteGoalNewPageProps {
  params: {
    id: string;
  };
}

export default function AthleteGoalNewPage({ params }: AthleteGoalNewPageProps) {
  const router = useRouter();
  const athleteId = params.id;
  
  // Query the specific athlete
  const [{ data, fetching, error }] = useQuery<{ athlete: Athlete }>({
    query: AthleteQuery,
    variables: { id: athleteId },
  });
  
  const athlete = data?.athlete;
  
  const handleSuccess = (goalId: string) => {
    // Navigate back to athlete's goals page
    router.push(`/athletes/${athleteId}/goals`);
  };

  const handleCancel = () => {
    // Navigate back to athlete's page
    router.push(`/athletes/${athleteId}`);
  };
  
  if (fetching) {
    return (
      <PageWrapper
        title="New Goal"
        breadcrumbs={[
          { label: "Athletes", href: "/athletes" },
          { label: "Loading...", href: "#" },
          { label: "Goals", href: "#" },
          { label: "New Goal", href: "#" },
        ]}
      >
        <div className="flex items-center justify-center py-8">
          <p>Loading athlete...</p>
        </div>
      </PageWrapper>
    );
  }
  
  if (error || !athlete) {
    return (
      <PageWrapper
        title="New Goal"
        breadcrumbs={[
          { label: "Athletes", href: "/athletes" },
          { label: "Error", href: "#" },
        ]}
      >
        <div className="flex items-center justify-center py-8">
          <p className="text-red-500">
            {error ? `Error loading athlete: ${error.message}` : "Athlete not found"}
          </p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="New Goal"
      breadcrumbs={[
        { label: "Athletes", href: "/athletes" },
        { label: `${athlete.firstName} ${athlete.lastName}`, href: `/athletes/${athleteId}` },
        { label: "Goals", href: `/athletes/${athleteId}/goals` },
        { label: "New Goal", href: "#" },
      ]}
    >
      <div className="space-y-6">
        {/* Show athlete info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            Creating goal for:{" "}
            <span className="font-medium">
              {athlete.firstName} {athlete.lastName}
            </span>
            {athlete.sport && (
              <span className="text-gray-500"> • {athlete.sport}</span>
            )}
          </p>
        </div>
        
        <CreateGoalForm 
          athleteId={athleteId} 
          onSuccess={handleSuccess} 
          onCancel={handleCancel} 
        />
      </div>
    </PageWrapper>
  );
}