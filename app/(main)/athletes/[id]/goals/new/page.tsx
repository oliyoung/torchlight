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
import { Label } from "@/components/ui/label";
import { SuccessMessage } from "@/components/ui/success-message";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { useMutation, useQuery } from "urql";
import { z } from "zod";
import { logger } from '@/lib/logger';

const AthleteQuery = `
  query Athlete($id: ID!) {
    athlete(id: $id) {
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
	const athleteId = params.id as string;
	const router = useRouter();

	const [
		{ data: athleteData, fetching: athleteFetching, error: athleteError },
	] = useQuery({
		query: AthleteQuery,
		variables: { id: athleteId },
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
	const athleteSport = athleteData?.athlete?.sport || "";

	const onSubmit: SubmitHandler<FormValues> = async (values) => {
		setSuccess(false);

		try {
			// First create the goal
			const { data: goalData, error: goalError } = await executeGoalMutation({
				input: {
					athleteId,
					title: values.title,
					description: values.description || "",
					category: "SKILL", // Default category since it's required
					priority: "MEDIUM", // Default priority since it's required
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
							athleteId,
							goalIds: [goalId], // Link the newly created goal to this training plan
							assistantIds: values.assistantIds,
						},
					});

				if (trainingPlanError) {
					throw new Error(trainingPlanError.message);
				}
			}

			setSuccess(true);

			// Navigate back to athlete page after a short delay
			setTimeout(() => {
				router.push(`/athletes/${athleteId}`);
			}, 1500);
		} catch (error) {
			logger.error({ error }, "Error creating goal");
		}
	};

	// Display athlete name in heading if available
	const athleteName = athleteData?.athlete
		? `for ${athleteData.athlete.firstName} ${athleteData.athlete.lastName}`
		: "";

	if (athleteFetching) {
		return <div className="container py-6">Loading athlete data...</div>;
	}

	if (athleteError) {
		return <div className="container py-6">Error loading athlete data</div>;
	}

	const breadcrumbItems: BreadcrumbItemType[] = [
		{ href: "/athletes", label: "Athletes" },
		{ href: `/athletes/${athleteId}`, label: athleteName || "Athlete" },
		{ href: "#", label: "New Goal", current: true },
	];

	return (
		<div className="container py-6">
			<div className="mb-4">
				<Breadcrumbs breadcrumbs={breadcrumbItems} />
			</div>

			<Card className="max-w-2xl mx-auto mt-8">
				<CardHeader>
					<CardTitle>Create New Goal {athleteName}</CardTitle>
					<CardDescription>
						Define a goal for {athleteSport} and optionally create a supporting
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
										sport={athleteSport}
										error={errors.title?.message}
										disabled={!athleteSport}
									/>
								)}
							/>
						</div>

						{athleteSport && createTrainingPlan && (
							<div className="space-y-2">
								<Controller
									name="assistantIds"
									control={control}
									render={({ field }) => (
										<AssistantMultiSelect
											label="Select Sport-Specific Assistants"
											sport={athleteSport}
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
									className="h-4 w-4  border-gray-300"
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
							!athleteSport
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
