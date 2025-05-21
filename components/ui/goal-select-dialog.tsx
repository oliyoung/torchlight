import type { Goal } from "@/lib/types";
import { useState } from "react";
import { useQuery } from "urql";
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
	const [selectedId, setSelectedId] = useState<Goal["id"]>();

	const [{ data, fetching, error }] = useQuery<{ goals: Goal[] }>({
		query: AthleteGoalsQuery,
		variables: { athleteId },
		pause: !athleteId,
	});

	const goals = data?.goals || [];

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const selected = goals.find((g) => g.id === selectedId);
		if (selected) onSubmit(selected);
		setSelectedId("");
		setOpen(false);
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
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
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label
								htmlFor="goal-select"
								className="block text-sm font-medium mb-1"
							>
								Select Goal
							</label>
							<select
								id="goal-select"
								className="w-full border rounded px-2 py-1"
								value={selectedId}
								onChange={(e) => setSelectedId(e.target.value)}
								required
							>
								<option value="" disabled>
									Select a goal...
								</option>
								{goals.map((g) => (
									<option key={g.id} value={g.id}>
										{g.title} ({g.status})
									</option>
								))}
							</select>
						</div>
						<DialogFooter>
							<Button type="submit" disabled={!selectedId}>
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
