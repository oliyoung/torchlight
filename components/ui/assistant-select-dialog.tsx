import type { Assistant } from "@/lib/types";
import { useState } from "react";
import { useQuery } from "urql";
import { Button } from "./button";
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogClose,
} from "./dialog";
import { ErrorMessage } from "./error-message";
import { Loading } from "./loading";

interface AssistantSelectDialogProps {
	sport: string;
	onSubmit: (assistant: Assistant) => void;
	triggerLabel?: string;
}

const AssistantsBySportQuery = `
  query AssistantsBySport($sport: String!) {
    assistants(input: { filter: { sport: $sport } }) {
      id
      name
      sport
      role
      strengths
      bio
    }
  }
`;

export function AssistantSelectDialog({
	sport,
	onSubmit,
	triggerLabel = "Add Assistant",
}: AssistantSelectDialogProps) {
	const [open, setOpen] = useState(false);
	const [selectedId, setSelectedId] = useState<Assistant["id"]>();

	const [{ data, fetching, error }] = useQuery<{ assistants: Assistant[] }>({
		query: AssistantsBySportQuery,
		variables: { sport },
		pause: !sport,
	});

	const assistants = data?.assistants || [];

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const selected = assistants.find((a) => a.id === selectedId);
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
					<Loading message="Loading assistants..." />
				) : error ? (
					<ErrorMessage
						message={`Error loading assistants: ${error.message}`}
					/>
				) : (
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label
								htmlFor="assistant-select"
								className="block text-sm font-medium mb-1"
							>
								Select Assistant
							</label>
							<select
								id="assistant-select"
								className="w-full border  px-2 py-1"
								value={selectedId}
								onChange={(e) => setSelectedId(e.target.value)}
								required
							>
								<option value="" disabled>
									Select an assistant...
								</option>
								{assistants.map((a) => (
									<option key={a.id} value={a.id}>
										{a.name} ({a.role} - {a.sport})
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
