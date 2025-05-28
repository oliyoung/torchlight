"use client";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";
import { Input } from "@/components/ui/input";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { SportSelect } from "@/components/ui/sport-select";
import { SuccessMessage } from "@/components/ui/success-message";
import { zodResolver } from "@hookform/resolvers/zod";
import type * as React from "react";
import { useState } from "react";
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
	email: z.string().min(1, "Email is required").email("Invalid email address"),
	sport: z.string().min(1, "Sport is required"),
	tags: z.string().optional(),
	notes: z.string().optional(),
	birthday: z.string().optional(),
});

type FormValues = z.infer<typeof athleteSchema>;

const NewAthleteForm: React.FC = () => {
	const {
		register,
		handleSubmit,
		reset,
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
		const { error } = await executeMutation({
			input: {
				firstName: values.firstName,
				lastName: values.lastName,
				email: values.email,
				sport: values.sport,
				tags: tagsArray,
				notes: values.notes || "",
				birthday: values.birthday || "",
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
			<div>
				<label
					htmlFor="firstName"
					className="block text-sm font-medium text-gray-700 mb-1"
				>
					First Name
				</label>
				<Input
					id="firstName"
					{...register("firstName")}
					autoComplete="given-name"
					className="mt-1"
				/>
				{errors.firstName && (
					<span className="text-xs text-destructive">
						{errors.firstName.message}
					</span>
				)}
			</div>
			<div>
				<label
					htmlFor="lastName"
					className="block text-sm font-medium text-gray-700 mb-1"
				>
					Last Name
				</label>
				<Input
					id="lastName"
					{...register("lastName")}
					autoComplete="family-name"
					className="mt-1"
				/>
				{errors.lastName && (
					<span className="text-xs text-destructive">
						{errors.lastName.message}
					</span>
				)}
			</div>
			<div>
				<label
					htmlFor="email"
					className="block text-sm font-medium text-gray-700 mb-1"
				>
					Email
				</label>
				<Input
					id="email"
					type="email"
					{...register("email")}
					autoComplete="email"
					className="mt-1"
				/>
				{errors.email && (
					<span className="text-xs text-destructive">
						{errors.email.message}
					</span>
				)}
			</div>
			<div>
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
			<div>
				<label
					htmlFor="birthday"
					className="block text-sm font-medium text-gray-700 mb-1"
				>
					Birthday
				</label>
				<Input
					id="birthday"
					type="date"
					{...register("birthday")}
					className="mt-1"
				/>
			</div>
			<div>
				<label
					htmlFor="tags"
					className="block text-sm font-medium text-gray-700 mb-1"
				>
					Tags (comma separated)
				</label>
				<Input
					id="tags"
					{...register("tags")}
					autoComplete="off"
					className="mt-1"
					placeholder="e.g. basketball, youth"
				/>
			</div>
			<div>
				<label
					htmlFor="notes"
					className="block text-sm font-medium text-gray-700 mb-1"
				>
					Notes
				</label>
				<textarea
					id="notes"
					{...register("notes")}
					className="mt-1 block w-full rounded border border-input bg-background p-2"
					rows={3}
					placeholder="Optional notes about the athlete"
				/>
			</div>
			<Button type="submit" disabled={result.fetching} className="w-full mt-4">
				{result.fetching ? "Creating..." : "Create Athlete"}
			</Button>
		</form>
	);
};

export default function Page() {
	return (
		<PageWrapper
			title="Add New Athlete"
			description="Add a new athlete to your database"
			breadcrumbs={[
				{ label: "Athletes", href: "/athletes" },
				{ label: "New", href: "/athletes/new" },
			]}
		>
			<NewAthleteForm />
		</PageWrapper>
	);
}
