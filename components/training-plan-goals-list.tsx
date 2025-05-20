import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { Goal } from "@/lib/types";
import type React from "react";
import { Button } from "./ui/button";
import { GoalSelectDialog } from "./ui/goal-select-dialog";
import { Heading } from "./ui/heading";

interface TrainingPlanGoalsListProps {
	goals: Goal[];
	clientId: string;
	onAddGoal?: (goal: Goal) => void;
	onRemoveGoal?: (goalId: string) => void;
}

export const TrainingPlanGoalsList: React.FC<TrainingPlanGoalsListProps> = ({
	goals,
	clientId,
	onAddGoal,
	onRemoveGoal,
}) => {
	return (
		<div className="mt-8">
			<div className="flex items-center justify-between mb-2">
				<Heading level={2}>Goals</Heading>
				{onAddGoal && (
					<GoalSelectDialog
						clientId={clientId}
						onSubmit={onAddGoal}
						triggerLabel="Add Goal"
					/>
				)}
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
								{goal.description && (
									<p className="text-sm mt-2">{goal.description}</p>
								)}
							</CardContent>
							<CardFooter>
								{onRemoveGoal && (
									<Button
										onClick={() => onRemoveGoal(goal.id)}
										variant="outline"
										size="sm"
										className="ml-auto"
									>
										Remove
									</Button>
								)}
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
