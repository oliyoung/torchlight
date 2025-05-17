"use client";
import React from "react";
import { useQuery } from "urql";
import Breadcrumbs from "@/components/breadcrumbs";
import { Heading } from "@/components/ui/heading";
import { ErrorMessage } from "@/components/ui/error-message";
import { useParams } from "next/navigation";

const TrainingPlanQuery = `
  query TrainingPlan($id: ID!) {
    trainingPlan(id: $id) {
      id
      title
      clientId
      createdAt
      overview
    }
  }
`;

export default function TrainingPlanDetailPage() {
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
	if (error)
		return (
			<ErrorMessage message={`Error loading training plan: ${error.message}`} />
		);
	if (!data?.trainingPlan)
		return <ErrorMessage message="Training plan not found." />;

	const plan = data.trainingPlan;

	return (
		<>
			<Breadcrumbs />
			<Heading>{plan.title}</Heading>
			<div className="mt-4 space-y-2">
				<div>
					<span className="font-medium">Client ID:</span> {plan.clientId}
				</div>
				<div>
					<span className="font-medium">Created:</span>{" "}
					{new Date(plan.createdAt).toLocaleDateString()}
				</div>
				{plan.overview && (
					<div>
						<span className="font-medium">Overview:</span> {plan.overview}
					</div>
				)}
			</div>
		</>
	);
}
