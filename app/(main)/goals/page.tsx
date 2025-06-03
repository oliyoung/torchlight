"use client";

import { Button } from "@/components/ui/button";
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
			createdAt
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

	if (fetching) return <Loading message="Loading training plans..." />;
	if (error) {
		logger.error({ error, data }, "Training plans not found");
		return (
			<ErrorMessage
				message={`Error loading training plans: ${error.message}`}
			/>
		);
	}

	if (!data?.goals?.length) {
		return (
			<section
				className="text-center p-10 border  bg-muted/10 flex flex-col items-center justify-center gap-4 mt-6"
				aria-label="No goals available"
			>
				<div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
					<PlusIcon
						className="h-10 w-10 text-muted-foreground"
						aria-hidden="true"
					/>
				</div>
				<div className="space-y-2 max-w-md">
					<h3 className="text-xl font-semibold">No goals yet</h3>
					<p className="text-muted-foreground">
						Create goals to help your athletes track their progress and achieve
						their goals.
					</p>
				</div>
				<Button size="lg" asChild className="mt-2">
					<Link href="/goals/new" aria-label="Create your first goal">
						<PlusIcon className="w-5 h-5 mr-2" aria-hidden="true" />
						Create First Goal
					</Link>
				</Button>
			</section>
		);
	}
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
