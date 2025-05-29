"use client";

import Breadcrumbs from "@/components/breadcrumbs";
import { ErrorMessage } from "@/components/ui/error-message";
import { Heading } from "@/components/ui/heading";
import { PageCard, PageGrid, PageWrapper } from "@/components/ui/page-wrapper";
import type { Assistant } from "@/lib/types";
import { useQuery } from "urql";
const AssistantsQuery = `
	query {
		assistants {
			id
			name
			sport
			role
			strengths
			bio
		}
	}
`;
const AssistantsPage = () => {
	const [{ data, fetching, error }] = useQuery<{ assistants: Assistant[] }>({
		query: AssistantsQuery,
	});

	if (fetching) return <div className="p-4">Loading assistants...</div>;
	if (error)
		return (
			<ErrorMessage message={`Error loading assistants: ${error.message}`} />
		);

	return (
		<PageWrapper
			title="Assistants"
			isLoading={fetching}
			description="Manage and view all your assistants"
			breadcrumbs={[{ label: "Assistants", href: "/assistants" }]}
		>
			<PageGrid columns={4} >
				{data?.assistants?.map((assistant) => (
					<PageCard
						key={assistant.id}
						title={assistant.name}
						subtitle={`${assistant.role} &mdash; ${assistant.sport}`}
					>
						<div className="text-xs mt-1">
							<span className="font-medium">Strengths:</span>{" "}
							{assistant.strengths.join(", ")}
						</div>
						{assistant.bio && (
							<div className="text-xs mt-2 text-muted-foreground">
								{assistant.bio}
							</div>
						)}
					</PageCard>
				))}
			</PageGrid>
		</PageWrapper>
	);
};

export default AssistantsPage;
