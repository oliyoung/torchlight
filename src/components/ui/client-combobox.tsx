"use client";
import * as React from "react";
import { useQuery } from "urql";
import type { Client } from "@/lib/types";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
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

interface ClientComboboxProps {
	value: string;
	onChange: (value: string) => void;
	label?: string;
	error?: string;
}

const ClientsQuery = `
  query {
    clients {
      id
      firstName
      lastName
      email
    }
  }
`;

export function ClientCombobox({
	value,
	onChange,
	label,
	error,
}: ClientComboboxProps) {
	const [{ data, fetching, error: fetchError }] = useQuery<{
		clients: Client[];
	}>({
		query: ClientsQuery,
	});
	const [open, setOpen] = React.useState(false);

	const clients = data?.clients ?? [];
	const selectedClient = clients.find((c) => c.id === value);

	return (
		<div>
			{label && (
				<label className="block text-sm font-medium text-gray-700 mb-1">
					{label}
				</label>
			)}
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						role="select"
						aria-label={label ?? "Select a client"}
						aria-expanded={open}
						className="w-full justify-between"
						disabled={fetching}
					>
						{selectedClient
							? `${selectedClient.firstName} ${selectedClient.lastName} (${selectedClient.email})`
							: "Select a client..."}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[350px] p-0">
					<Command>
						<CommandInput placeholder="Search client..." />
						<CommandList>
							<CommandEmpty>No client found.</CommandEmpty>
							<CommandGroup>
								{clients.map((client) => (
									<CommandItem
										key={client.id}
										value={client.id}
										onSelect={(currentValue) => {
											onChange(currentValue === value ? "" : currentValue);
											setOpen(false);
										}}
									>
										<Check
											className={cn(
												"mr-2 h-4 w-4",
												value === client.id ? "opacity-100" : "opacity-0",
											)}
										/>
										{client.firstName} {client.lastName} ({client.email})
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
