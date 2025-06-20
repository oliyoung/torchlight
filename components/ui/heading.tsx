import { cn } from "@/lib/utils";
import { Epilogue } from "next/font/google";
import React from "react";

interface HeadingProps {
	children: React.ReactNode;
	level?: 1 | 2 | 3 | 4 | 5 | 6;
}

const epilogue = Epilogue({
	variable: "--font-epilogue",
	subsets: ["latin"],
	display: "swap",
	weight: ["400", "600"], // Specify the weights you need
});

export const Heading: React.FC<HeadingProps> = ({ children, level = 1 }) =>
	React.createElement(
		`h${level}`,
		{
			className: cn(
				`font-semibold tracking-tight ${epilogue.className}`,
				level === 2 ? " text-2xl" : "",
				level === 1 ? " text-3xl" : "",
			),
		},
		children,
	);
