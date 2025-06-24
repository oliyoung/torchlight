"use client";

import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";
import { BasicInformationForm } from "@/components/forms/basic-information";
import { SuccessMessage } from "@/components/ui/success-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "urql";
import { z } from "zod";
import { useCoachProfile } from "@/lib/hooks/use-coach-profile";

const CreateAthleteMutation = `
  mutation CreateAthlete($input: CreateAthleteInput!) {
    createAthlete(input: $input) { id }
  }
`;

const athleteSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	email: z.string().min(1, "Email is required").email("Invalid email address"),
	sport: z.string().min(1, "Sport is required"),
});

type FormValues = z.infer<typeof athleteSchema>;

export const NewAthleteForm = () => {
	const { coach } = useCoachProfile();

	const defaultValues = useMemo(() => {
		if (coach?.role === 'SELF') {
			return {
				firstName: coach.firstName || '',
				lastName: coach.lastName || '',
				email: coach.email || '',
			};
		}
		return {};
	}, [coach]);

	const {
		register,
		handleSubmit,
		reset,
		control,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(athleteSchema),
		defaultValues,
	});
	const [success, setSuccess] = useState(false);
	const [result, executeMutation] = useMutation(CreateAthleteMutation);

	const onSubmit = async (values: FormValues) => {
		setSuccess(false);
		const { error } = await executeMutation({
			input: {
				firstName: values.firstName,
				lastName: values.lastName,
				email: values.email,
				sport: values.sport,
			},
		});
		if (!error) {
			setSuccess(true);
			reset();
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
			{result.error && <ErrorMessage message={result.error.message} />}
			{success && <SuccessMessage message="Athlete created successfully!" />}
			<BasicInformationForm register={register} control={control} errors={errors} />
			<Button type="submit" disabled={result.fetching} className="w-full mt-4">
				{result.fetching ? "Creating..." : "Create Athlete"}
			</Button>
		</form>
	);
};