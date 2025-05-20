"use client";
import Breadcrumbs from "@/components/breadcrumbs";
import { ClientTrainingPlansList } from "@/components/client-training-plans-list";
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
			goals {
				id
				title
				status
				sport
				description
				dueDate
				trainingPlans {
					id
					title
				}
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
			<Heading className="mb-2">{`${client.firstName} ${client.lastName}`}</Heading>
			<div className="mt-6">
				<Tabs defaultValue="details" className="focus-within:outline-none">
					<TabsList
						className="w-full sm:w-auto justify-start mb-4 overflow-x-auto"
						aria-label="Client information tabs"
					>
						<TabsTrigger value="details">Client Details</TabsTrigger>
						<TabsTrigger value="trainingPlans">Training Plans</TabsTrigger>
						<TabsTrigger value="goals">Goals</TabsTrigger>
						<TabsTrigger value="sessionLogs">Session Logs</TabsTrigger>
					</TabsList>
					<TabsContent value="details" role="tabpanel">
						<Card className="p-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<span className="font-semibold">Email:</span> {client.email}
								</div>
								<div>
									<span className="font-semibold">Birthday:</span>{" "}
									<time dateTime={client.birthday}>{client.birthday}</time>
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
								<div className="col-span-1 md:col-span-2">
									<span className="font-semibold">Notes:</span>{" "}
									{client.notes || "-"}
								</div>
								<div>
									<span className="font-semibold">Created At:</span>{" "}
									<time dateTime={client.createdAt}>
										{new Date(client.createdAt).toLocaleDateString()}
									</time>
								</div>
								<div>
									<span className="font-semibold">Updated At:</span>{" "}
									<time dateTime={client.updatedAt}>
										{new Date(client.updatedAt).toLocaleDateString()}
									</time>
								</div>
								{client.deletedAt && (
									<div>
										<span className="font-semibold">Deleted At:</span>{" "}
										<time dateTime={client.deletedAt}>
											{new Date(client.deletedAt).toLocaleDateString()}
										</time>
									</div>
								)}
							</div>
						</Card>
					</TabsContent>
					<TabsContent value="trainingPlans" role="tabpanel">
						<ClientTrainingPlansList
							clientId={client.id}
							trainingPlans={client.trainingPlans || []}
						/>
					</TabsContent>
					<TabsContent value="goals" role="tabpanel">
						<div className="flex justify-between items-center mb-4">
							<Heading level={2}>Goals</Heading>
							<Button
								onClick={() => {
									window.location.href = `/clients/${client.id}/goals/new`;
								}}
							>
								Add Goal
							</Button>
						</div>
						{(client.goals?.length ?? 0) > 0 ? (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{client.goals?.map((goal) => (
									<Card key={goal.id} className="overflow-hidden">
										<CardHeader>
											<CardTitle className="flex items-center justify-between">
												{goal.title}
												<span className="text-xs py-1 px-2 font-normal bg-muted rounded-full">
													{goal.status}
												</span>
											</CardTitle>
											{goal.sport && (
												<CardDescription>Sport: {goal.sport}</CardDescription>
											)}
										</CardHeader>
										<CardContent>
											{goal.description && <p>{goal.description}</p>}
											{goal.trainingPlans && goal.trainingPlans.length > 0 && (
												<div className="mt-2">
													<span className="text-xs font-medium">
														Training Plans:
													</span>
													<div className="flex flex-wrap gap-1 mt-1">
														{goal.trainingPlans.map((plan) => (
															<span
																key={plan.id}
																className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full"
															>
																{plan.title}
															</span>
														))}
													</div>
												</div>
											)}
										</CardContent>
										<CardFooter className="border-t px-6 py-4">
											<div className="flex justify-between w-full text-sm">
												<div className="text-muted-foreground">
													{goal.dueDate && (
														<time dateTime={goal.dueDate}>
															Target:{" "}
															{new Date(goal.dueDate).toLocaleDateString()}
														</time>
													)}
												</div>
												<Button
													size="sm"
													onClick={() => {
														// View details or edit goal
													}}
													variant="ghost"
												>
													View Details
												</Button>
											</div>
										</CardFooter>
									</Card>
								))}
							</div>
						) : (
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
										Create goals to track your client's progress and
										achievements. Goals can be linked to training plans.
									</p>
								</div>
								<Button
									size="lg"
									className="mt-4"
									onClick={() => {
										window.location.href = `/clients/${client.id}/goals/new`;
									}}
								>
									Create First Goal
								</Button>
							</div>
						)}
					</TabsContent>
					<TabsContent value="sessionLogs" role="tabpanel">
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
