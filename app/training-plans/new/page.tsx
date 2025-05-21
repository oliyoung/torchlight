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
import { AthleteCombobox } from "@/components/ui/athlete-combobox";
import { ErrorMessage } from "@/components/ui/error-message";
import { GoalMultiSelect } from "@/components/ui/goal-multi-select";
import { Loading } from "@/components/ui/loading";
import { SuccessMessage } from "@/components/ui/success-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Controller } from "react-hook-form";
import { useMutation, useQuery } from "urql";
import { z } from "zod";

const CreateTrainingPlanMutation = `
mutation CreateTrainingPlan($input: CreateTrainingPlanInput!) {
    createTrainingPlan(input: $input) { id }
  }
`;

const AthleteQuery = `
  query Athlete($id: ID!) {
    athlete(id: $id) {
      id
      firstName
      lastName
      goals {
        id
        title
        description
        status
      }
    }
  }
`;

const AthleteGoalsQuery = `
  query AthleteGoals($athleteId: ID!) {
    goals(athleteId: $athleteId) {
      id
      title
      description
      status
    }
  }
`;

const trainingPlanSchema = z.object({
	athleteId: z.string().min(1, "Athlete ID is required"),
	goalIds: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof trainingPlanSchema>;

const NewTrainingPlanForm: React.FC = () => {
	const searchParams = useSearchParams();
	const athleteId = searchParams.get("athleteId");
	const router = useRouter();

	const [{ data: athleteData, fetching: athleteFetching, error: athleteError }] =
		useQuery({
			query: AthleteQuery,
			variables: { id: athleteId || "" },
			pause: !athleteId,
		});

	const selectedAthleteIdRef = useRef<string | null>(athleteId);
	const [{ data: goalsData, fetching: goalsFetching }] = useQuery({
		query: AthleteGoalsQuery,
		variables: { athleteId: selectedAthleteIdRef.current || "" },
	});

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		watch,
		formState: { errors, isSubmitting },
		control,
	} = useForm<FormValues>({
		resolver: zodResolver(trainingPlanSchema),
		defaultValues: {
			athleteId: athleteId || "",
			goalIds: [],
		},
	});

	const selectedAthleteId = watch("athleteId");

	// Update the ref when selectedAthleteId changes
	useEffect(() => {
		selectedAthleteIdRef.current = selectedAthleteId;
	}, [selectedAthleteId]);

	// Set athlete ID from query param if it exists
	useEffect(() => {
		if (athleteId) {
			setValue("athleteId", athleteId);
		}
	}, [athleteId, setValue]);

	const [success, setSuccess] = useState(false);
	const [result, executeMutation] = useMutation(CreateTrainingPlanMutation);

	const onSubmit = async (values: FormValues) => {
		setSuccess(false);
		const { data, error } = await executeMutation({
			input: {
				athleteId: values.athleteId,
				goalIds: values.goalIds || [],
			},
		});

		if (!error && data?.createTrainingPlan?.id) {
			setSuccess(true);
			// Navigate to the new training plan after a short delay
			setTimeout(() => {
				router.push(`/training-plans/${data.createTrainingPlan.id}`);
			}, 1500);
		}
	};

	// Show athlete name in heading if available
	const athleteName = athleteData?.athlete
		? `for ${athleteData.athlete.firstName} ${athleteData.athlete.lastName}`
		: "";

	// Get athlete's goals
	const goals = goalsData?.goals || [];
	const isLoadingGoals = !!selectedAthleteId && goalsFetching;

	if (athleteFetching && athleteId) {
		return <Loading message="Loading athlete information..." />;
	}

	if (athleteError && athleteId) {
		return <ErrorMessage message={athleteError.message} />;
	}

	return (
		<Card className="max-w-md mx-auto mt-8 shadow">
			<CardHeader>
				<CardTitle>{`Create Training Plan ${athleteName}`}</CardTitle>
				<CardDescription>
					Create a personalized training plan to help your athlete achieve their
					fitness goals
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					id="new-training-plan-form"
					onSubmit={handleSubmit(onSubmit)}
					className="space-y-6"
				>
					{result.error && <ErrorMessage message={result.error.message} />}
					{success && (
						<SuccessMessage message="Training plan created successfully! Redirecting..." />
					)}
					<div>
						<Controller
							name="athleteId"
							control={control}
							render={({ field }) => (
								<AthleteCombobox
									label="Athlete"
									value={field.value}
									onChange={(value) => {
										field.onChange(value);
										// Reset goals when athlete changes
										setValue("goalIds", []);
									}}
									error={errors.athleteId?.message}
									disabled={!!athleteId} // Disable if athleteId is provided in URL
								/>
							)}
						/>
					</div>

					{selectedAthleteId && (
						<div>
							<Controller
								name="goalIds"
								control={control}
								render={({ field }) => (
									<GoalMultiSelect
										label="Athlete Goals"
										goals={goals}
										selectedGoalIds={field.value || []}
										onChange={field.onChange}
										placeholder="Select athlete goals to include"
										disabled={isLoadingGoals}
										error={errors.goalIds?.message}
									/>
								)}
							/>
							{isLoadingGoals && (
								<p className="text-sm text-muted-foreground mt-2">
									Loading athlete goals...
								</p>
							)}
							{!isLoadingGoals && goals.length === 0 && (
								<p className="text-sm text-muted-foreground mt-2">
									This athlete has no goals yet
								</p>
							)}
						</div>
					)}
				</form>
			</CardContent>
			<CardFooter>
				<Button
					type="submit"
					form="new-training-plan-form"
					disabled={isSubmitting || result.fetching}
					className="w-full"
				>
					{result.fetching ? "Creating..." : "Create Training Plan"}
				</Button>
			</CardFooter>
		</Card>
	);
};

export default function NewTrainingPlanPage() {
	return (
		<>
			<Breadcrumbs />
			<NewTrainingPlanForm />
		</>
	);
}
