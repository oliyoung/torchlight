import * as React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2Icon } from "lucide-react";

interface SuccessMessageProps {
	message: string;
	className?: string;
}

export function SuccessMessage({ message, className }: SuccessMessageProps) {
	return (
		<Alert className={className}>
			<CheckCircle2Icon className="h-4 w-4 text-green-600" />
			<AlertTitle>Success</AlertTitle>
			<AlertDescription>{message}</AlertDescription>
		</Alert>
	);
}
