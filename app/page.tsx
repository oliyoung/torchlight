import { DashboardHero } from "@/components/dashboard-hero";
import { Button } from "@/components/ui/button";
import { PageSection, PageWrapper } from "@/components/ui/page-wrapper";
import Link from "next/link";
import LastAthletes from "../components/LastAthletes";
import LastSessionLogs from "../components/LastSessionLogs";

export default function Page() {
	return (
		<PageWrapper
			title="Ready to help your athletes grow today?"
			description="Your coaching is making a real difference. Keep building those meaningful relationships."
			breadcrumbs={[]}
		>
			<DashboardHero />
			<PageSection title="Last Athletes" description="Last 5 athletes">
				<LastAthletes />
			</PageSection>
			<PageSection title="Last Session Logs" description="Last 5 session logs">
				<LastSessionLogs />
			</PageSection>
		</PageWrapper>
	);
}
