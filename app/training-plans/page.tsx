"use client";
import React from "react";
import { useQuery } from "urql";
import Breadcrumbs from "@/components/breadcrumbs";
import { Heading } from "@/components/ui/heading";
import type { TrainingPlan } from "@/lib/types";
import { ErrorMessage } from "@/components/ui/error-message";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { logger } from "@/lib/logger";
const TrainingPlansQuery = `
	query {
		trainingPlans {
			id
			title
			client {
				id
				firstName
			}
			createdAt
		}
	}
`;

function TrainingPlansList() {
	const [{ data, fetching, error }] = useQuery<{
		trainingPlans: TrainingPlan[];
	}>({
		query: TrainingPlansQuery,
	});

	if (fetching) return <div className="p-4">Loading training plans...</div>;
	if (error)
		return (
			<ErrorMessage
				message={`Error loading training plans: ${error.message}`}
			/>
		);

	logger.info({ data }, "Training plans data");

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-4">
			{data?.trainingPlans?.map((plan) => (
				<div
					key={plan.id}
					className="border rounded px-3 py-2 bg-white shadow-sm"
				>
					<Link
						href={`/training-plans/${plan.id}`}
						className="font-semibold text-lg"
					>
						{plan.title}
					</Link>
					<div className="text-xs text-muted-foreground">
						<Link href={`/clients/${plan.client?.id}`}>
							{plan.client?.firstName}
						</Link>
					</div>
					<div className="text-xs text-muted-foreground">
						Created: {new Date(plan.createdAt).toLocaleDateString()}
					</div>
				</div>
			))}
		</div>
	);
}

export default function TrainingPlansPage() {
	return (
		<>
			<Breadcrumbs />
			<Heading>Training Plans</Heading>
			<Button asChild accessKey="a" variant={"default"}>
				<Link href="/training-plans/new">
					<PlusIcon className="w-4 h-4" />
					Add Training Plan
				</Link>
			</Button>
			<TrainingPlansList />
		</>
	);
}
