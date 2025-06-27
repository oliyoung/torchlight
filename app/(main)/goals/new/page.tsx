"use client";

import { CreateGoalForm } from "@/components/forms/create-goal";
import { GoalEvaluationDisplay } from "@/components/ui/goal-evaluation-display";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { GoalEvaluationResponse } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function NewGoalPage() {
  const router = useRouter();

  const handleSuccess = (goalId: string) => {
    // router.push("/goals");

  };

  const handleCancel = () => {
    router.push("/goals");
  };

  return (
    <PageWrapper
      title="Construct New Goal"
      breadcrumbs={[
        { label: "Goals", href: "/goals" },
        { label: "New Goal", href: "#" },
      ]}
    >
      <CreateGoalForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </PageWrapper>
  );
}