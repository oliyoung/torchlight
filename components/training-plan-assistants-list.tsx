import type React from "react";
import type { Assistant } from "@/lib/types";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardFooter,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import { Heading } from "./ui/heading";

interface TrainingPlanAssistantsListProps {
	assistants: Assistant[];
}

export const TrainingPlanAssistantsList: React.FC<
	TrainingPlanAssistantsListProps
> = ({ assistants }) => {
	return (
		<div className="mt-8">
			<div className="flex items-center justify-between mb-2">
				<Heading level={2}>Assistants</Heading>
				<Button>Add Assistant</Button>
			</div>
			{assistants && assistants.length > 0 ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
					{assistants.map((assistant) => (
						<Card key={assistant.id}>
							<CardHeader>
								<CardTitle>{assistant.name}</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-xs text-muted-foreground mb-1">
									{assistant.role} &mdash; {assistant.sport}
								</div>
								<div className="text-xs">
									<span className="font-medium">Strengths:</span>{" "}
									{assistant.strengths?.join(", ")}
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
				<div className="text-sm text-muted-foreground">
					No assistants attached.
				</div>
			)}
		</div>
	);
};
