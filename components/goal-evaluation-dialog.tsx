"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { GoalEvaluationResponse } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useMutation } from "urql";

const EXTRACT_AND_EVALUATE_GOAL_MUTATION = `
	mutation ExtractAndEvaluateGoal($input: AIExtractAndEvaluateGoalInput!) {
		extractAndEvaluateGoal(input: $input) {
			goalEvaluation {
				overallQualityScore
				specificityScore
				feasibilityScore
				relevanceScore
				timeStructureScore
				motivationScore
				evaluationSummary {
					strengths
					weaknesses
					riskFactors
					improvementPriorities
				}
			}
			coreGoal {
				type
				primaryObjective
				sport
				measurableOutcome
			}
			refinedGoalSuggestion {
				improvedGoalStatement
				keyChanges
				rationale
			}
			coachingFeedback {
				improvementSuggestions
				riskFlags
				keyGapsIdentified
			}
		}
	}
`;

const CREATE_GOAL_MUTATION = `
	mutation CreateGoal($input: CreateGoalInput!) {
		createGoal(input: $input) {
			id
			title
			description
			status
			sport
		}
	}
`;

interface GoalEvaluationDialogProps {
	athleteId: string;
	trigger?: React.ReactNode;
	onGoalCreated?: () => void;
}

const QUALITY_THRESHOLD = 7; // Goals with score >= 7 will be created automatically

