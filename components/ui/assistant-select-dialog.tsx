import type { Assistant } from "@/lib/types";
import { useState } from "react";
import { useQuery } from "urql";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

const assistantSelectSchema = z.object({
	assistantId: z.string().min(1, "Please select an assistant"),
});

type AssistantSelectFormData = z.infer<typeof assistantSelectSchema>;

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

	const form = useForm<AssistantSelectFormData>({
		resolver: zodResolver(assistantSelectSchema),
		defaultValues: {
			assistantId: "",
		},
	});

	const [{ data, fetching, error }] = useQuery<{ assistants: Assistant[] }>({
		query: AssistantsBySportQuery,
		variables: { sport },
		pause: !sport,
	});

	const assistants = data?.assistants || [];

	function handleSubmit(data: AssistantSelectFormData) {
		const selected = assistants.find((a) => a.id === data.assistantId);
		if (selected) {
			onSubmit(selected);
			form.reset();
			setOpen(false);
		}
	}

	function handleOpenChange(newOpen: boolean) {
		setOpen(newOpen);
		if (!newOpen) {
			form.reset();
		}
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
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
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
						<div className="space-y-2">
							<label
								htmlFor="assistantId"
								className="block text-sm font-medium"
							>
								Select Assistant
							</label>
							<select
								id="assistantId"
								{...form.register("assistantId")}
								className="flex h-10 w-full input"
							>
								<option value="">Select an assistant...</option>
								{assistants.map((a) => (
									<option key={a.id} value={a.id}>
										{a.name} ({a.role} - {a.sport})
									</option>
								))}
							</select>
							{form.formState.errors.assistantId && (
								<span className="text-xs text-destructive">
									{String(form.formState.errors.assistantId.message)}
								</span>
							)}
						</div>
						<DialogFooter>
							<Button type="submit" disabled={!form.formState.isValid}>
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
