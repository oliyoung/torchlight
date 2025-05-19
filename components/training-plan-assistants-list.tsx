import type React from "react";
import type { Assistant } from "@/lib/types";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardFooter,
} from "@/components/ui/card";
import { Heading } from "./ui/heading";
import { AssistantSelectDialog } from "./ui/assistant-select-dialog";

interface TrainingPlanAssistantsListProps {
	sport: string;
	onAddAssistant?: (assistant: Assistant) => void;
	assistants: Assistant[];
}

export const TrainingPlanAssistantsList: React.FC<
	TrainingPlanAssistantsListProps
> = ({ sport, onAddAssistant, assistants }) => {
	return (
		<div className="mt-8">
			<div className="flex items-center justify-between mb-2">
				<Heading level={2}>Assistants</Heading>
				<AssistantSelectDialog
					onSubmit={onAddAssistant || (() => {})}
					sport={sport}
				/>
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
							<button type="button" className="btn btn-xs btn-outline ml-auto">
								Remove
							</button>
						</CardFooter>
					</Card>
				))}
			</div>
		</div>
	);
};
