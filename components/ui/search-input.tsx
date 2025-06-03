"use client";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

import { useState } from "react";

interface SearchInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
}

export function SearchInput({
	value,
	onChange,
	placeholder = "Search anything",
	className,
}: SearchInputProps) {
	return (
		<div className={`relative flex items-center w-full ${className}`}>
			<span className="absolute left-3 text-muted-foreground">
				<MagnifyingGlassIcon className="w-5 h-5" />
			</span>
			<input
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className="pl-10 pr-16 py-2 w-full  border border-slate-200 bg-background text-base focus:outline-none focus:ring-2 focus:ring-primary transition placeholder:text-muted-foreground"
				aria-label={placeholder}
			/>
			<span className="absolute right-3 flex items-center gap-1 bg-muted px-2 py-0.5  text-xs text-muted-foreground border border-border select-none">
				<kbd className="font-mono">⌘</kbd>
				<kbd className="font-mono">F</kbd>
			</span>
		</div>
	);
}

export function Search() {
	const [value, setValue] = useState("");

	return (
		<div className={"relative flex items-center w-full"}>
			<SearchInput value={value} onChange={setValue} />
		</div>
	);
}
