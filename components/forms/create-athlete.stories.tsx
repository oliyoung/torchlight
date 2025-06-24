import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";
import { Input } from "@/components/ui/input";
import { SportSelect } from "@/components/ui/sport-select";
import { SuccessMessage } from "@/components/ui/success-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import type { CoachRole } from "@/lib/types";

const athleteSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	email: z.string().min(1, "Email is required").email("Invalid email address"),
	sport: z.string().min(1, "Sport is required"),
	birthday: z.string().optional(),
});

type FormValues = z.infer<typeof athleteSchema>;

// Standalone new athlete form component for Storybook
const StandaloneNewAthleteForm = ({
	coachRole = 'PROFESSIONAL' as CoachRole,
	showError = false,
	isSubmitting = false
}: {
	coachRole?: CoachRole;
	showError?: boolean;
	isSubmitting?: boolean;
}) => {
	const defaultValues = coachRole === 'SELF' ? {
		firstName: 'John',
		lastName: 'Doe',
		email: 'john.doe@example.com',
	} : {};

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
	const [localSubmitting, setLocalSubmitting] = useState(false);

	const submittingState = isSubmitting || localSubmitting;

	const onSubmit = async (values: FormValues) => {
		setLocalSubmitting(true);

		// Simulate submission
		setTimeout(() => {
			setSuccess(true);
			setLocalSubmitting(false);
			reset();
			setTimeout(() => setSuccess(false), 3000);
		}, 2000);
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
			{showError && <ErrorMessage message="Failed to create athlete. Please try again." />}
			{success && <SuccessMessage message="Athlete created successfully!" />}

			{coachRole === 'SELF' && (
				<div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
					<p className="text-sm text-blue-700">
						<strong>Self-Coached Mode:</strong> We've prefilled your information below. Feel free to adjust as needed.
					</p>
				</div>
			)}

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
					errors={{}}
					disabled={submittingState}
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
					errors={{}}
					disabled={submittingState}
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
					errors={{}}
					disabled={submittingState}
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
							disabled={submittingState}
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
					errors={{}}
					disabled={submittingState}
				/>
			</div>
			<Button type="submit" disabled={submittingState} className="w-full mt-4">
				{submittingState ? "Creating..." : "Create Athlete"}
			</Button>
		</form>
	);
};

const meta: Meta<typeof StandaloneNewAthleteForm> = {
	title: "Forms/NewAthleteForm",
	component: StandaloneNewAthleteForm,
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component: "Standalone form for creating new athletes. Automatically prefills coach information when in self-coached mode without requiring auth context."
			}
		}
	},
	decorators: [
		(Story) => (
			<div className="max-w-2xl mx-auto p-6 bg-background">
				<Story />
			</div>
		),
	],
	argTypes: {
		coachRole: {
			control: 'select',
			options: ['PROFESSIONAL', 'PERSONAL', 'SELF'],
			description: 'Coach role that determines prefilling behavior'
		},
		showError: {
			control: 'boolean',
			description: 'Show error state'
		},
		isSubmitting: {
			control: 'boolean',
			description: 'Show submitting state'
		}
	},
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StandaloneNewAthleteForm>;

export const Default: Story = {
	args: {
		coachRole: 'PROFESSIONAL' as CoachRole,
		showError: false,
		isSubmitting: false
	},
	parameters: {
		docs: {
			description: {
				story: "Default form state without any prefilled data (professional coach mode)."
			}
		}
	}
};

export const SelfCoachedPrefilled: Story = {
	args: {
		coachRole: 'SELF' as CoachRole,
		showError: false,
		isSubmitting: false
	},
	parameters: {
		docs: {
			description: {
				story: "Form automatically prefilled with coach profile data when in self-coached mode. Shows firstName, lastName, and email populated from coach profile."
			}
		}
	}
};

export const PersonalCoach: Story = {
	args: {
		coachRole: 'PERSONAL' as CoachRole,
		showError: false,
		isSubmitting: false
	},
	parameters: {
		docs: {
			description: {
				story: "Form for personal coaches (parents) - no prefilling as they manage children's profiles."
			}
		}
	}
};

export const WithError: Story = {
	args: {
		coachRole: 'PROFESSIONAL' as CoachRole,
		showError: true,
		isSubmitting: false
	},
	parameters: {
		docs: {
			description: {
				story: "Form showing error state after failed submission."
			}
		}
	}
};

export const SubmittingState: Story = {
	args: {
		coachRole: 'PROFESSIONAL' as CoachRole,
		showError: false,
		isSubmitting: true
	},
	parameters: {
		docs: {
			description: {
				story: "Form in submitting state with disabled inputs and loading button."
			}
		}
	}
};

export const SelfCoachedWithError: Story = {
	args: {
		coachRole: 'SELF' as CoachRole,
		showError: true,
		isSubmitting: false
	},
	parameters: {
		docs: {
			description: {
				story: "Self-coached form with prefilled data showing error state."
			}
		}
	}
};