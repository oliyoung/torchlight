import { Suspense } from "react";
import { PageWrapper } from "@/components/ui/page-wrapper";
import NewTrainingPlanForm from "./NewTrainingPlanForm";

export default function NewTrainingPlanPage() {
	return (
		<PageWrapper
			title="Add New Training Plan"
			description="Add a new training plan to your database"
			breadcrumbs={[
				{ label: "Training Plans", href: "/training-plans" },
				{ label: "New", href: "/training-plans/new" },
			]}
		>
			<Suspense fallback={<div>Loading...</div>}>
				<NewTrainingPlanForm />
			</Suspense>
		</PageWrapper>
	);
}
