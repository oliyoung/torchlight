import { cn } from "@/lib/utils";
import React from "react";

interface HeadingProps {
	children: React.ReactNode;
	level?: 1 | 2 | 3 | 4 | 5 | 6;
	className?: string;
}

export const Heading: React.FC<HeadingProps> = ({
	children,
	level = 1
}) =>
	React.createElement(
		`h${level}`,
		{
			className: cn("text-xl font-epilogue", level === 2 ? " text-xl" : "", level === 1 ? " text-3xl" : ""),
		},
		children,
	);
