import type { Goal } from "@/lib/types";
import { useState } from "react";
import { useQuery } from "urql";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "./button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./dialog";
import { ErrorMessage } from "./error-message";
import { Loading } from "./loading";

interface GoalSelectDialogProps {
	athleteId: string;
	onSubmit: (goal: Goal) => void;
	triggerLabel?: string;
}

const goalSelectSchema = z.object({
	goalId: z.string().min(1, "Please select a goal"),
});

type GoalSelectFormData = z.infer<typeof goalSelectSchema>;

const AthleteGoalsQuery = `
  query AthleteGoals($athleteId: ID!) {
    goals(athleteId: $athleteId) {
      id
      title
      description
      status
      dueDate
    }
  }
`;

export function GoalSelectDialog({
	athleteId,
	onSubmit,
	triggerLabel = "Add Goal",
}: GoalSelectDialogProps) {
	const [open, setOpen] = useState(false);

	const form = useForm<GoalSelectFormData>({
		resolver: zodResolver(goalSelectSchema),
		defaultValues: {
			goalId: "",
		},
	});

	const [{ data, fetching, error }] = useQuery<{ goals: Goal[] }>({
		query: AthleteGoalsQuery,
		variables: { athleteId },
		pause: !athleteId,
	});

	const goals = data?.goals || [];

	function handleSubmit(data: GoalSelectFormData) {
		const selected = goals.find((g) => g.id === data.goalId);
		if (selected) {
			onSubmit(selected);
			form.reset();
			setOpen(false);
		}
	}

	function handleOpenChange(newOpen: boolean) {
		setOpen(newOpen);
		if (!newOpen) {
			form.reset();
		}
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button>{triggerLabel}</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{triggerLabel}</DialogTitle>
				</DialogHeader>
				{fetching ? (
					<Loading message="Loading goals..." />
				) : error ? (
					<ErrorMessage message={`Error loading goals: ${error.message}`} />
				) : goals.length === 0 ? (
					<div className="text-center py-4">
						<p className="text-muted-foreground">
							No goals found for this athlete.
						</p>
						<p className="text-sm">
							<a href={`/athletes/${athleteId}#goals`} className="underline">
								Create a goal for this athlete first
							</a>
						</p>
					</div>
				) : (
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
						<div className="space-y-2">
							<label
								htmlFor="goalId"
								className="block text-sm font-medium"
							>
								Select Goal
							</label>
							<select
								id="goalId"
								{...form.register("goalId")}
								className="flex h-10 w-full input"
							>
								<option value="">Select a goal...</option>
								{goals.map((g) => (
									<option key={g.id} value={g.id}>
										{g.title} ({g.status})
									</option>
								))}
							</select>
							{form.formState.errors.goalId && (
								<span className="text-xs text-destructive">
									{String(form.formState.errors.goalId.message)}
								</span>
							)}
						</div>
						<DialogFooter>
							<Button type="submit" disabled={!form.formState.isValid}>
								Add
							</Button>
							<DialogClose asChild>
								<Button type="button" variant="outline">
									Cancel
								</Button>
							</DialogClose>
						</DialogFooter>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
