// @ts-nocheck
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { TrainingPlan } from "@/lib/types";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { Button } from "./ui/button";
import { Heading } from "./ui/heading";

/**
 * Component to display an athlete's training plans
 */
interface AthleteTrainingPlansListProps {
	athleteId: string;
	trainingPlans: TrainingPlan[];
}

export const AthleteTrainingPlansList: React.FC<
	AthleteTrainingPlansListProps
	// biome-ignore lint/suspicious/noExplicitAny: jsx generic inference
> = ({ athleteId, trainingPlans }) => {
	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<Heading level={2}>Training Plans</Heading>
				<Button variant="outline" size="sm" asChild>
					<Link href={`/training-plans/new?athleteId=${athleteId}`}>
						<PlusIcon className="h-4 w-4 mr-1" />
						New Training Plan
					</Link>
				</Button>
			</div>

			<CardDescription className="mb-4">
				Training plans help organize your athlete's progress and structure
				coaching sessions in a goal-oriented way.
			</CardDescription>

			{trainingPlans && trainingPlans.length > 0 ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{trainingPlans.map((plan) => (
						<Card key={plan.id} className="h-full">
							<CardHeader>
								<CardTitle className="text-lg">{plan.title}</CardTitle>
								{plan.summary && (
									<CardDescription>{plan.summary}</CardDescription>
								)}
							</CardHeader>
							<CardContent>
								<div className="flex flex-col gap-2">
									<div className="text-xs">
										{plan.goals?.length || 0} goals attached
									</div>
									{plan.duration && (
										<div className="text-xs">Duration: {plan.duration}</div>
									)}
									{plan.frequency && (
										<div className="text-xs">Frequency: {plan.frequency}</div>
									)}
								</div>
							</CardContent>
							<CardFooter>
								<div className="flex justify-end w-full">
									<Button asChild size="sm">
										<Link href={`/training-plans/${plan.id}`}>View Plan</Link>
									</Button>
								</div>
							</CardFooter>
						</Card>
					))}
				</div>
			) : (
				<Card>
					<CardHeader>
						<CardTitle>No Training Plans Yet</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">
							Create a training plan to help this athlete track their progress
							and achieve their goals.
						</p>
					</CardContent>
					<CardFooter>
						<Button asChild>
							<Link href={`/training-plans/new?athleteId=${athleteId}`}>
								<PlusIcon className="h-4 w-4 mr-1" />
								Create Training Plan
							</Link>
						</Button>
					</CardFooter>
				</Card>
			)}
		</div>
	);
};
