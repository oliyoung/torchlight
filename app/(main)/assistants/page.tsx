import { Suspense } from "react";
import { PageWrapper } from "@/components/ui/page-wrapper";
import AssistantsClient from "./AssistantsClient";

export default function AssistantsPage() {
	return (
		<PageWrapper
			title="Assistants"
			description="Manage and view all your assistants"
			breadcrumbs={[{ label: "Assistants", href: "/assistants" }]}
		>
			<Suspense fallback={<div className="p-4">Loading assistants...</div>}>
				<AssistantsClient />
			</Suspense>
		</PageWrapper>
	);
}
