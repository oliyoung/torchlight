"use client";
import Breadcrumbs from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import { ClientCombobox } from "@/components/ui/client-combobox";
import { ErrorMessage } from "@/components/ui/error-message";
import { Heading } from "@/components/ui/heading";
import { SuccessMessage } from "@/components/ui/success-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import type * as React from "react";
import { useEffect, useState } from "react";
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
    }
  }
`;

const trainingPlanSchema = z.object({
	clientId: z.string().min(1, "Client ID is required"),
});

type FormValues = z.infer<typeof trainingPlanSchema>;

const NewTrainingPlanForm: React.FC = () => {
	const searchParams = useSearchParams();
	const clientId = searchParams.get("clientId");
	const router = useRouter();

	const [{ data: clientData, fetching: clientFetching }] = useQuery({
		query: ClientQuery,
		variables: { id: clientId },
		pause: !clientId,
	});

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		formState: { errors },
		control,
	} = useForm<FormValues>({
		resolver: zodResolver(trainingPlanSchema),
		defaultValues: {
			clientId: clientId || "",
		},
	});

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

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="max-w-md mx-auto mt-8 space-y-6 bg-white p-6 rounded-lg shadow"
		>
			<Heading>Create Training Plan {clientName}</Heading>
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
							onChange={field.onChange}
							error={errors.clientId?.message}
							disabled={!!clientId} // Disable if clientId is provided in URL
						/>
					)}
				/>
			</div>
			<Button type="submit" disabled={result.fetching} className="w-full mt-4">
				{result.fetching ? "Creating..." : "Create Training Plan"}
			</Button>
		</form>
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
