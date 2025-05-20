"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Label } from "./label";

interface DatePickerProps {
	date?: Date;
	setDate: (date: Date | undefined) => void;
	label?: string;
	placeholder?: string;
	className?: string;
	error?: string;
	disabled?: boolean;
}

export function DatePicker({
	date,
	setDate,
	label = "Date",
	placeholder = "Select date",
	className,
	error,
	disabled = false,
}: DatePickerProps) {
	return (
		<div className={cn("w-full", className)}>
			{label && (
				<Label
					htmlFor={`${label.toLowerCase().replace(/\s+/g, "-")}-datepicker`}
					className="block text-sm font-medium mb-1"
				>
					{label}
				</Label>
			)}
			<Popover>
				<PopoverTrigger asChild>
					<Button
						id={`${label.toLowerCase().replace(/\s+/g, "-")}-datepicker`}
						variant="outline"
						className={cn(
							"w-full justify-start text-left font-normal",
							!date && "text-muted-foreground",
						)}
						disabled={disabled}
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{date ? format(date, "PPP") : <span>{placeholder}</span>}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0">
					<Calendar
						mode="single"
						selected={date}
						onSelect={setDate}
						initialFocus
					/>
				</PopoverContent>
			</Popover>
			{error && <span className="text-xs text-destructive mt-1">{error}</span>}
		</div>
	);
}
