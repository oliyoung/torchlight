import * as React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { TriangleAlertIcon } from "lucide-react";

interface ErrorMessageProps {
	message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
	return (
		<Alert variant="destructive">
			<TriangleAlertIcon className="h-4 w-4" />
			<AlertTitle>Error</AlertTitle>
			<AlertDescription>{message}</AlertDescription>
		</Alert>
	);
}