export function GoalEvaluationDialog({
	athleteId,
	trigger,
	onGoalCreated
}: GoalEvaluationDialogProps) {
	const [open, setOpen] = useState(false);
	const [goalText, setGoalText] = useState("");
	const [evaluation, setEvaluation] = useState<GoalEvaluationResponse | null>(null);
	const [showFeedback, setShowFeedback] = useState(false);

	const [{ fetching: evaluating }, executeEvaluation] = useMutation(EXTRACT_AND_EVALUATE_GOAL_MUTATION);
	const [{ fetching: creating }, executeCreateGoal] = useMutation(CREATE_GOAL_MUTATION);

	const handleEvaluate = async () => {
		if (!goalText.trim()) return;

		try {
			const result = await executeEvaluation({
				input: {
					athleteId,
					goalText: goalText.trim(),
				},
			});

			if (result.error) {
				throw new Error(result.error.message);
			}

			const evaluationResponse = result.data?.extractAndEvaluateGoal;
			setEvaluation(evaluationResponse);

			const score = evaluationResponse?.goalEvaluation?.overallQualityScore || 0;

			if (score >= QUALITY_THRESHOLD) {
				// Auto-create goal if score is high enough
				await createGoal(evaluationResponse);
			} else {
				// Show feedback for improvement
				setShowFeedback(true);
			}
		} catch (error) {
			console.error("Error evaluating goal:", error);
		}
	};

	const createGoal = async (evaluationResponse: GoalEvaluationResponse) => {
		try {
			const coreGoal = evaluationResponse.coreGoal;
			const refinedGoal = evaluationResponse.refinedGoalSuggestion;

			const goalTitle = coreGoal.primaryObjective;
			const goalDescription = refinedGoal.improvedGoalStatement || goalText;
			const sport = coreGoal.sport || "General";

			const result = await executeCreateGoal({
				input: {
					athleteId,
					title: goalTitle,
					description: goalDescription,
					sport,
				},
			});

			if (result.error) {
				throw new Error(result.error.message);
			}

			// Reset and close dialog
			setGoalText("");
			setEvaluation(null);
			setShowFeedback(false);
			setOpen(false);
			onGoalCreated?.();
		} catch (error) {
			console.error("Error creating goal:", error);
		}
	};

	const handleCreateAfterFeedback = async () => {
		if (evaluation) {
			await createGoal(evaluation);
		}
	};

	const resetDialog = () => {
		setGoalText("");
		setEvaluation(null);
		setShowFeedback(false);
	};

	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen);
		if (!newOpen) {
			resetDialog();
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				{trigger || <Button>Add Goal</Button>}
			</DialogTrigger>
			<DialogContent className="flex flex-col bg-white">
				<DialogHeader>
					<DialogTitle>Create New Goal</DialogTitle>
				</DialogHeader>
				<div className="gap-4">
					<div className="flex-2 flex flex-col gap-4">
						<Textarea
							id="goal-text"
							value={goalText}
							onChange={(e) => setGoalText(e.target.value)}
							placeholder="Enter a detailed description of the training goal..."
							className="min-h-[200px] resize-none"
							disabled={evaluating || creating}
						/>
					</div>
					<div className="flex-1 flex flex-col gap-4 overflow-auto">
						{evaluation && showFeedback && (
							<>
								<div className="space-y-4">
									<div className="text-center">
										<h3 className="text-lg font-semibold mb-2">Goal Evaluation</h3>
										<div className="text-3xl font-bold text-orange-600">
											{evaluation.goalEvaluation.overallQualityScore}/10
										</div>
										<p className="text-sm text-muted-foreground">
											Overall Quality Score (Threshold: {QUALITY_THRESHOLD})
										</p>
									</div>

									{/* Score Breakdown */}
									<div className="grid grid-cols-2 gap-2 text-sm">
										<div>Specificity: {evaluation.goalEvaluation.specificityScore}/10</div>
										<div>Feasibility: {evaluation.goalEvaluation.feasibilityScore}/10</div>
										<div>Relevance: {evaluation.goalEvaluation.relevanceScore}/10</div>
										<div>Time Structure: {evaluation.goalEvaluation.timeStructureScore}/10</div>
										<div>Motivation: {evaluation.goalEvaluation.motivationScore}/10</div>
									</div>

									{/* Feedback Sections */}
									{evaluation.goalEvaluation.evaluationSummary.weaknesses.length > 0 && (
										<Alert>
											<AlertDescription>
												<strong>Areas for Improvement:</strong>
												<ul className="list-disc list-inside mt-1">
													{evaluation.goalEvaluation.evaluationSummary.weaknesses.map((weakness, i) => (
														<li key={weakness} className="text-sm">{weakness}</li>
													))}
												</ul>
											</AlertDescription>
										</Alert>
									)}

									{evaluation.refinedGoalSuggestion.improvedGoalStatement && (
										<Alert>
											<AlertDescription>
												<strong>Suggested Improvement:</strong>
												<p className="mt-1 italic">"{evaluation.refinedGoalSuggestion.improvedGoalStatement}"</p>
												<p className="mt-2 text-sm">{evaluation.refinedGoalSuggestion.rationale}</p>
											</AlertDescription>
										</Alert>
									)}

									{evaluation.coachingFeedback.improvementSuggestions.length > 0 && (
										<Alert>
											<AlertDescription>
												<strong>Coaching Recommendations:</strong>
												<ul className="list-disc list-inside mt-1">
													{evaluation.coachingFeedback.improvementSuggestions.map((suggestion, i) => (
														<li key={suggestion} className="text-sm">{suggestion}</li>
													))}
												</ul>
											</AlertDescription>
										</Alert>
									)}
								</div>

								<div className="flex gap-2 mt-auto">
									<Button
										variant="outline"
										onClick={resetDialog}
										className="flex-1"
									>
										Revise Goal
									</Button>
									<Button
										onClick={handleCreateAfterFeedback}
										disabled={creating}
										className="flex-1"
									>
										{creating ? (
											<>
												<Loader2 className="w-4 h-4 mr-2 animate-spin" />
												Creating...
											</>
										) : (
											"Create Anyway"
										)}
									</Button>
								</div>
							</>
						)}

						{evaluation && !showFeedback && (
							<div className="flex flex-col items-center justify-center h-full">
								<div className="text-center">
									<div className="text-3xl font-bold text-green-600 mb-2">
										{evaluation.goalEvaluation.overallQualityScore}/10
									</div>
									<h3 className="text-lg font-semibold mb-2">Excellent Goal!</h3>
									<p className="text-muted-foreground mb-4">
										Your goal meets our quality standards and has been created automatically.
									</p>
									<Loader2 className="w-8 h-8 mx-auto animate-spin" />
									<p className="text-sm text-muted-foreground mt-2">Creating goal...</p>
								</div>
							</div>
						)}

						{!evaluation && !evaluating && (
							<div className="flex flex-col  h-full text-muted-foreground">
								<p>Enter a goal description and click "Evaluate Goal" to see AI analysis and feedback.</p>
							</div>
						)}
					</div>
				</div>
				<Button
					onClick={handleEvaluate}
					disabled={!goalText.trim() || evaluating || creating}
					className="w-full"
				>
					{evaluating ? (
						<>
							<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							Evaluating Goal...
						</>
					) : (
						"Evaluate Goal"
					)}
				</Button>
			</DialogContent>
		</Dialog>
	);
}