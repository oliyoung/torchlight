"use client";
import Breadcrumbs from "@/components/breadcrumbs";
import { TrainingPlanAssistantsList } from "@/components/training-plan-assistants-list";
import { TrainingPlanGoalsList } from "@/components/training-plan-goals-list";
import { TrainingPlanSessionLogsList } from "@/components/training-plan-session-logs-list";
import { ErrorMessage } from "@/components/ui/error-message";
import { Heading } from "@/components/ui/heading";
import { Loading } from "@/components/ui/loading";
import { useStringParamId } from "@/lib/hooks/use-string-param-id";
import { logger } from "@/lib/logger";
import type { Assistant, Goal } from "@/lib/types";
import Link from "next/link";
import type React from "react";
import { useMutation, useQuery } from "urql";

const TrainingPlanQuery = `
  query TrainingPlan($id: ID!) {
    trainingPlan(id: $id) {
      id
      title
      client {
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
      }
    }
  }
`;

const UpdateTrainingPlanMutation = `
  mutation UpdateTrainingPlan($id: ID!, $input: UpdateTrainingPlanInput!) {
    updateTrainingPlan(id: $id, input: $input) {
      id
      title
      assistants {
        id
        name
        sport
        role
        strengths
      }
    }
  }
`;

const TrainingPlanDetailPage: React.FC = () => {
	const id = useStringParamId();
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
		const assistantIds = [...currentAssistants.map((a) => a.id), assistant.id];

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
			.map((a) => a.id)
			.filter((id) => id !== assistantId);

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

	if (!id) return <ErrorMessage message="No training plan ID provided." />;
	if (fetching) return <Loading message="Loading training plan..." />;
	logger.info({ data }, "Training plan data");
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
			<Heading>{plan.title}</Heading>
			<Heading level={2}>
				<Link href={`/clients/${plan.client?.id}`}>
					{plan.client?.firstName} {plan.client?.lastName}
				</Link>
			</Heading>

			{/* Show update status if needed */}
			{updateResult.fetching && (
				<p className="text-sm text-muted-foreground">
					Updating training plan...
				</p>
			)}
			{updateResult.error && (
				<ErrorMessage
					message={`Error updating training plan: ${updateResult.error.message}`}
				/>
			)}

			<div className="flex items-start justify-between">
				<div>
					{programOverview.title && (
						<div className="mt-6">
							<div className="mb-2">
								<span className="font-medium">Duration:</span>{" "}
								{programOverview.duration}
							</div>
							{programOverview.phases && (
								<div className="mb-2">
									<span className="font-medium">Phases:</span>{" "}
									{programOverview.phases.join(", ")}
								</div>
							)}
							{programOverview.equipment && (
								<div className="mb-2">
									<span className="font-medium">Equipment:</span>{" "}
									{programOverview.equipment.join(", ")}
								</div>
							)}
							{programOverview.expectedOutcomes && (
								<div className="mb-2">
									<span className="font-medium">Expected Outcomes:</span>{" "}
									{programOverview.expectedOutcomes.join(", ")}
								</div>
							)}
						</div>
					)}

					{monitoringStrategies.length > 0 && (
						<div className="mb-2">
							<Heading level={3}>Monitoring Strategies</Heading>
							<ul className="list-disc list-inside text-sm">
								{monitoringStrategies.map((item: string) => (
									<li key={item}>{item}</li>
								))}
							</ul>
						</div>
					)}
					{progressionGuidelines.length > 0 && (
						<div className="mb-2">
							<Heading level={3}>Progression Guidelines</Heading>
							<ul className="list-disc list-inside text-sm">
								{progressionGuidelines.map((item: string) => (
									<li key={item}>{item}</li>
								))}
							</ul>
						</div>
					)}
					{recoveryRecommendations.length > 0 && (
						<div className="mb-2">
							<Heading level={3}>Recovery Recommendations</Heading>
							<ul className="list-disc list-inside text-sm">
								{recoveryRecommendations.map((item: string) => (
									<li key={item}>{item}</li>
								))}
							</ul>
						</div>
					)}
				</div>
				<div>
					{plan.overview && (
						<div>
							<p>{plan.overview}</p>
							<p className="text-xs text-muted-foreground">
								{new Date(plan.createdAt).toLocaleDateString()}
							</p>
						</div>
					)}
					<TrainingPlanAssistantsList
						sport={sport}
						assistants={plan.assistants}
						onAddAssistant={handleAddAssistant}
						onRemoveAssistant={handleRemoveAssistant}
					/>
					<TrainingPlanGoalsList goals={plan.goals} />
					<TrainingPlanSessionLogsList sessionLogs={plan.sessionLogs} />
				</div>
			</div>
		</>
	);
};

export default TrainingPlanDetailPage;
