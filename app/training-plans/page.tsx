"use client";
import Breadcrumbs from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ErrorMessage } from "@/components/ui/error-message";
import { Heading } from "@/components/ui/heading";
import { Loading } from "@/components/ui/loading";
import { logger } from "@/lib/logger";
import type { TrainingPlan } from "@/lib/types";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useQuery } from "urql";

const TrainingPlansQuery = `
	query {
		trainingPlans {
			id
			title
			overview
			client {
				id
				firstName
				lastName
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

	if (fetching) return <Loading message="Loading training plans..." />;
	if (error) {
		logger.error({ error, data }, "Training plans not found");
		return (
			<ErrorMessage
				message={`Error loading training plans: ${error.message}`}
			/>
		);
	}

	logger.info({ data }, "Training plans data");

	if (!data?.trainingPlans?.length) {
		return (
			<section
				className="text-center p-10 border rounded-lg bg-muted/10 flex flex-col items-center justify-center gap-4 mt-6"
				aria-label="No training plans available"
			>
				<div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
					<PlusIcon
						className="h-10 w-10 text-muted-foreground"
						aria-hidden="true"
					/>
				</div>
				<div className="space-y-2 max-w-md">
					<h3 className="text-xl font-semibold">No training plans yet</h3>
					<p className="text-muted-foreground">
						Create training plans to help your clients track their progress and
						achieve their goals.
					</p>
				</div>
				<Button size="lg" asChild className="mt-2">
					<Link
						href="/training-plans/new"
						aria-label="Create your first training plan"
					>
						<PlusIcon className="w-5 h-5 mr-2" aria-hidden="true" />
						Create First Training Plan
					</Link>
				</Button>
			</section>
		);
	}

	return (
		<ul
			className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 list-none p-0"
			aria-label="List of all training plans"
		>
			{data.trainingPlans.map((plan) => (
				<li key={plan.id} className="p-0">
					<Card className="h-full flex flex-col hover:shadow-md transition-shadow">
						<CardHeader>
							<CardTitle>
								<Link
									href={`/training-plans/${plan.id}`}
									className="hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
									aria-label={`View training plan: ${plan.title || "Untitled Training Plan"}`}
								>
									{plan.title || "Untitled Training Plan"}
								</Link>
							</CardTitle>
							{plan.client && (
								<CardDescription>
									<Link
										href={`/clients/${plan.client.id}`}
										className="text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-1"
									>
										Client: {plan.client.firstName} {plan.client.lastName}
									</Link>
								</CardDescription>
							)}
						</CardHeader>
						<CardContent className="flex-grow">
							{plan.overview && (
								<p className="text-sm text-muted-foreground line-clamp-3 mb-2">
									{plan.overview}
								</p>
							)}
							<p className="text-xs text-muted-foreground">
								<span className="sr-only">Date created:</span>
								<time dateTime={new Date(plan.createdAt).toISOString()}>
									Created: {new Date(plan.createdAt).toLocaleDateString()}
								</time>
							</p>
						</CardContent>
						<CardFooter className="pt-0">
							<Link
								href={`/training-plans/${plan.id}`}
								className="text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-2 py-1 ml-auto transition-colors"
							>
								View details
								<span className="sr-only">
									about {plan.title || "Untitled Training Plan"}
								</span>
							</Link>
						</CardFooter>
					</Card>
				</li>
			))}
		</ul>
	);
}

export default function TrainingPlansPage() {
	return (
		<>
			<Breadcrumbs />
			<div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
				<div className="space-y-1">
					<Heading>Training Plans</Heading>
					<CardDescription className="text-sm text-muted-foreground">
						Create and manage all your client training plans in one place
					</CardDescription>
				</div>
				<Button asChild size="sm">
					<Link href="/training-plans/new" className="whitespace-nowrap">
						<PlusIcon className="w-4 h-4 mr-2" aria-hidden="true" />
						New Training Plan
					</Link>
				</Button>
			</div>
			<TrainingPlansList />
		</>
	);
}
