import type { SessionLog } from "@/lib/types";
import { Heading } from "./ui/heading";

interface TrainingPlanSessionLogsListProps {
	sessionLogs: SessionLog[];
}

export const TrainingPlanSessionLogsList: React.FC<
	TrainingPlanSessionLogsListProps
> = ({ sessionLogs }) => (
	<div className="mt-8">
		<div className="flex items-center justify-between mb-2">
			<Heading level={2}>Session Logs</Heading>
		</div>
		{sessionLogs?.length > 0 ? (
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				{sessionLogs.map((sessionLog) => (
					<SessionLogCard key={sessionLog.id} sessionLog={sessionLog} />
				))}
			</div>
		) : (
			<div className="text-sm text-muted-foreground">
				No session logs attached.
			</div>
		)}
	</div>
);

const SessionLogCard: React.FC<{ sessionLog: SessionLog }> = ({
	sessionLog,
}) => (
	<div className="bg-white shadow-sm rounded-lg p-4">
		<h3 className="text-lg font-semibold mb-2">{sessionLog.date}</h3>
	</div>
);
