import type React from "react";
import { useState } from "react";
import type { Goal } from "@/lib/types";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardFooter,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import { Heading } from "./ui/heading";
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogClose,
} from "./ui/dialog";
import { Input } from "./ui/input";

interface TrainingPlanGoalsListProps {
	goals: Goal[];
	onAddGoal?: (goal: {
		title: string;
		description: string;
		status: string;
	}) => void;
}

export const TrainingPlanGoalsList: React.FC<TrainingPlanGoalsListProps> = ({
	goals,
	onAddGoal,
}) => {
	const [open, setOpen] = useState(false);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [status, setStatus] = useState("ACTIVE");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (onAddGoal) {
			onAddGoal({ title, description, status });
		}
		setTitle("");
		setDescription("");
		setStatus("ACTIVE");
		setOpen(false);
	};

	return (
		<div className="mt-8">
			<div className="flex items-center justify-between mb-2">
				<Heading level={2}>Goals</Heading>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button>Add Goal</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Add Goal</DialogTitle>
						</DialogHeader>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div>
								<label
									htmlFor="goal-title"
									className="block text-sm font-medium mb-1"
								>
									Title
								</label>
								<Input
									id="goal-title"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									required
								/>
							</div>
							<div>
								<label
									htmlFor="goal-description"
									className="block text-sm font-medium mb-1"
								>
									Description
								</label>
								<Input
									id="goal-description"
									value={description}
									onChange={(e) => setDescription(e.target.value)}
								/>
							</div>
							<div>
								<label
									htmlFor="goal-status"
									className="block text-sm font-medium mb-1"
								>
									Status
								</label>
								<select
									id="goal-status"
									className="w-full border rounded px-2 py-1"
									value={status}
									onChange={(e) => setStatus(e.target.value)}
								>
									<option value="ACTIVE">Active</option>
									<option value="COMPLETED">Completed</option>
									<option value="PAUSED">Paused</option>
								</select>
							</div>
							<DialogFooter>
								<Button type="submit">Add</Button>
								<DialogClose asChild>
									<Button type="button" variant="outline">
										Cancel
									</Button>
								</DialogClose>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</div>
			{goals && goals.length > 0 ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
					{goals.map((goal) => (
						<Card key={goal.id}>
							<CardHeader>
								<CardTitle>{goal.title}</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-xs text-muted-foreground mb-1">
									Status: {goal.status}
								</div>
							</CardContent>
							<CardFooter>
								<button
									type="button"
									className="btn btn-xs btn-outline ml-auto"
								>
									Remove
								</button>
							</CardFooter>
						</Card>
					))}
				</div>
			) : (
				<div className="text-sm text-muted-foreground">No goals attached.</div>
			)}
		</div>
	);
};
