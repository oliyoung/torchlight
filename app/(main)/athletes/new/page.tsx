"use client";

import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { SuccessMessage } from "@/components/ui/success-message";
import { BasicInformationForm } from "@/components/forms/basic-information-form";
import { BiologicalInformationForm } from "@/components/forms/biological-information-form";
import { EmergencyContactForm } from "@/components/forms/emergency-contact-form";
import { MedicalInformationForm } from "@/components/forms/medical-information-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
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
	email: z.string(),
	sport: z.string().min(1, "Sport is required"),
	birthday: z.string().min(1, "Birthday is required"),
	gender: z.string().optional(),
	height: z.string().optional(),
	weight: z.string().optional(),
	emergencyContactName: z.string().optional(),
	emergencyContactPhone: z.string().optional(),
	medicalConditions: z.string().optional(),
	injuries: z.string().optional(),
});

type FormValues = z.infer<typeof athleteSchema>;

function NewAthletePageContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const isOnboarding = searchParams.get('onboarding') === 'true';
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
		const { data, error } = await executeMutation({
			input: {
				firstName: values.firstName,
				lastName: values.lastName,
				email: values.email,
				sport: values.sport,
				birthday: values.birthday,
				gender: values.gender || undefined,
				height: values.height ? parseFloat(values.height) : undefined,
				weight: values.weight ? parseFloat(values.weight) : undefined,
				emergencyContactName: values.emergencyContactName || undefined,
				emergencyContactPhone: values.emergencyContactPhone || undefined,
				medicalConditions: values.medicalConditions || undefined,
				injuries: values.injuries || undefined,
			},
		});
		if (!error && data?.createAthlete?.id) {
			setSuccess(true);

			// Navigate based on whether this is onboarding or regular athlete creation
			setTimeout(() => {
				if (isOnboarding) {
					// Complete onboarding, redirect to dashboard
					router.push('/');
				} else {
					// Regular flow, go to athlete's page
					router.push(`/athletes/${data.createAthlete.id}`);
				}
			}, 1500);
		}
	};

	return (
		<PageWrapper
			title={isOnboarding ? "Add Your First Athlete" : "Add New Athlete"}
			description={isOnboarding ? "Complete your onboarding by creating your first athlete profile" : "Create a new athlete profile"}
			breadcrumbs={isOnboarding ? [
				{ label: "Onboarding", href: "#" },
				{ label: "Add Athlete", href: "#" },
			] : [
				{ label: "Athletes", href: "/athletes" },
				{ label: "New Athlete", href: "#" },
			]}
		>
			{isOnboarding && (
				<div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
					<h3 className="font-semibold text-primary mb-2">Step 2 of 2: Add Your First Athlete</h3>
					<p className="text-sm text-muted-foreground">
						{coach?.role === 'SELF'
							? "You're almost done! We've prefilled your profile information below - feel free to adjust as needed to complete your athlete profile setup."
							: "You're almost done! Create your first athlete profile to complete your onboarding."
						}
					</p>
				</div>
			)}

			{coach?.role === 'SELF' && !isOnboarding && (
				<div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
					<h3 className="font-semibold text-blue-800 mb-2">Self-Coached Profile</h3>
					<p className="text-sm text-blue-700">
						We've prefilled your basic information below. You can adjust any details to customize your athlete profile.
					</p>
				</div>
			)}

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
				{result.error && <ErrorMessage message={result.error.message} />}
				{success && <SuccessMessage message={isOnboarding ? "Athlete created successfully! Welcome to Torchlight!" : "Athlete created successfully! Redirecting..."} />}
				<BasicInformationForm register={register} control={control} errors={errors} />
				<BiologicalInformationForm register={register} errors={errors} />
				<EmergencyContactForm register={register} errors={errors} />
				<MedicalInformationForm register={register} errors={errors} />
				<Button
					type="submit"
					onClick={handleSubmit(onSubmit)}
					disabled={result.fetching}
					className="w-full"
				>
					{result.fetching ? "Creating..." : isOnboarding ? "Complete Setup" : "Create Athlete"}
				</Button>
			</form>
		</PageWrapper>
	);
}

export default function NewAthletePage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<NewAthletePageContent />
		</Suspense>
	);
}
