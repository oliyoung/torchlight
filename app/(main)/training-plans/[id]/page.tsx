"use client";
import Breadcrumbs from "@/components/breadcrumbs";
import { TrainingPlanAssistantsList } from "@/components/training-plan-assistants-list";
import { TrainingPlanGoalsList } from "@/components/training-plan-goals-list";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ErrorMessage } from "@/components/ui/error-message";
import { Heading } from "@/components/ui/heading";
import { Loading } from "@/components/ui/loading";
import { logger } from "@/lib/logger";
import type { Assistant, Goal } from "@/lib/types";
import { UserIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type React from "react";
import { gql, useMutation, useQuery } from "urql";

const TrainingPlanQuery = gql`
  query TrainingPlan($id: ID!) {
    trainingPlan(id: $id) {
      id
      athlete {
        id
        firstName
        lastName
      }
      createdAt
      overview
			planJson
			generatedBy
      assistants {
        id
        name
        sport
        role
        strengths
      }
      goals {
        id
        title
        status
        description
      }
    }
  }
`;

const UpdateTrainingPlanMutation = `
  mutation UpdateTrainingPlan($id: ID!, $input: UpdateTrainingPlanInput!) {
    updateTrainingPlan(id: $id, input: $input) {
      id
      assistants {
        id
        name
        sport
        role
        strengths
      }
      goals {
        id
        title
        status
        description
      }
    }
  }
`;

const TrainingPlanDetailPage: React.FC = () => {
	const { id } = useParams();

	const [{ data, fetching, error }, refetchTrainingPlan] = useQuery({
		query: TrainingPlanQuery,
		variables: { id },
		pause: !id,
	});

	const [updateResult, updateTrainingPlan] = useMutation(
		UpdateTrainingPlanMutation,
	);

	const handleAddAssistant = async (assistant: Assistant) => {
		// Get current assistants and add the new one
		const currentAssistants = data?.trainingPlan?.assistants || [];
		const assistantIds = [...currentAssistants.map((a: Assistant) => a.id), assistant.id];

		// Remove duplicates
		const uniqueAssistantIds = [...new Set(assistantIds)];

		try {
			await updateTrainingPlan({
				id,
				input: {
					assistantIds: uniqueAssistantIds,
				},
			});
			// Refetch to get updated data
			refetchTrainingPlan({ requestPolicy: "network-only" });
		} catch (err) {
			logger.error({ err }, "Error adding assistant to training plan");
		}
	};

	const handleRemoveAssistant = async (assistantId: string) => {
		// Get current assistants and remove the specified one
		const currentAssistants = data?.trainingPlan?.assistants || [];
		const assistantIds = currentAssistants
			.map((a: Assistant) => a.id)
			.filter((id: string) => id !== assistantId);

		try {
			await updateTrainingPlan({
				id,
				input: {
					assistantIds,
				},
			});
			// Refetch to get updated data
			refetchTrainingPlan({ requestPolicy: "network-only" });
		} catch (err) {
			logger.error({ err }, "Error removing assistant from training plan");
		}
	};

	const handleAddGoal = async (goal: Goal) => {
		// Get current goals and add the new one
		const currentGoals = data?.trainingPlan?.goals || [];
		const goalIds = [...currentGoals.map((g: Goal) => g.id), goal.id];

		// Remove duplicates
		const uniqueGoalIds = [...new Set(goalIds)];

		try {
			await updateTrainingPlan({
				id,
				input: {
					goalIds: uniqueGoalIds,
				},
			});
			// Refetch to get updated data
			refetchTrainingPlan({ requestPolicy: "network-only" });
		} catch (err) {
			logger.error({ err }, "Error adding goal to training plan");
		}
	};

	const handleRemoveGoal = async (goalId: string) => {
		// Get current goals and remove the specified one
		const currentGoals = data?.trainingPlan?.goals || [];
		const goalIds = currentGoals.map((g: Goal) => g.id).filter((id: string) => id !== goalId);

		try {
			await updateTrainingPlan({
				id,
				input: {
					goalIds,
				},
			});
			// Refetch to get updated data
			refetchTrainingPlan({ requestPolicy: "network-only" });
		} catch (err) {
			logger.error({ err }, "Error removing goal from training plan");
		}
	};

	if (!id) return <ErrorMessage message="No training plan ID provided." />;
	if (fetching) return <Loading message="Loading training plan..." />;

	if (error || !data?.trainingPlan) {
		logger.error({ error, data }, "Training plan not found");
		return (
			<ErrorMessage
				message={`Error loading training plan: ${error?.message}`}
			/>
		);
	}

	const plan = data.trainingPlan;
	const planJson = plan.planJson || {};
	const programOverview = planJson.programOverview || {};
	const sport = programOverview.sport || "basketball";
	const monitoringStrategies = planJson.monitoringStrategies || [];
	const progressionGuidelines = planJson.progressionGuidelines || [];
	const recoveryRecommendations = planJson.recoveryRecommendations || [];

	return (
		<>
			<Breadcrumbs />
			<div className="space-y-6">
				<div className="space-y-2">
					<Heading>Training Plan</Heading>
					{plan.athlete && (
						<div className="flex items-center text-muted-foreground">
							<UserIcon className="w-4 h-4 mr-1" />
							<Link
								href={`/athletes/${plan.athlete.id}`}
								className="text-primary hover:underline flex items-center ml-1"
								aria-label={`View athlete profile: ${plan.athlete.firstName} ${plan.athlete.lastName}`}
						>
								{plan.athlete.firstName} {plan.athlete.lastName}
							</Link>
						</div>
					)}
				</div>

				{/* Status messages */}
				{updateResult.fetching && (
					<p className="text-sm text-muted-foreground bg-muted/50 p-2 ">
						Updating training plan...
					</p>
				)}
				{updateResult.error && (
					<ErrorMessage
						message={`Error updating training plan: ${updateResult.error.message}`}
					/>
				)}

				{/* Overview section */}
				{plan.overview && (
					<Card>
						<CardHeader>
							<CardTitle>Overview</CardTitle>
							<CardDescription>
								<time dateTime={new Date(plan.createdAt).toISOString()}>
									Created: {new Date(plan.createdAt).toLocaleDateString()}
								</time>
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p>{plan.overview}</p>
						</CardContent>
					</Card>
				)}

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Program details column */}
					<div className="lg:col-span-2 space-y-6">
						{/* Program Overview */}
						{programOverview.title && (
							<Card>
								<CardHeader>
									<CardTitle>Program Details</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									{programOverview.duration && (
										<div>
											<h3 className="font-medium text-sm mb-1">Duration</h3>
											<p>{programOverview.duration}</p>
										</div>
									)}

									{programOverview.phases &&
										programOverview.phases.length > 0 && (
											<div>
												<h3 className="font-medium text-sm mb-1">Phases</h3>
												<div className="flex flex-wrap gap-2">
													{programOverview.phases.map((phase: string) => (
														<Badge key={phase} variant="outline">
															{phase}
														</Badge>
													))}
												</div>
											</div>
										)}

									{programOverview.equipment &&
										programOverview.equipment.length > 0 && (
											<div>
												<h3 className="font-medium text-sm mb-1">Equipment</h3>
												<div className="flex flex-wrap gap-2">
													{programOverview.equipment.map((item: string) => (
														<Badge key={item} variant="outline">
															{item}
														</Badge>
													))}
												</div>
											</div>
										)}

									{programOverview.expectedOutcomes &&
										programOverview.expectedOutcomes.length > 0 && (
											<div>
												<h3 className="font-medium text-sm mb-1">
													Expected Outcomes
												</h3>
												<div className="flex flex-wrap gap-2">
													{programOverview.expectedOutcomes.map(
														(outcome: string) => (
															<Badge key={outcome} variant="outline">
																{outcome}
															</Badge>
														),
													)}
												</div>
											</div>
										)}
								</CardContent>
							</Card>
						)}

						{/* Implementation Guidelines */}
						{(monitoringStrategies.length > 0 ||
							progressionGuidelines.length > 0 ||
							recoveryRecommendations.length > 0) && (
								<Card>
									<CardHeader>
										<CardTitle>Implementation Guidelines</CardTitle>
									</CardHeader>
									<CardContent className="space-y-6">
										{monitoringStrategies.length > 0 && (
											<div>
												<h3 className="font-medium mb-2">
													Monitoring Strategies
												</h3>
												<ul className="list-disc list-inside text-sm space-y-1">
													{monitoringStrategies.map((item: string) => (
														<li key={`strategy-${item}`}>{item}</li>
													))}
												</ul>
											</div>
										)}

										{progressionGuidelines.length > 0 && (
											<div>
												<h3 className="font-medium mb-2">
													Progression Guidelines
												</h3>
												<ul className="list-disc list-inside text-sm space-y-1">
													{progressionGuidelines.map((item: string) => (
														<li key={`guideline-${item}`}>{item}</li>
													))}
												</ul>
											</div>
										)}

										{recoveryRecommendations.length > 0 && (
											<div>
												<h3 className="font-medium mb-2">
													Recovery Recommendations
												</h3>
												<ul className="list-disc list-inside text-sm space-y-1">
													{recoveryRecommendations.map((item: string) => (
														<li key={`recovery-${item}`}>{item}</li>
													))}
												</ul>
											</div>
										)}
									</CardContent>
								</Card>
							)}
					</div>

					{/* Assistants and Goals column */}
					<div className="space-y-6">
						{/* Assistants */}
						<Card>
							<CardHeader>
								<CardTitle>Coaching Assistants</CardTitle>
							</CardHeader>
							<CardContent>
								<TrainingPlanAssistantsList
									sport={sport}
									assistants={plan.assistants}
									onAddAssistant={handleAddAssistant}
									onRemoveAssistant={handleRemoveAssistant}
								/>
							</CardContent>
						</Card>

						{/* Goals */}
						<Card>
							<CardHeader>
								<CardTitle>Goals</CardTitle>
							</CardHeader>
							<CardContent>
								<TrainingPlanGoalsList
									goals={plan.goals}
									athleteId={plan.athlete?.id}
									onAddGoal={handleAddGoal}
									onRemoveGoal={handleRemoveGoal}
								/>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</>
	);
};

export default TrainingPlanDetailPage;
