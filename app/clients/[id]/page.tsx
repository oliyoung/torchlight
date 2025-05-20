"use client";
import Breadcrumbs from "@/components/breadcrumbs";
import { ClientTrainingPlansList } from "@/components/client-training-plans-list";
import { Card } from "@/components/ui/card";
import { ErrorMessage } from "@/components/ui/error-message";
import { Heading } from "@/components/ui/heading";
import { Loading } from "@/components/ui/loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from "next/navigation";
import type * as React from "react";
import { useQuery } from "urql";

const ClientQuery = `
	query Client($id: ID!) {
		client(id: $id) {
			id
			userId
			firstName
			lastName
			birthday
			gender
			fitnessLevel
			trainingHistory
			height
			weight
			email
			tags
			notes
			createdAt
			updatedAt
			deletedAt
			trainingPlans {
				id
				title
				overview
				createdAt
				updatedAt
				deletedAt
			}
		}
	}
`;

const UserProfile: React.FC = () => {
	const params = useParams();
	const id = params.id as string;
	const [{ data, fetching, error }] = useQuery({
		query: ClientQuery,
		variables: { id },
		pause: !id,
	});

	if (fetching) return <Loading message="Loading client information..." />;
	if (error) return <ErrorMessage message={error.message} />;
	if (!data?.client) return <ErrorMessage message="Client not found" />;

	const client = data.client;

	return (
		<>
			<Breadcrumbs />
			<Heading>{`${client.firstName} ${client.lastName}`}</Heading>
			<div className="mt-6">
				<Tabs defaultValue="details">
					<TabsList>
						<TabsTrigger value="details">Client Details</TabsTrigger>
						<TabsTrigger value="trainingPlans">Training Plans</TabsTrigger>
						<TabsTrigger value="goals">Goals</TabsTrigger>
						<TabsTrigger value="sessionLogs">Session Logs</TabsTrigger>
					</TabsList>
					<TabsContent value="details">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
							<div>
								<span className="font-semibold">Email:</span> {client.email}
							</div>
							<div>
								<span className="font-semibold">Birthday:</span>{" "}
								{client.birthday}
							</div>
							<div>
								<span className="font-semibold">Gender:</span>{" "}
								{client.gender || "-"}
							</div>
							<div>
								<span className="font-semibold">Fitness Level:</span>{" "}
								{client.fitnessLevel || "-"}
							</div>
							<div>
								<span className="font-semibold">Training History:</span>{" "}
								{client.trainingHistory || "-"}
							</div>
							<div>
								<span className="font-semibold">Height:</span>{" "}
								{client.height ? `${client.height} cm` : "-"}
							</div>
							<div>
								<span className="font-semibold">Weight:</span>{" "}
								{client.weight ? `${client.weight} kg` : "-"}
							</div>
							<div>
								<span className="font-semibold">Tags:</span>{" "}
								{client.tags && client.tags.length > 0
									? client.tags.join(", ")
									: "-"}
							</div>
							<div>
								<span className="font-semibold">Notes:</span>{" "}
								{client.notes || "-"}
							</div>
							<div>
								<span className="font-semibold">Created At:</span>{" "}
								{new Date(client.createdAt).toLocaleDateString()}
							</div>
							<div>
								<span className="font-semibold">Updated At:</span>{" "}
								{new Date(client.updatedAt).toLocaleDateString()}
							</div>
							{client.deletedAt && (
								<div>
									<span className="font-semibold">Deleted At:</span>{" "}
									{new Date(client.deletedAt).toLocaleDateString()}
								</div>
							)}
						</div>
					</TabsContent>
					<TabsContent value="trainingPlans" className="py-6">
						<div className="space-y-2 mb-4">
							<p className="text-sm text-muted-foreground">
								Training plans help organize your client's progress and
								structure their development journey.
							</p>
						</div>
						<ClientTrainingPlansList
							clientId={client.id}
							trainingPlans={client.trainingPlans || []}
						/>
					</TabsContent>
					<TabsContent value="goals" className="py-6">
						<div className="space-y-2 mb-4">
							<p className="text-sm text-muted-foreground">
								Client goals help track progress and provide direction for
								training plans and sessions.
							</p>
						</div>
						<div className="text-center p-10 border rounded-lg bg-muted/10 flex flex-col items-center justify-center gap-4">
							<div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="40"
									height="40"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="text-muted-foreground"
									aria-labelledby="goals-icon-title"
								>
									<title id="goals-icon-title">Goals Icon</title>
									<path d="M12 22V8" />
									<path d="m5 12-2 2 9 9 9-9-2-2" />
									<circle cx="12" cy="5" r="3" />
								</svg>
							</div>
							<div className="space-y-2 max-w-md">
								<h3 className="text-xl font-semibold">No goals set yet</h3>
								<p className="text-muted-foreground">
									Goals feature is coming soon. You'll be able to set and track
									specific goals for this client.
								</p>
							</div>
						</div>
					</TabsContent>
					<TabsContent value="sessionLogs" className="py-6">
						<div className="space-y-2 mb-4">
							<p className="text-sm text-muted-foreground">
								Session logs record client interactions, progress, and notes
								from each coaching session.
							</p>
						</div>
						<div className="text-center p-10 border rounded-lg bg-muted/10 flex flex-col items-center justify-center gap-4">
							<div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="40"
									height="40"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="text-muted-foreground"
									aria-labelledby="session-logs-icon-title"
								>
									<title id="session-logs-icon-title">Session Logs Icon</title>
									<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
									<polyline points="14 2 14 8 20 8" />
									<path d="M16 13H8" />
									<path d="M16 17H8" />
									<path d="M10 9H8" />
								</svg>
							</div>
							<div className="space-y-2 max-w-md">
								<h3 className="text-xl font-semibold">No session logs yet</h3>
								<p className="text-muted-foreground">
									Session logs feature is coming soon. You'll be able to record
									and track coaching sessions here.
								</p>
							</div>
						</div>
					</TabsContent>
				</Tabs>
			</div>
		</>
	);
};

export default UserProfile;
