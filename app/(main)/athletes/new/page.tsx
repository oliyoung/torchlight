"use client";

import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { SportSelect } from "@/components/ui/sport-select";
import { SuccessMessage } from "@/components/ui/success-message";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Controller, useForm } from "react-hook-form";
import { useMutation } from "urql";
import { z } from "zod";

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
	tags: z.string().optional(),
	notes: z.string().optional(),
});

type FormValues = z.infer<typeof athleteSchema>;

function NewAthletePageContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const isOnboarding = searchParams.get('onboarding') === 'true';
	const {
		register,
		handleSubmit,
		control,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(athleteSchema),
	});
	const [success, setSuccess] = useState(false);
	const [result, executeMutation] = useMutation(CreateAthleteMutation);

	const onSubmit = async (values: FormValues) => {
		setSuccess(false);
		const tagsArray = values.tags
			? values.tags
				.split(",")
				.map((tag) => tag.trim())
				.filter(Boolean)
			: [];
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
				tags: tagsArray,
				notes: values.notes || undefined,
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
						You're almost done! Create your first athlete profile to complete your onboarding.
					</p>
				</div>
			)}

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
				{result.error && <ErrorMessage message={result.error.message} />}
				{success && <SuccessMessage message={isOnboarding ? "Athlete created successfully! Welcome to Torchlight!" : "Athlete created successfully! Redirecting..."} />}

				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label htmlFor="firstName">First Name</Label>
						<Input
							id="firstName"
							{...register("firstName")}
							autoComplete="given-name"
						/>
						{errors.firstName && (
							<span className="text-xs text-destructive">
								{errors.firstName.message}
							</span>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="lastName">Last Name</Label>
						<Input
							id="lastName"
							{...register("lastName")}
							autoComplete="family-name"
						/>
						{errors.lastName && (
							<span className="text-xs text-destructive">
								{errors.lastName.message}
							</span>
						)}
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						type="email"
						{...register("email")}
						autoComplete="email"
					/>
					{errors.email && (
						<span className="text-xs text-destructive">
							{errors.email.message}
						</span>
					)}
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<Controller
							name="sport"
							control={control}
							render={({ field }) => (
								<SportSelect
									label="Primary Sport"
									value={field.value}
									onChange={field.onChange}
									error={errors.sport?.message}
								/>
							)}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="gender">Gender</Label>
						<select
							id="gender"
							{...register("gender")}
							className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<option value="">Select gender</option>
							<option value="MALE">Male</option>
							<option value="FEMALE">Female</option>
							<option value="OTHER">Other</option>
							<option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
						</select>
					</div>
				</div>

				<div className="grid grid-cols-3 gap-4">
					<div className="space-y-2">
						<Label htmlFor="birthday">Birthday</Label>
						<Input
							id="birthday"
							type="date"
							{...register("birthday")}
						/>
						{errors.birthday && (
							<span className="text-xs text-destructive">
								{errors.birthday.message}
							</span>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="height">Height (cm)</Label>
						<Input
							id="height"
							type="number"
							step="0.1"
							{...register("height")}
							placeholder="e.g. 178"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="weight">Weight (kg)</Label>
						<Input
							id="weight"
							type="number"
							step="0.1"
							{...register("weight")}
							placeholder="e.g. 68"
						/>
					</div>
				</div>

				<div className="space-y-4">
					<h3 className="text-lg font-medium">Emergency Contact</h3>
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="emergencyContactName">Contact Name</Label>
							<Input
								id="emergencyContactName"
								{...register("emergencyContactName")}
								placeholder="Full name"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="emergencyContactPhone">Contact Phone</Label>
							<Input
								id="emergencyContactPhone"
								type="tel"
								{...register("emergencyContactPhone")}
								placeholder="Phone number"
							/>
						</div>
					</div>
				</div>

				<div className="space-y-4">
					<h3 className="text-lg font-medium">Medical Information</h3>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="medicalConditions">Medical Conditions</Label>
							<Textarea
								id="medicalConditions"
								{...register("medicalConditions")}
								rows={2}
								placeholder="Any medical conditions, allergies, or medications"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="injuries">Current or Past Injuries</Label>
							<Textarea
								id="injuries"
								{...register("injuries")}
								rows={2}
								placeholder="Any current or past injuries that may affect training"
							/>
						</div>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="tags">Tags (comma separated)</Label>
					<Input
						id="tags"
						{...register("tags")}
						autoComplete="off"
						placeholder="e.g. basketball, youth"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="notes">Notes</Label>
					<Textarea
						id="notes"
						{...register("notes")}
						rows={3}
						placeholder="Optional notes about the athlete"
					/>
				</div>

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
