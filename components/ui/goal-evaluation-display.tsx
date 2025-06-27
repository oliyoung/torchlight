import { Card } from "@/components/ui/card";
import { GoalEvaluationResponse } from "@/lib/types";

interface GoalEvaluationDisplayProps {
  evaluation: GoalEvaluationResponse | null
  className?: string;
  showExtendedInfo?: boolean;
}

export function GoalEvaluationDisplay({
  evaluation,
  className = "",
  showExtendedInfo = false
}: GoalEvaluationDisplayProps) {
  if (!evaluation) {
    return null;
  }

  return (
    <Card className={`flex flex-col gap-4 p-4 ${className}`}>

      <p className="text-xl font-bold">
        {evaluation?.refinedGoalSuggestion?.improvedGoalStatement}
      </p>

      {evaluation?.refinedGoalSuggestion && <div>
        <h3 className="text-xl font-bold">Key Changes</h3>
        <ul className="list-disc list-inside text-sm space-y-1">
          {evaluation?.refinedGoalSuggestion?.keyChanges.map((change, index) => (
            <li key={index}>{change}</li>
          ))}
        </ul>
      </div>}

      {evaluation?.refinedGoalSuggestion?.rationale && <div>
        <h3 className="text-xl font-bold">Rationale</h3>
        <p>
          {evaluation?.refinedGoalSuggestion?.rationale}
        </p>
      </div>}

      {showExtendedInfo && evaluation?.goalEvaluation && (
        <div>
          <div className="grid grid-cols-6 gap-4">
            <div className=" bg-slate-100 border border-slate-300 p-3 flex flex-col">
              <span>Score</span>
              <span className="font-bold">
                {evaluation?.goalEvaluation?.overallQualityScore}/10
              </span>
            </div>

            <div className="bg-slate-100 border border-slate-300 p-3 rounded flex flex-col">
              <h4 className="font-medium">Specificity</h4>
              <span className="font-bold">
                {evaluation?.goalEvaluation?.specificScore}/10
              </span>
            </div>

            <div className="bg-slate-100 border border-slate-300 p-3 rounded flex flex-col">
              <h4 className="font-medium">Measurability</h4>
              <span className="font-bold">
                {evaluation?.goalEvaluation?.measurableScore}/10
              </span>
            </div>

            <div className="bg-slate-100 border border-slate-300 p-3 rounded flex flex-col">
              <h4 className="font-medium">Achievability</h4>
              <span className="font-bold">
                {evaluation?.goalEvaluation?.achievableScore}/10
              </span>
            </div>

            <div className="bg-slate-100 border border-slate-300 p-3 rounded flex flex-col">
              <h4 className="font-medium">Relevance</h4>
              <span className="font-bold">
                {evaluation?.goalEvaluation?.relevantScore}/10
              </span>
            </div>
            <div className="bg-slate-100 border border-slate-300 p-3 rounded flex flex-col">
              <h4 className="font-medium">Time Bound</h4>
              <span className="font-bold">
                {evaluation?.goalEvaluation?.timeBoundScore}/10
              </span>
            </div>
          </div></div>)}

      {evaluation?.goalEvaluation?.evaluationSummary && <div className="grid grid-cols-3 grid-rows-1 gap-4">
        <div>
          <h4 className="font-medium">Strengths</h4>
          <ul className="text-sm space-y-1">
            {evaluation?.goalEvaluation?.evaluationSummary.strengths.map((strength: string, index: number) => (
              <li key={index} className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                {strength}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-medium">Weaknesses</h4>
          <ul className="text-sm space-y-1">
            {evaluation?.goalEvaluation?.evaluationSummary.weaknesses.map((weakness: string, index: number) => (
              <li key={index} className="flex items-start">
                <span className="text-amber-500 mr-2">•</span>
                {weakness}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-medium">Risk Factors</h4>
          <ul className="text-sm space-y-1">
            {evaluation?.goalEvaluation?.evaluationSummary.riskFactors.map((risk: string, index: number) => (
              <li key={index} className="flex items-start">
                <span className="text-red-500 mr-2">⚠</span>
                {risk}
              </li>
            ))}
          </ul>
        </div>
      </div>}
    </Card>
  );
}