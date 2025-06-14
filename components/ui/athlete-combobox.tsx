"use client";
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
import type { Athlete } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";
import { useQuery } from "urql";

interface AthleteComboboxProps {
	value: string;
	onChange: (value: string) => void;
	label?: string;
	error?: string;
	disabled?: boolean;
}

const AthletesQuery = `
  query {
    athletes {
      id
      firstName
      lastName
      email
    }
  }
`;

export function AthleteCombobox({
	value,
	onChange,
	label,
	error,
	disabled = false,
}: AthleteComboboxProps) {
	const [{ data, fetching, error: fetchError }] = useQuery<{
		athletes: Athlete[];
	}>({
		query: AthletesQuery,
	});
	const [open, setOpen] = React.useState(false);

	const athletes = data?.athletes ?? [];
	const selectedAthlete = athletes.find((c) => c.id === value);

	return (
		<div>
			{label && (
				<label
					id={`${label.toLowerCase().replace(/\s+/g, "-")}-label`}
					className="block text-sm font-medium text-gray-700 mb-1"
				>
					{label}
				</label>
			)}
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						aria-label={label ?? "Select an athlete"}
						aria-expanded={open}
						className="w-full justify-between bg-input"
						disabled={fetching || disabled}
					>
						{selectedAthlete
							? `${selectedAthlete.firstName} ${selectedAthlete.lastName} (${selectedAthlete.email})`
							: "Select an athlete..."}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[350px] p-0 z-[9999]">
					<Command>
						<CommandInput placeholder="Search athlete..." />
						<CommandList>
							<CommandEmpty>No athlete found.</CommandEmpty>
							<CommandGroup>
								{athletes.map((athlete) => (
									<CommandItem
										key={athlete.id}
										value={`${athlete.firstName} ${athlete.lastName} ${athlete.email}`}
										onSelect={() => {
											onChange(athlete.id);
											setOpen(false);
										}}
									>
										<Check
											className={cn(
												"mr-2 h-4 w-4",
												value === athlete.id ? "opacity-100" : "opacity-0",
											)}
										/>
										{athlete.firstName} {athlete.lastName} ({athlete.email})
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
			{fetchError && (
				<div className="text-xs text-destructive mt-1">
					{fetchError.message}
				</div>
			)}
			{error && <span className="text-xs text-destructive">{error}</span>}
		</div>
	);
}
