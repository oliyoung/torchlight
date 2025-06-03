"use client";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { Loading } from "@/components/ui/loading";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { logger } from "@/lib/logger";
import type { SessionLog } from "@/lib/types";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { useQuery } from "urql";

const SessionLogsQuery = `
	query {
		sessionLogs {
			id
			date
			notes
			transcript
			summary
			createdAt
			athlete {
				id
				firstName
				lastName
			}
		}
	}
`;

function SessionLogsList() {
	const [{ data, fetching, error }] = useQuery<{
		sessionLogs: SessionLog[];
	}>({
		query: SessionLogsQuery,
	});

	if (fetching) return <Loading message="Loading session logs..." />;
	if (error) {
		logger.error({ error, data }, "Session logs not found");
		return (
			<ErrorMessage
				message={`Error loading session logs: ${error.message}`}
			/>
		);
	}

	if (!data?.sessionLogs?.length) {
		return (
			<EmptyState
				title="No session logs yet"
				description="Start tracking training sessions to monitor athlete progress and performance."
				actionLabel="Create First Session Log"
				actionHref="/session-logs/new"
				ariaLabel="No session logs available"
			/>
		);
	}

	return (
		<div className="grid gap-4">
			{data.sessionLogs.map((sessionLog) => (
				<div
					key={sessionLog.id}
					className="border rounded-lg p-4 bg-card hover:bg-accent/50 transition-colors"
				>
					<div className="flex items-start justify-between">
						<div className="space-y-1">
							<div className="flex items-center gap-2">
								<h3 className="font-semibold text-lg">
									{sessionLog.athlete.firstName} {sessionLog.athlete.lastName}
								</h3>
								<span className="text-muted-foreground">•</span>
								<span className="text-sm text-muted-foreground">
									{new Date(sessionLog.date).toLocaleDateString()}
								</span>
							</div>
							{sessionLog.notes && (
								<p className="text-muted-foreground text-sm line-clamp-2">
									{sessionLog.notes}
								</p>
							)}
							{sessionLog.summary && (
								<p className="text-muted-foreground text-sm line-clamp-2">
									Summary: {sessionLog.summary}
								</p>
							)}
							<div className="flex items-center gap-4 text-xs text-muted-foreground">
								<span>
									Created: {new Date(sessionLog.createdAt).toLocaleDateString()}
								</span>
								{sessionLog.transcript && <span>Has athlete feedback</span>}
								{sessionLog.summary && <span>AI summary generated</span>}
							</div>
						</div>
						<div className="flex items-center gap-2">
							<Button size="sm" variant="outline" asChild>
								<Link href={`/session-logs/${sessionLog.id}`}>
									View Details
								</Link>
							</Button>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}

export default function Page() {
	return (
		<PageWrapper
			title="Session Logs"
			description="Manage and view all your athlete session logs"
			breadcrumbs={[{ label: "Session Logs", href: "/session-logs" }]}
			actions={
				<Button asChild>
					<Link href="/session-logs/new">
						<PlusIcon className="w-4 h-4 mr-2" />
						Add Session Log
					</Link>
				</Button>
			}
		>
			<SessionLogsList />
		</PageWrapper>
	);
}