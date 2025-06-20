"use client";

import { useQuery, useMutation } from "urql";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { Separator } from "@/components/ui/separator";

const SESSION_LOG_QUERY = `
  query GetSessionLog($id: ID!) {
    sessionLog(id: $id) {
      id
      date
      notes
      transcript
      summary
      athlete {
        id
        firstName
        lastName
      }
      goals {
        id
        title
        description
        status
      }
      createdAt
      updatedAt
    }
  }
`;

const SUMMARIZE_SESSION_LOG_MUTATION = `
  mutation SummarizeSessionLog($input: AISummarizeSessionLogInput!) {
    summarizeSessionLog(input: $input) {
      id
      summary
    }
  }
`;

const SessionLogDetail = () => {
	const params = useParams();
	const sessionLogId = params.id as string;

	const [{ data, fetching, error }] = useQuery({
		query: SESSION_LOG_QUERY,
		variables: { id: sessionLogId },
	});

	const [summarizeResult, summarizeSessionLog] = useMutation(SUMMARIZE_SESSION_LOG_MUTATION);

	const handleSummarize = () => {
		summarizeSessionLog({
			input: {
				sessionLogId: sessionLogId,
			},
		});
	};

	if (fetching) return <LoadingSpinner />;
	if (error) return <ErrorMessage message={error.message} />;

	const sessionLog = data?.sessionLog;
	if (!sessionLog) {
		return <ErrorMessage message="Session log not found" />;
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Session Log Details</h1>
					<p className="text-muted-foreground">
						{sessionLog.athlete.firstName} {sessionLog.athlete.lastName} • {new Date(sessionLog.date).toLocaleDateString()}
					</p>
				</div>
				{!sessionLog.summary && (
					<Button 
						onClick={handleSummarize}
						disabled={summarizeResult.fetching}
					>
						{summarizeResult.fetching ? "Generating..." : "Generate AI Summary"}
					</Button>
				)}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Session Information */}
				<Card>
					<CardHeader>
						<CardTitle>Session Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<h4 className="font-medium text-sm text-muted-foreground mb-2">Date</h4>
							<p>{new Date(sessionLog.date).toLocaleDateString()}</p>
						</div>
						
						{sessionLog.notes && (
							<div>
								<h4 className="font-medium text-sm text-muted-foreground mb-2">Coach Notes</h4>
								<p className="whitespace-pre-wrap">{sessionLog.notes}</p>
							</div>
						)}
						
						{sessionLog.transcript && (
							<div>
								<h4 className="font-medium text-sm text-muted-foreground mb-2">Athlete Feedback</h4>
								<p className="whitespace-pre-wrap">{sessionLog.transcript}</p>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Goals */}
				<Card>
					<CardHeader>
						<CardTitle>Related Goals</CardTitle>
					</CardHeader>
					<CardContent>
						{sessionLog.goals.length > 0 ? (
							<div className="space-y-3">
								{sessionLog.goals.map((goal: any) => (
									<div key={goal.id} className="flex items-start justify-between">
										<div className="flex-1">
											<h4 className="font-medium">{goal.title}</h4>
											{goal.description && (
												<p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
											)}
										</div>
										<Badge variant={goal.status === 'COMPLETED' ? 'default' : 'secondary'}>
											{goal.status}
										</Badge>
									</div>
								))}
							</div>
						) : (
							<p className="text-muted-foreground">No goals associated with this session</p>
						)}
					</CardContent>
				</Card>

				{/* AI Summary */}
				{sessionLog.summary && (
					<Card className="lg:col-span-2">
						<CardHeader>
							<CardTitle>AI-Generated Summary</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="prose prose-sm max-w-none">
								<div 
									className="whitespace-pre-wrap"
									dangerouslySetInnerHTML={{ 
										__html: sessionLog.summary.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>') 
									}}
								/>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
};

export default SessionLogDetail;
