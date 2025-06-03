import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

interface EmptyStateProps {
	icon?: ReactNode;
	title: string;
	description: string;
	actionLabel?: string;
	actionHref?: string;
	ariaLabel?: string;
	className?: string;
}

export function EmptyState({
	icon = <PlusIcon className="size-10 text-muted-foreground/70" aria-hidden="true" />,
	title,
	description,
	actionLabel,
	actionHref,
	ariaLabel,
	className,
}: EmptyStateProps) {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center text-center py-16 px-6",
				className
			)}
			role="region"
			aria-label={ariaLabel || `No ${title.toLowerCase()} available`}
		>
			<div className="mb-6 flex size-20 items-center justify-center rounded-full bg-muted/50">
				{icon}
			</div>
			<div className="space-y-2 max-w-sm">
				<h3 className="text-lg font-semibold tracking-tight text-foreground">
					{title}
				</h3>
				<p className="text-sm text-muted-foreground leading-relaxed">
					{description}
				</p>
			</div>
			{actionLabel && actionHref && (
				<Button size="lg" asChild className="mt-6">
					<Link 
						href={actionHref} 
						aria-label={`Create your first ${title.toLowerCase().replace(/^no\s+/, "").replace(/\s+yet$/, "")}`}
					>
						<PlusIcon className="size-4" aria-hidden="true" />
						{actionLabel}
					</Link>
				</Button>
			)}
		</div>
	);
}