"use client";
import type * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "urql";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";
import { SuccessMessage } from "@/components/ui/success-message";
import { useState } from "react";
import Breadcrumbs from "@/components/breadcrumbs";
import { Heading } from "@/components/ui/heading";
import { Controller } from "react-hook-form";
import { ClientCombobox } from "../../../src/components/ui/client-combobox";

const CreateTrainingPlanMutation = `
mutation CreateTrainingPlan($input: CreateTrainingPlanInput!) {
    createTrainingPlan(input: $input) { id }
  }
`;

const trainingPlanSchema = z.object({
	title: z.string().min(1, "Title is required"),
	clientId: z.string().min(1, "Client ID is required"),
});

type FormValues = z.infer<typeof trainingPlanSchema>;

const NewTrainingPlanForm: React.FC = () => {
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
		control,
	} = useForm<FormValues>({
		resolver: zodResolver(trainingPlanSchema),
	});
	const [success, setSuccess] = useState(false);
	const [result, executeMutation] = useMutation(CreateTrainingPlanMutation);

	const onSubmit = async (values: FormValues) => {
		setSuccess(false);
		const { error } = await executeMutation({
			input: {
				title: values.title,
				clientId: values.clientId,
			},
		});
		if (!error) {
			setSuccess(true);
			reset();
		}
	};

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="max-w-md mx-auto mt-8 space-y-6 bg-white p-6 rounded-lg shadow"
		>
			<Heading>Create Training Plan</Heading>
			{result.error && <ErrorMessage message={result.error.message} />}
			{success && (
				<SuccessMessage message="Training plan created successfully!" />
			)}
			<div>
				<label
					htmlFor="title"
					className="block text-sm font-medium text-gray-700 mb-1"
				>
					Title
				</label>
				<Input id="title" {...register("title")} />
				{errors.title && (
					<span className="text-xs text-destructive">
						{errors.title.message}
					</span>
				)}
			</div>
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
