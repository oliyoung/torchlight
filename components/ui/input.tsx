import * as React from "react"

import { cn } from "@/lib/utils"
import { Label } from "./label";
import { FieldErrors } from "react-hook-form";

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	errors: FieldErrors<any>;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, errors, ...props }, ref) => {
		const { name } = props
		if (!name) {
			throw new Error("Input component requires a 'name' prop for error handling.")
		}
		return (
			<div>
				<Label htmlFor={name}>{name}</Label>
				<input type={type} className={cn("flex w-full input", className)} ref={ref} {...props} />
				{errors && errors[name] && (
					<span className="text-xs text-destructive">
						{String(errors[name].message) || "This field is required"}
					</span>
				)}
			</div>
		)
	}
)
Input.displayName = "Input"

export { Input }
