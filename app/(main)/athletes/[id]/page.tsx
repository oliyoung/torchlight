"use client";

import Breadcrumbs from "@/components/breadcrumbs";
import { GoalEvaluationDialog } from "@/components/goal-evaluation-dialog";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";
import { Heading } from "@/components/ui/heading";
import { Loading } from "@/components/ui/loading";
import { PageWrapper } from "@/components/ui/page-wrapper";
import type { Athlete, Goal } from "@/lib/types";
import { gql } from "graphql-request";
import { Plus, PencilIcon } from "lucide-react";
import { notFound, useParams, useRouter } from "next/navigation";
import type React from "react";
import { useQuery } from "urql";

const AthleteQuery = gql`
  query AthleteById($id: ID!) {
    athlete(id: $id) {
      id
      firstName
      lastName
      email
      sport
      fitnessLevel
      tags
    }
  }
`;

const GoalsQuery = gql`
  query GoalsByAthleteId($athleteId: ID!) {
    goals(athleteId: $athleteId) {
      id
      title
      description
      status
      dueDate
      progressNotes
      createdAt
    }
  }
`;

export default function Page() {
	const { id } = useParams();
	const router = useRouter();

	const [{ data, fetching, error }] = useQuery<{ athlete: Athlete }>({
		query: AthleteQuery,
		variables: { id },
		pause: !id,
	});

	const [
		{ data: goalsData, fetching: goalsFetching, error: goalsError },
		refetchGoals,
	] = useQuery<{ goals: Goal[] }>({
		query: GoalsQuery,
		variables: { athleteId: id },
		pause: !id,
	});

	if (fetching) return <Loading />;
	if (error) return <ErrorMessage message={error.toString()} />;
	if (!data?.athlete) return notFound();

	const handleGoalCreated = () => {
		refetchGoals();
	};

	return (
		<PageWrapper
			isLoading={fetching}
			title={`${data.athlete.firstName} ${data.athlete.lastName.toLocaleUpperCase()}`}
			description={`${data.athlete.email} - ${data.athlete.sport} - ${data.athlete.fitnessLevel}`}
			breadcrumbs={[
				{ label: "Athletes", href: "/athletes" },
				{ label: data.athlete.lastName.toLocaleUpperCase(), href: "#" },
			]}
			actions={
				<Button
					variant="outline"
					onClick={() => router.push(`/athletes/${id}/edit`)}
					className="flex items-center gap-2"
				>
					<PencilIcon className="h-4 w-4" />
					Edit Athlete
				</Button>
			}
		>
			<div className="mb-4">
				<span className="text-gray-600">Tags: </span>
				{data.athlete.tags?.map((tag: string) => (
					<span
						key={tag}
						className="inline-block bg-zinc-200    dark:bg-zinc-700 text-xs  px-2 py-1 mr-2"
					>
						{tag}
					</span>
				))}
			</div>

			<section className="mt-8">
				<div className="flex items-center justify-between mb-4">
					<Heading level={2}>Goals</Heading>
					<GoalEvaluationDialog
						athleteId={id as string}
						onGoalCreated={handleGoalCreated}
						trigger={
							<Button>
								<Plus className="w-4 h-4 mr-2" />
								Add Goal
							</Button>
						}
					/>
				</div>

				{goalsFetching && <Loading />}
				{goalsError && <ErrorMessage message={goalsError.toString()} />}

				{!goalsFetching && !goalsError && (
					<div className="space-y-4">
						{goalsData?.goals && goalsData.goals.length > 0 ? (
							goalsData.goals.map((goal) => (
								<div
									key={goal.id}
									className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700  p-4"
								>
									<div className="flex items-start justify-between mb-2">
										<h3 className="font-semibold text-lg">{goal.title}</h3>
										<span
											className={`px-2 py-1  text-xs font-medium ${goal.status === "ACTIVE"
												? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
												: goal.status === "COMPLETED"
													? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
													: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
												}`}
										>
											{goal.status}
										</span>
									</div>
									{goal.description && (
										<p className="text-gray-600 dark:text-gray-400 mb-2">
											{goal.description}
										</p>
									)}
									<div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
										{goal.dueDate && (
											<span>
												Due: {new Date(goal.dueDate).toLocaleDateString()}
											</span>
										)}
										<span>
											Created: {new Date(goal.createdAt).toLocaleDateString()}
										</span>
									</div>
									{goal.progressNotes && (
										<div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
											<strong>Progress:</strong> {goal.progressNotes}
										</div>
									)}
								</div>
							))
						) : (
							<div className="bg-zinc-100 dark:bg-zinc-800  p-8 text-center text-zinc-500 dark:text-zinc-400">
								<p className="mb-2">No goals yet for this athlete.</p>
								<p className="text-sm">
									Click "Add Goal" to create their first training goal.
								</p>
							</div>
						)}
					</div>
				)}
			</section>
		</PageWrapper>
	);
}
