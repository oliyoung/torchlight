"use client";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { Loading } from "@/components/ui/loading";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { logger } from "@/lib/logger";
import type { Goal } from "@/lib/types";
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
			sport
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
		goals: Goal[];
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
			{data.goals.map((goal) => (
				<div
					key={goal.id}
					className="border rounded-lg p-4 bg-card hover:bg-accent/50 transition-colors"
				>
					<div className="flex items-start justify-between">
						<div className="space-y-1">
							<h3 className="font-semibold text-lg">{goal.title}</h3>
							{goal.description && (
								<p className="text-muted-foreground text-sm">
									{goal.description}
								</p>
							)}
							<div className="flex items-center gap-4 text-sm text-muted-foreground">
								<span>
									Athlete: {goal.athlete.firstName} {goal.athlete.lastName}
								</span>
								{goal.dueDate && (
									<span>
										Due: {new Date(goal.dueDate).toLocaleDateString()}
									</span>
								)}
							</div>
						</div>
						<div className="flex items-center gap-2">
							<span
								className={`px-2 py-1 text-xs rounded-full ${
									goal.status === "COMPLETED"
										? "bg-green-100 text-green-800"
										: goal.status === "PAUSED"
										? "bg-yellow-100 text-yellow-800"
										: "bg-blue-100 text-blue-800"
								}`}
							>
								{goal.status}
							</span>
						</div>
					</div>
				</div>
			))}
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