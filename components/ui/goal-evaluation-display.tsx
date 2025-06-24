import { Card } from "@/components/ui/card";
import { GoalEvaluationResponse } from "@/lib/types";

interface GoalEvaluationDisplayProps {
  evaluation: GoalEvaluationResponse;
  className?: string;
  showExtendedInfo?: boolean;
}

export function GoalEvaluationDisplay({
  evaluation,
  className = "",
  showExtendedInfo = false
}: GoalEvaluationDisplayProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBackground = (score: number) => {
    if (score >= 8) return "bg-green-50";
    if (score >= 6) return "bg-yellow-50";
    return "bg-red-50";
  };

  return (
    <Card className={`p-4 space-y-4 ${className}`}>
      <div>
        <h3 className="font-semibold text-lg mb-2">AI Goal Evaluation</h3>

        {/* Quality Scores and Core Goal Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium">Quality Scores</h4>
            <div className="space-y-1 text-sm">
              <div className={`flex justify-between p-2 rounded ${getScoreBackground(evaluation.goalEvaluation.overallQualityScore)}`}>
                <span>Overall Quality:</span>
                <span className={`font-medium ${getScoreColor(evaluation.goalEvaluation.overallQualityScore)}`}>
                  {evaluation.goalEvaluation.overallQualityScore}/10
                </span>
              </div>
              <div className="flex justify-between">
                <span>Specificity:</span>
                <span className={getScoreColor(evaluation.goalEvaluation.specificityScore)}>
                  {evaluation.goalEvaluation.specificityScore}/10
                </span>
              </div>
              <div className="flex justify-between">
                <span>Feasibility:</span>
                <span className={getScoreColor(evaluation.goalEvaluation.feasibilityScore)}>
                  {evaluation.goalEvaluation.feasibilityScore}/10
                </span>
              </div>
              <div className="flex justify-between">
                <span>Relevance:</span>
                <span className={getScoreColor(evaluation.goalEvaluation.relevanceScore)}>
                  {evaluation.goalEvaluation.relevanceScore}/10
                </span>
              </div>
              {showExtendedInfo && (
                <>
                  <div className="flex justify-between">
                    <span>Time Structure:</span>
                    <span className={getScoreColor(evaluation.goalEvaluation.timeStructureScore)}>
                      {evaluation.goalEvaluation.timeStructureScore}/10
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Motivation:</span>
                    <span className={getScoreColor(evaluation.goalEvaluation.motivationScore)}>
                      {evaluation.goalEvaluation.motivationScore}/10
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Extracted Goal</h4>
            <div className="space-y-1 text-sm">
              <div><strong>Title:</strong> {evaluation.coreGoal.title}</div>
              <div><strong>Type:</strong> {evaluation.coreGoal.type}</div>
              <div><strong>Sport:</strong> {evaluation.coreGoal.sport}</div>
              {showExtendedInfo && evaluation.coreGoal.measurableOutcome && (
                <div><strong>Measurable Outcome:</strong> {evaluation.coreGoal.measurableOutcome}</div>
              )}
            </div>
          </div>
        </div>

        {/* AI Suggestion */}
        {evaluation.refinedGoalSuggestion.improvedGoalStatement && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">AI Suggestion</h4>
            <p className="text-sm bg-blue-50 p-3 rounded">
              {evaluation.refinedGoalSuggestion.improvedGoalStatement}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {evaluation.refinedGoalSuggestion.rationale}
            </p>
          </div>
        )}

        {/* Areas for Improvement */}
        {evaluation.goalEvaluation.evaluationSummary.weaknesses.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Areas for Improvement</h4>
            <ul className="text-sm space-y-1">
              {evaluation.goalEvaluation.evaluationSummary.weaknesses.map((weakness: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="text-amber-500 mr-2">•</span>
                  {weakness}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Strengths (when extended info is shown) */}
        {showExtendedInfo && evaluation.goalEvaluation.evaluationSummary.strengths.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Strengths</h4>
            <ul className="text-sm space-y-1">
              {evaluation.goalEvaluation.evaluationSummary.strengths.map((strength: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Risk Factors (when extended info is shown) */}
        {showExtendedInfo && evaluation.goalEvaluation.evaluationSummary.riskFactors.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Risk Factors</h4>
            <ul className="text-sm space-y-1">
              {evaluation.goalEvaluation.evaluationSummary.riskFactors.map((risk: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="text-red-500 mr-2">⚠</span>
                  {risk}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Extraction Confidence (when extended info is shown) */}
        {showExtendedInfo && evaluation.extractionConfidence && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">AI Confidence</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Confidence Level:</span>
                <span className={`font-medium ${evaluation.extractionConfidence.overallConfidence === "HIGH" ? "text-green-600" :
                    evaluation.extractionConfidence.overallConfidence === "MEDIUM" ? "text-yellow-600" :
                      "text-red-600"
                  }`}>
                  {evaluation.extractionConfidence.overallConfidence}
                </span>
              </div>
              {evaluation.extractionConfidence.missingInformation.length > 0 && (
                <div>
                  <span className="font-medium">Missing Information:</span>
                  <ul className="ml-4 mt-1">
                    {evaluation.extractionConfidence.missingInformation.map((info, index) => (
                      <li key={index} className="text-xs text-gray-600">• {info}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Coaching Feedback (when extended info is shown) */}
        {showExtendedInfo && evaluation.coachingFeedback && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Coaching Insights</h4>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>Data Quality:</span>
                <span className={`font-medium ${evaluation.coachingFeedback.dataQuality === "EXCELLENT" ? "text-green-600" :
                    evaluation.coachingFeedback.dataQuality === "GOOD" ? "text-blue-600" :
                      evaluation.coachingFeedback.dataQuality === "LIMITED" ? "text-yellow-600" :
                        "text-red-600"
                  }`}>
                  {evaluation.coachingFeedback.dataQuality}
                </span>
              </div>
              {evaluation.coachingFeedback.coachDevelopmentInsight && (
                <div className="bg-gray-50 p-3 rounded">
                  <span className="font-medium">Coach Development Insight:</span>
                  <p className="mt-1">{evaluation.coachingFeedback.coachDevelopmentInsight}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}