import React from "react";

interface HeadingProps {
	children: React.ReactNode;
	level?: 1 | 2 | 3 | 4 | 5 | 6;
	className?: string;
}

export const Heading: React.FC<HeadingProps> = ({
	children,
	level = 1,
	className = "",
}) =>
	React.createElement(
		`h${level}`,
		{
			className: `text-2xl font-bold${level === 2 ? " text-xl" : ""} ${className}`,
		},
		children,
	);
