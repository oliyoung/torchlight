import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Badge } from "./badge";
import { ScrollArea } from "./scroll-area";

export interface Goal {
	id: string;
	title: string;
	status: string;
	description?: string;
}

interface GoalMultiSelectProps {
	goals: Goal[];
	selectedGoalIds: string[];
	onChange: (goalIds: string[]) => void;
	disabled?: boolean;
	placeholder?: string;
	error?: string;
	label?: string;
	id?: string;
}

export function GoalMultiSelect({
	goals,
	selectedGoalIds,
	onChange,
	disabled = false,
	placeholder = "Select goals",
	error,
	label = "Goals",
	id = "goal-select",
}: GoalMultiSelectProps) {
	const [open, setOpen] = React.useState(false);

	const selectedGoals = React.useMemo(() => {
		return goals.filter((goal) => selectedGoalIds.includes(goal.id));
	}, [goals, selectedGoalIds]);

	const handleSelect = (goalId: string) => {
		if (selectedGoalIds.includes(goalId)) {
			// Remove if already selected
			onChange(selectedGoalIds.filter((id) => id !== goalId));
		} else {
			// Add if not selected
			onChange([...selectedGoalIds, goalId]);
		}
	};

	const removeGoal = (goalId: string, e: React.MouseEvent) => {
		e.stopPropagation();
		onChange(selectedGoalIds.filter((id) => id !== goalId));
	};

	return (
		<div className="space-y-2">
			{label && (
				<label
					htmlFor={id}
					className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					{label}
				</label>
			)}
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						id={id}
						variant="outline"
						aria-expanded={open}
						aria-label={placeholder}
						className={cn(
							"w-full justify-between font-normal",
							error ? "border-red-500" : "",
							!selectedGoals.length && "text-muted-foreground",
						)}
						disabled={disabled}
						onClick={() => setOpen(!open)}
					>
						{selectedGoals.length > 0 ? (
							<div className="flex flex-wrap gap-1 max-w-[90%] overflow-hidden">
								{selectedGoals.length <= 2 ? (
									selectedGoals.map((goal) => (
										<Badge key={goal.id} variant="secondary" className="mr-1">
											{goal.title}
											<button
												type="button"
												className="ml-1 ull outline-none focus:ring-2 focus:ring-offset-1"
												onClick={(e) => removeGoal(goal.id, e)}
												aria-label={`Remove ${goal.title}`}
											>
												<X className="h-3 w-3" />
											</button>
										</Badge>
									))
								) : (
									<span>{`${selectedGoals.length} goals selected`}</span>
								)}
							</div>
						) : (
							placeholder
						)}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-full p-0">
					<Command>
						<CommandInput placeholder="Search goals..." />
						<CommandList>
							<CommandEmpty>No goals found.</CommandEmpty>
							<CommandGroup>
								<ScrollArea className="h-60">
									{goals.map((goal) => (
										<CommandItem
											key={goal.id}
											value={goal.id}
											onSelect={() => handleSelect(goal.id)}
											className="flex items-center justify-between"
										>
											<div className="flex flex-col">
												<span>{goal.title}</span>
												{goal.description && (
													<span className="text-xs text-muted-foreground line-clamp-1">
														{goal.description}
													</span>
												)}
											</div>
											<div className="flex items-center gap-2">
												<Badge variant="outline">{goal.status}</Badge>
												{selectedGoalIds.includes(goal.id) && (
													<Check className="h-4 w-4" />
												)}
											</div>
										</CommandItem>
									))}
								</ScrollArea>
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
			{error && <p className="text-sm font-medium text-red-500">{error}</p>}
		</div>
	);
}
