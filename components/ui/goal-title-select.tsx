"use client";
import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { getGoalTitlesBySport } from "../../lib/goals";
import { cn } from "../../lib/utils";
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

interface GoalTitleSelectProps {
	value: string;
	onChange: (value: string) => void;
	sport: string;
	label?: string;
	error?: string;
	disabled?: boolean;
}

export function GoalTitleSelect({
	value,
	onChange,
	sport,
	label = "Goal Title",
	error,
	disabled = false,
}: GoalTitleSelectProps) {
	const [open, setOpen] = React.useState(false);
	const [titles, setTitles] = React.useState<string[]>([]);
	const [customValue, setCustomValue] = React.useState("");

	// Update titles when sport changes
	React.useEffect(() => {
		if (sport) {
			setTitles(getGoalTitlesBySport(sport));
		} else {
			setTitles([]);
		}
	}, [sport]);

	// Handle custom input
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setCustomValue(e.target.value);
	};

	const handleCustomValueSelect = () => {
		if (customValue.trim()) {
			onChange(customValue.trim());
			setOpen(false);
			setCustomValue("");
		}
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
						className="w-full justify-between"
						disabled={disabled || !sport}
					>
						{value ? value : "Select or type a goal title..."}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[300px] p-0">
					<Command>
						<CommandInput
							placeholder="Search or create a goal title..."
							value={customValue}
							onValueChange={setCustomValue}
						/>
						<CommandList>
							<CommandEmpty>
								{customValue ? (
									<div className="py-3 px-4">
										<p className="text-sm">Create new goal title:</p>
										<Button
											variant="secondary"
											className="mt-2 w-full justify-start"
											onClick={handleCustomValueSelect}
										>
											{customValue}
										</Button>
									</div>
								) : (
									<p className="py-3 px-4 text-sm">No goal titles found.</p>
								)}
							</CommandEmpty>
							<CommandGroup heading="Suggested Goal Titles">
								{titles.map((title) => (
									<CommandItem
										key={title}
										value={title}
										onSelect={(currentValue) => {
											onChange(currentValue);
											setOpen(false);
										}}
									>
										<Check
											className={cn(
												"mr-2 h-4 w-4",
												value === title ? "opacity-100" : "opacity-0",
											)}
										/>
										{title}
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
			{error && <span className="text-xs text-destructive mt-1">{error}</span>}
		</div>
	);
}
