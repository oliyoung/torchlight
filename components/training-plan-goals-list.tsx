import type React from "react";
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

interface TrainingPlanGoalsListProps {
	goals: Goal[];
}

export const TrainingPlanGoalsList: React.FC<TrainingPlanGoalsListProps> = ({
	goals,
}) => (
	<div className="mt-8">
		<div className="flex items-center justify-between mb-2">
			<Heading level={2}>Goals</Heading>
			<Button>Add Goal</Button>
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
							<button type="button" className="btn btn-xs btn-outline ml-auto">
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
