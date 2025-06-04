import { NewAthleteForm } from "@/components/new-athlete-form";
import { PageWrapper } from "@/components/ui/page-wrapper";

export default function Page() {
	return (
		<PageWrapper
			title="Add New Athlete"
			description="Add a new athlete to your database"
			breadcrumbs={[
				{ label: "Athletes", href: "/athletes" },
				{ label: "New", href: "/athletes/new" },
			]}
		>
			<NewAthleteForm />
		</PageWrapper>
	);
}
