"use client";
import Breadcrumbs, { type BreadcrumbItemType } from "@/components/breadcrumbs";
import { AssistantMultiSelect } from "@/components/ui/assistant-multi-select";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { ErrorMessage } from "@/components/ui/error-message";
import { GoalTitleSelect } from "@/components/ui/goal-title-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SuccessMessage } from "@/components/ui/success-message";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { useMutation, useQuery } from "urql";
import { z } from "zod";

const ClientQuery = `
  query Client($id: ID!) {
    client(id: $id) {
      id
      firstName
      lastName
      sport
    }
  }
`;

const CreateGoalMutation = `
  mutation CreateGoal($input: CreateGoalInput!) {
    createGoal(input: $input) {
      id
      title
      sport
      trainingPlans {
        id
      }
    }
  }
`;

const CreateTrainingPlanMutation = `
  mutation CreateTrainingPlan($input: CreateTrainingPlanInput!) {
    createTrainingPlan(input: $input) {
      id
    }
  }
`;

const UpdateGoalMutation = `
  mutation UpdateGoal($id: ID!, $input: UpdateGoalInput!) {
    updateGoal(id: $id, input: $input) {
      id
      title
      trainingPlan {
        id
      }
    }
  }
`;

const goalSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	dueDate: z.date().optional(),
	assistantIds: z.array(z.string()).optional(),
	createTrainingPlan: z.boolean(),
});

type FormValues = z.infer<typeof goalSchema>;

export default function NewGoalPage() {
	const params = useParams();
	const clientId = params.id as string;
	const router = useRouter();

	const [{ data: clientData, fetching: clientFetching, error: clientError }] =
		useQuery({
			query: ClientQuery,
			variables: { id: clientId },
		});

	const [success, setSuccess] = useState(false);
	const [goalResult, executeGoalMutation] = useMutation(CreateGoalMutation);
	const [trainingPlanResult, executeTrainingPlanMutation] = useMutation(
		CreateTrainingPlanMutation,
	);
	const [updateGoalResult, executeUpdateGoalMutation] =
		useMutation(UpdateGoalMutation);

	const {
		register,
		handleSubmit,
		control,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>({
		resolver: zodResolver(goalSchema),
		defaultValues: {
			createTrainingPlan: true,
		},
	});

	const createTrainingPlan = watch("createTrainingPlan");
	const clientSport = clientData?.client?.sport || "";

	const onSubmit: SubmitHandler<FormValues> = async (values) => {
		setSuccess(false);

		try {
			// First create the goal
			const { data: goalData, error: goalError } = await executeGoalMutation({
				input: {
					clientId,
					title: values.title,
					description: values.description || "",
					sport: clientSport, // Always use the client's sport
					dueDate: values.dueDate,
					// Don't send training plan IDs yet as they don't exist
				},
			});

			if (goalError) {
				throw new Error(goalError.message);
			}

			const goalId = goalData?.createGoal?.id;

			// If createTrainingPlan is true and we have a goal ID, create the training plan
			if (createTrainingPlan && goalId && values.assistantIds?.length) {
				const { data: trainingPlanData, error: trainingPlanError } =
					await executeTrainingPlanMutation({
						input: {
							clientId,
							goalIds: [goalId], // Link the newly created goal to this training plan
							assistantIds: values.assistantIds,
						},
					});

				if (trainingPlanError) {
					throw new Error(trainingPlanError.message);
				}
			}

			setSuccess(true);

			// Navigate back to client page after a short delay
			setTimeout(() => {
				router.push(`/clients/${clientId}`);
			}, 1500);
		} catch (error) {
			console.error("Error creating goal:", error);
		}
	};

	// Display client name in heading if available
	const clientName = clientData?.client
		? `for ${clientData.client.firstName} ${clientData.client.lastName}`
		: "";

	if (clientFetching) {
		return <div className="container py-6">Loading client data...</div>;
	}

	if (clientError) {
		return <div className="container py-6">Error loading client data</div>;
	}

	const breadcrumbItems: BreadcrumbItemType[] = [
		{ href: "/clients", label: "Clients" },
		{ href: `/clients/${clientId}`, label: clientName || "Client" },
		{ href: "#", label: "New Goal", current: true },
	];

	return (
		<div className="container py-6">
			<div className="mb-4">
				<Breadcrumbs breadcrumbs={breadcrumbItems} />
			</div>

			<Card className="max-w-2xl mx-auto mt-8">
				<CardHeader>
					<CardTitle>Create New Goal {clientName}</CardTitle>
					<CardDescription>
						Define a goal for {clientSport} and optionally create a supporting
						training plan
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						id="new-goal-form"
						onSubmit={handleSubmit(onSubmit)}
						className="space-y-6"
					>
						{goalResult.error && (
							<ErrorMessage message={goalResult.error.message} />
						)}
						{trainingPlanResult.error && (
							<ErrorMessage message={trainingPlanResult.error.message} />
						)}
						{success && (
							<SuccessMessage message="Goal created successfully! Redirecting..." />
						)}

						<div className="space-y-2">
							<Controller
								name="title"
								control={control}
								render={({ field }) => (
									<GoalTitleSelect
										label="Goal Title"
										value={field.value}
										onChange={field.onChange}
										sport={clientSport}
										error={errors.title?.message}
										disabled={!clientSport}
									/>
								)}
							/>
						</div>

						{clientSport && createTrainingPlan && (
							<div className="space-y-2">
								<Controller
									name="assistantIds"
									control={control}
									render={({ field }) => (
										<AssistantMultiSelect
											label="Select Sport-Specific Assistants"
											sport={clientSport}
											strength={watch("title")}
											selectedAssistantIds={field.value || []}
											onChange={field.onChange}
											placeholder="Select assistants for this goal's training plan"
										/>
									)}
								/>
								<p className="text-xs text-muted-foreground">
									Select at least one assistant specialized in this goal
								</p>
							</div>
						)}

						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								{...register("description")}
								placeholder="Describe the goal in detail"
								className="resize-none h-24"
							/>
						</div>

						<div className="space-y-2">
							<Controller
								name="dueDate"
								control={control}
								render={({ field }) => (
									<DatePicker
										label="Target Date"
										date={field.value}
										setDate={field.onChange}
									/>
								)}
							/>
						</div>

						<div className="space-y-2">
							<div className="flex items-center space-x-2">
								<input
									type="checkbox"
									id="createTrainingPlan"
									{...register("createTrainingPlan")}
									className="h-4 w-4 rounded border-gray-300"
								/>
								<Label htmlFor="createTrainingPlan">
									Create Supporting Training Plan
								</Label>
							</div>
							<p className="text-xs text-muted-foreground ml-6">
								A training plan helps achieve the goal through structured
								activities and exercises
							</p>
						</div>
					</form>
				</CardContent>
				<CardFooter>
					<Button
						type="submit"
						form="new-goal-form"
						disabled={
							isSubmitting ||
							goalResult.fetching ||
							trainingPlanResult.fetching ||
							!clientSport
						}
						className="w-full"
					>
						{goalResult.fetching || trainingPlanResult.fetching
							? "Creating..."
							: createTrainingPlan
								? "Create Goal & Training Plan"
								: "Create Goal"}
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
