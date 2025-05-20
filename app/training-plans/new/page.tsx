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
import { ClientCombobox } from "@/components/ui/client-combobox";
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

const ClientQuery = `
  query Client($id: ID!) {
    client(id: $id) {
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

const ClientGoalsQuery = `
  query ClientGoals($clientId: ID!) {
    goals(clientId: $clientId) {
      id
      title
      description
      status
    }
  }
`;

const trainingPlanSchema = z.object({
	clientId: z.string().min(1, "Client ID is required"),
	goalIds: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof trainingPlanSchema>;

const NewTrainingPlanForm: React.FC = () => {
	const searchParams = useSearchParams();
	const clientId = searchParams.get("clientId");
	const router = useRouter();

	const [{ data: clientData, fetching: clientFetching, error: clientError }] =
		useQuery({
			query: ClientQuery,
			variables: { id: clientId || "" },
			pause: !clientId,
		});

	const selectedClientIdRef = useRef<string | null>(clientId);
	const [{ data: goalsData, fetching: goalsFetching }] = useQuery({
		query: ClientGoalsQuery,
		variables: { clientId: selectedClientIdRef.current || "" },
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
			clientId: clientId || "",
			goalIds: [],
		},
	});

	const selectedClientId = watch("clientId");

	// Update the ref when selectedClientId changes
	useEffect(() => {
		selectedClientIdRef.current = selectedClientId;
	}, [selectedClientId]);

	// Set client ID from query param if it exists
	useEffect(() => {
		if (clientId) {
			setValue("clientId", clientId);
		}
	}, [clientId, setValue]);

	const [success, setSuccess] = useState(false);
	const [result, executeMutation] = useMutation(CreateTrainingPlanMutation);

	const onSubmit = async (values: FormValues) => {
		setSuccess(false);
		const { data, error } = await executeMutation({
			input: {
				clientId: values.clientId,
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

	// Show client name in heading if available
	const clientName = clientData?.client
		? `for ${clientData.client.firstName} ${clientData.client.lastName}`
		: "";

	// Get client's goals
	const goals = goalsData?.goals || [];
	const isLoadingGoals = !!selectedClientId && goalsFetching;

	if (clientFetching && clientId) {
		return <Loading message="Loading client information..." />;
	}

	if (clientError && clientId) {
		return <ErrorMessage message={clientError.message} />;
	}

	return (
		<Card className="max-w-md mx-auto mt-8 shadow">
			<CardHeader>
				<CardTitle>{`Create Training Plan ${clientName}`}</CardTitle>
				<CardDescription>
					Create a personalized training plan to help your client achieve their
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
							name="clientId"
							control={control}
							render={({ field }) => (
								<ClientCombobox
									label="Client"
									value={field.value}
									onChange={(value) => {
										field.onChange(value);
										// Reset goals when client changes
										setValue("goalIds", []);
									}}
									error={errors.clientId?.message}
									disabled={!!clientId} // Disable if clientId is provided in URL
								/>
							)}
						/>
					</div>

					{selectedClientId && (
						<div>
							<Controller
								name="goalIds"
								control={control}
								render={({ field }) => (
									<GoalMultiSelect
										label="Client Goals"
										goals={goals}
										selectedGoalIds={field.value || []}
										onChange={field.onChange}
										placeholder="Select client goals to include"
										disabled={isLoadingGoals}
										error={errors.goalIds?.message}
									/>
								)}
							/>
							{isLoadingGoals && (
								<p className="text-sm text-muted-foreground mt-2">
									Loading client goals...
								</p>
							)}
							{!isLoadingGoals && goals.length === 0 && (
								<p className="text-sm text-muted-foreground mt-2">
									This client has no goals yet
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
