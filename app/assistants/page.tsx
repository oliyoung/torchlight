"use client";

import Breadcrumbs from "@/components/breadcrumbs";
import { ErrorMessage } from "@/components/ui/error-message";
import { Heading } from "@/components/ui/heading";
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

function AssistantsList() {
	const [{ data, fetching, error }] = useQuery<{ assistants: Assistant[] }>({
		query: AssistantsQuery,
	});

	if (fetching) return <div className="p-4">Loading assistants...</div>;
	if (error)
		return (
			<ErrorMessage message={`Error loading assistants: ${error.message}`} />
		);

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-4">
			{data?.assistants?.map((assistant) => (
				<div
					key={assistant.id}
					className="border rounded px-3 py-2 bg-white shadow-sm"
				>
					<div className="font-semibold text-lg">{assistant.name}</div>
					<div className="text-sm text-muted-foreground">
						{assistant.role} &mdash; {assistant.sport}
					</div>
					<div className="text-xs mt-1">
						<span className="font-medium">Strengths:</span>{" "}
						{assistant.strengths.join(", ")}
					</div>
					{assistant.bio && (
						<div className="text-xs mt-2 text-muted-foreground">
							{assistant.bio}
						</div>
					)}
				</div>
			))}
		</div>
	);
}

const AssistantsPage = () => {
	return (
		<>
			<Breadcrumbs />
			<Heading>Assistants</Heading>
			<AssistantsList />
		</>
	);
};

export default AssistantsPage;
