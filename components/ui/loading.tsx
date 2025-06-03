import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingProps {
	message?: string
	className?: string
}

export const Loading: React.FC<LoadingProps> = ({ 
	message = "Loading...", 
	className 
}) => (
	<div 
		className={cn(
			"flex items-center justify-center space-x-2 py-8",
			className
		)}
		role="status"
		aria-live="polite"
	>
		<Loader2 className="size-4 animate-spin text-muted-foreground" />
		<span className="text-sm text-muted-foreground">{message}</span>
	</div>
)

interface LoadingSpinnerProps {
	size?: "sm" | "md" | "lg"
	className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
	size = "md", 
	className 
}) => {
	const sizeClasses = {
		sm: "size-4",
		md: "size-6", 
		lg: "size-8"
	}
	
	return (
		<Loader2 
			className={cn(
				"animate-spin text-muted-foreground",
				sizeClasses[size],
				className
			)}
			role="status"
			aria-label="Loading"
		/>
	)
}
