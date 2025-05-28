import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

export default function Page() {
	return (
		<PageWrapper
			title="Session Logs"
			description="Manage and view all your athlete session logs"
			breadcrumbs={[{ label: "Session Logs", href: "/session-logs" }]}
			actions={
				<Button asChild>
					<Link href="/session-logs/new">
						<PlusIcon className="w-4 h-4 mr-2" />
						Add Session Log
					</Link>
				</Button>
			}
		>
			<div className="space-y-4">
				{/* TODO: Implement SessionLogsList component */}
				<p>SessionLogs list coming soon...</p>
			</div>
		</PageWrapper>
	);
}
