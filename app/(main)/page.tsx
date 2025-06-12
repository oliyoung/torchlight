import LastAthletes from "@/components/last-athletes";
import LastSessionLogs from "@/components/last-session-logs";
import { PageSection, PageWrapper } from "@/components/ui/page-wrapper";

export default () =>
	<PageWrapper
		title="Ready to help your athletes grow today?"
		description="Your coaching is making a real difference. Keep building those meaningful relationships."
		breadcrumbs={[]}
	>
		<PageSection title="Last Athletes" description="Last 5 athletes">
			<LastAthletes />
		</PageSection>
		<PageSection title="Last Session Logs" description="Last 5 session logs">
			<LastSessionLogs />
		</PageSection>
	</PageWrapper>
