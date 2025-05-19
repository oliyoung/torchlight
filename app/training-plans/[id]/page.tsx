"use client";
import type React from "react";
import { useQuery } from "urql";
import Breadcrumbs from "@/components/breadcrumbs";
import { Heading } from "@/components/ui/heading";
import { ErrorMessage } from "@/components/ui/error-message";
import { useParams } from "next/navigation";
import { logger } from "@/lib/logger";
import type { Assistant, Goal } from "@/lib/types";
import Link from "next/link";
import { TrainingPlanAssistantsList } from "@/components/training-plan-assistants-list";
import { TrainingPlanGoalsList } from "@/components/training-plan-goals-list";
import { TrainingPlanSessionLogsList } from "@/components/training-plan-session-logs-list";

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

const TrainingPlanDetailPage: React.FC = () => {
	const params = useParams();
	const id =
		typeof params.id === "string"
			? params.id
			: Array.isArray(params.id)
				? params.id[0]
				: "";
	const [{ data, fetching, error }] = useQuery({
		query: TrainingPlanQuery,
		variables: { id },
		pause: !id,
	});

	if (!id) return <ErrorMessage message="No training plan ID provided." />;
	if (fetching) return <div className="p-4">Loading training plan...</div>;
	logger.info({ data }, "Training plan data");
	if (error || !data?.trainingPlan) {
		logger.error({ error }, "Training plan not found");
		return (
			<ErrorMessage
				message={`Error loading training plan: ${error?.message}`}
			/>
		);
	}

	const plan = data.trainingPlan;
	const planJson = plan.planJson || {};
	const programOverview = planJson.programOverview || {};
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
					<TrainingPlanAssistantsList assistants={plan.assistants} />
					<TrainingPlanGoalsList goals={plan.goals} />
					<TrainingPlanSessionLogsList sessionLogs={plan.sessionLogs} />
				</div>
			</div>
		</>
	);
};

export default TrainingPlanDetailPage;
