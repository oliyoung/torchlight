import * as React from "react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SuccessMessageProps {
	message: string
	className?: string
}

export function SuccessMessage({ message, className }: Readonly<SuccessMessageProps>) {
	return (
		<Alert className={cn("border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/50 dark:text-green-200", className)}>
			<CheckCircle2 className="size-4 text-green-600 dark:text-green-400" />
			<AlertTitle className="text-green-800 dark:text-green-200">Success</AlertTitle>
			<AlertDescription className="text-green-700 dark:text-green-300">{message}</AlertDescription>
		</Alert>
	)
}
