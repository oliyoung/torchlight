"use client";
import { Check, ChevronsUpDown, X } from "lucide-react";
import * as React from "react";
import { useQuery } from "urql";

import { cn } from "../../lib/utils";
import { Badge } from "./badge";
import { Button } from "./button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "./command";
import { Label } from "./label";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { ScrollArea } from "./scroll-area";

interface Assistant {
	id: string;
	name: string;
	sport: string;
	role: string;
	strengths: string[];
	bio: string;
}

interface AssistantMultiSelectProps {
	sport: string;
	selectedAssistantIds: string[];
	onChange: (assistantIds: string[]) => void;
	strength?: string;
	disabled?: boolean;
	placeholder?: string;
	error?: string;
	label?: string;
}

const AssistantsBySportQuery = `
  query AssistantsBySport($sport: String!, $strength: String) {
    assistants(input: { filter: { sport: $sport, strengths: [$strength] } }) {
      id
      name
      sport
      role
      strengths
      bio
    }
  }
`;

export function AssistantMultiSelect({
	sport,
	selectedAssistantIds,
	onChange,
	strength,
	disabled = false,
	placeholder = "Select assistants",
	error,
	label = "Assistants",
}: AssistantMultiSelectProps) {
	const [open, setOpen] = React.useState(false);

	const [{ data, fetching, error: queryError }] = useQuery<{
		assistants: Assistant[];
	}>({
		query: AssistantsBySportQuery,
		variables: { sport, strength },
		pause: !sport,
	});

	const assistants = data?.assistants || [];

	const selectedAssistants = React.useMemo(() => {
		return assistants.filter((assistant) =>
			selectedAssistantIds.includes(assistant.id),
		);
	}, [assistants, selectedAssistantIds]);

	const handleSelect = (assistantId: string) => {
		if (selectedAssistantIds.includes(assistantId)) {
			// Remove if already selected
			onChange(selectedAssistantIds.filter((id) => id !== assistantId));
		} else {
			// Add if not selected
			onChange([...selectedAssistantIds, assistantId]);
		}
	};

	const removeAssistant = (assistantId: string, e: React.MouseEvent) => {
		e.stopPropagation();
		onChange(selectedAssistantIds.filter((id) => id !== assistantId));
	};

	return (
		<div className="w-full">
			{label && (
				<Label
					htmlFor={`${label.toLowerCase().replace(/\s+/g, "-")}-select`}
					className="block text-sm font-medium mb-1"
				>
					{label}
				</Label>
			)}
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						id={`${label.toLowerCase().replace(/\s+/g, "-")}-select`}
						variant="outline"
						role="combobox"
						aria-label={label}
						aria-expanded={open}
						className={cn(
							"w-full justify-between",
							selectedAssistantIds.length > 0 ? "h-auto" : "h-10",
						)}
						disabled={disabled || fetching || !sport}
						onClick={() => setOpen(!open)}
					>
						<div className="flex flex-wrap gap-1 max-w-[90%]">
							{selectedAssistants.length > 0 ? (
								selectedAssistants.map((assistant) => (
									<Badge
										key={assistant.id}
										variant="secondary"
										className="mr-1 mb-1"
									>
										{assistant.name}
										<button
											type="button"
											className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
											onClick={(e) => removeAssistant(assistant.id, e)}
										>
											<X className="h-3 w-3" />
										</button>
									</Badge>
								))
							) : (
								<span className="text-muted-foreground">{placeholder}</span>
							)}
						</div>
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[300px] p-0">
					{fetching ? (
						<div className="p-4 text-center text-sm text-muted-foreground">
							Loading assistants...
						</div>
					) : queryError ? (
						<div className="p-4 text-center text-sm text-destructive">
							Error loading assistants: {queryError.message}
						</div>
					) : assistants.length === 0 ? (
						<div className="p-4 text-center text-sm text-muted-foreground">
							No assistants found for this sport.
						</div>
					) : (
						<Command>
							<CommandInput placeholder="Search assistants..." />
							<CommandList>
								<CommandEmpty>No assistant found.</CommandEmpty>
								<CommandGroup>
									<ScrollArea className="h-[200px]">
										{assistants.map((assistant) => (
											<CommandItem
												key={assistant.id}
												value={assistant.id}
												onSelect={() => handleSelect(assistant.id)}
											>
												<div className="flex items-center">
													<Check
														className={cn(
															"mr-2 h-4 w-4",
															selectedAssistantIds.includes(assistant.id)
																? "opacity-100"
																: "opacity-0",
														)}
													/>
													<div>
														<div className="font-medium">{assistant.name}</div>
														<div className="text-xs text-muted-foreground">
															{assistant.role} •{" "}
															{assistant.strengths.join(", ")}
														</div>
													</div>
												</div>
											</CommandItem>
										))}
									</ScrollArea>
								</CommandGroup>
							</CommandList>
						</Command>
					)}
				</PopoverContent>
			</Popover>
			{error && <span className="text-xs text-destructive mt-1">{error}</span>}
		</div>
	);
}
