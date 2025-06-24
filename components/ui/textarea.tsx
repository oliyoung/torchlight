import * as React from "react"

import { cn } from "@/lib/utils"
import { Label } from "./label"
import { FieldErrors } from "react-hook-form";

export interface TextareaProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { errors: FieldErrors<any>; }

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, errors, ...props }, ref) => {
		const { name } = props
		if (!name) {
			throw new Error("Input component requires a 'name' prop for error handling.")
		}
		return (
			<div>
				<Label htmlFor={name}>{name}</Label>
				<textarea
					className={cn(
						"flex min-h-[80px] w-full bg-input rounded-md border border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
						className
					)}
					ref={ref}
					{...props}
				/>
				{errors && errors[name] && (
					<span className="text-xs text-destructive">
						{String(errors[name].message) || "This field is required"}
					</span>
				)}
			</div>
		)
	}
)
Textarea.displayName = "Textarea"

export { Textarea }
