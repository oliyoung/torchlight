"use client";
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
import { Label } from "./label";

interface SportSelectProps {
	value: string;
	onChange: (value: string) => void;
	label?: string;
	error?: string;
	disabled?: boolean;
}

// List of available sports (can be expanded as needed)
const SPORTS = [
	{ id: "basketball", name: "Basketball" },
	{ id: "football", name: "Football" },
	{ id: "soccer", name: "Soccer" },
	{ id: "baseball", name: "Baseball" },
	{ id: "tennis", name: "Tennis" },
	{ id: "golf", name: "Golf" },
	{ id: "swimming", name: "Swimming" },
	{ id: "volleyball", name: "Volleyball" },
	{ id: "hockey", name: "Hockey" },
	{ id: "cricket", name: "Cricket" },
	{ id: "rugby", name: "Rugby" },
	{ id: "athletics", name: "Athletics" },
];

export function SportSelect({
	value,
	onChange,
	label = "Sport",
	error,
	disabled = false,
}: Readonly<SportSelectProps>) {
	const [open, setOpen] = React.useState(false);

	const selectedSport = SPORTS.find((sport) => sport.id === value);

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
			<Popover open={open} onOpenChange={setOpen} modal={false}>
				<PopoverTrigger asChild>
					<Button
						id={`${label.toLowerCase().replace(/\s+/g, "-")}-select`}
						variant="outline"
						aria-label={label}
						aria-expanded={open}
						className="w-full justify-between bg-input"
						disabled={disabled}
					>
						{selectedSport ? selectedSport.name : "Select a sport..."}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[250px] p-0 z-[9999]" side="bottom" align="start">
					<Command>
						<CommandInput placeholder="Search sports..." />
						<CommandList>
							<CommandEmpty>No sport found.</CommandEmpty>
							<CommandGroup>
								{SPORTS.map((sport) => (
									<CommandItem
										key={sport.id}
										value={sport.name}
										onSelect={() => {
											onChange(sport.id);
											setOpen(false);
										}}
									>
										<Check
											className={cn(
												"mr-2 h-4 w-4",
												value === sport.id ? "opacity-100" : "opacity-0",
											)}
										/>
										{sport.name}
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
