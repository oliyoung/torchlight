import {
	Card,
	CardContent,
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

interface ClientTrainingPlansListProps {
	clientId: string;
	trainingPlans: TrainingPlan[];
}

export const ClientTrainingPlansList: React.FC<
	ClientTrainingPlansListProps
> = ({ clientId, trainingPlans }) => {
	return (
		<div className="mt-8">
			<div className="flex items-center justify-between mb-4">
				<Heading level={2}>Training Plans</Heading>
				<Button asChild size="sm">
					<Link href={`/training-plans/new?clientId=${clientId}`}>
						<PlusIcon className="w-4 h-4 mr-2" />
						New Training Plan
					</Link>
				</Button>
			</div>

			{trainingPlans && trainingPlans.length > 0 ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
					{trainingPlans.map((plan) => (
						<Card key={plan.id}>
							<CardHeader>
								<CardTitle>
									<Link
										href={`/training-plans/${plan.id}`}
										className="hover:underline"
									>
										{plan.title || "Untitled Training Plan"}
									</Link>
								</CardTitle>
							</CardHeader>
							<CardContent>
								{plan.overview && (
									<p className="text-sm text-muted-foreground line-clamp-2">
										{plan.overview}
									</p>
								)}
								<p className="text-xs text-muted-foreground mt-2">
									Created: {new Date(plan.createdAt).toLocaleDateString()}
								</p>
							</CardContent>
							<CardFooter>
								<Link
									href={`/training-plans/${plan.id}`}
									className="text-sm text-blue-600 hover:underline ml-auto"
								>
									View details
								</Link>
							</CardFooter>
						</Card>
					))}
				</div>
			) : (
				<div className="text-center p-10 border rounded-lg bg-muted/10 flex flex-col items-center justify-center gap-4">
					<div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
						<PlusIcon className="h-10 w-10 text-muted-foreground" />
					</div>
					<div className="space-y-2 max-w-md">
						<h3 className="text-xl font-semibold">No training plans yet</h3>
						<p className="text-muted-foreground">
							Create a training plan to help this client track their progress
							and achieve their goals.
						</p>
					</div>
					<Button size="lg" asChild className="mt-2">
						<Link href={`/training-plans/new?clientId=${clientId}`}>
							<PlusIcon className="w-5 h-5 mr-2" />
							Create First Training Plan
						</Link>
					</Button>
				</div>
			)}
		</div>
	);
};
