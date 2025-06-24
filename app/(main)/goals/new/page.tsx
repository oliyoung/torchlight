"use client";

import { CreateGoalForm } from "@/components/forms/create-goal";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { useRouter } from "next/navigation";

export default function NewGoalPage() {
  const router = useRouter();

  const handleSuccess = (goalId: string) => {
    router.push("/goals");
  };

  const handleCancel = () => {
    router.push("/goals");
  };

  return (
    <PageWrapper
      title="Create New Goal"
      description="Create a goal for an athlete"
      breadcrumbs={[
        { label: "Goals", href: "/goals" },
        { label: "New Goal", href: "#" },
      ]}
    >
      <div className="max-w-2xl mx-auto">
        <CreateGoalForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </PageWrapper>
  );
}