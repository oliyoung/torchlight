"use client";

import Goal from "@/components/goal";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { Loading } from "@/components/ui/loading";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { logger } from "@/lib/logger";
import type { Goal as GoalType } from "@/lib/types";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

import { useQuery } from "urql";

const GoalsQuery = `
	query {
		goals {
			id
			title
			description
			status
			createdAt
			dueDate
			athlete {
				id
				firstName
				lastName
			}
		}
	}
`;

function GoalsList() {
	const [{ data, fetching, error }] = useQuery<{
		goals: GoalType[];
	}>({
		query: GoalsQuery,
	});

	if (fetching) return <Loading message="Loading goals..." />;
	if (error) {
		logger.error({ error, data }, "Goals not found");
		return (
			<ErrorMessage
				message={`Error loading goals: ${error.message}`}
			/>
		);
	}

	if (!data?.goals?.length) {
		return (
			<EmptyState
				title="No goals yet"
				description="Create goals to help your athletes track their progress and achieve their goals."
				actionLabel="Create First Goal"
				actionHref="/goals/new"
				ariaLabel="No goals available"
			/>
		);
	}

	return (
		<div className="grid gap-4">
			{data.goals.map((goal) => <Goal key={goal.id} goal={goal} />)}
		</div>
	);
}

export default function Page() {
	return (
		<PageWrapper
			title="Goals"
			description="Manage and view all your athlete goals"
			breadcrumbs={[{ label: "Goals", href: "/goals" }]}
			actions={
				<Button asChild>
					<Link href="/goals/new">
						<PlusIcon className="w-4 h-4 mr-2" />
						Add Goals
					</Link>
				</Button>
			}
		>
			<GoalsList />
		</PageWrapper>
	);
}