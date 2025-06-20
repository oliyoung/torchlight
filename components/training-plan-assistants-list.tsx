import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { Assistant } from "@/lib/types";
import type React from "react";
import { AssistantSelectDialog } from "./ui/assistant-select-dialog";
import { Button } from "./ui/button";
import { Heading } from "./ui/heading";

interface TrainingPlanAssistantsListProps {
	sport: string;
	onAddAssistant: (assistant: Assistant) => void;
	onRemoveAssistant?: (assistantId: string) => void;
	assistants: Assistant[];
}

export const TrainingPlanAssistantsList: React.FC<
	TrainingPlanAssistantsListProps
> = ({ sport, onAddAssistant, onRemoveAssistant, assistants }) => {
	return (
		<div className="mt-8">
			<div className="flex items-center justify-between mb-2">
				<Heading level={2}>Assistants</Heading>
				<AssistantSelectDialog onSubmit={onAddAssistant} sport={sport} />
			</div>
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
							{onRemoveAssistant && (
								<Button
									onClick={() => onRemoveAssistant(assistant.id)}
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
		</div>
	);
};
