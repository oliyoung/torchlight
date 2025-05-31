"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { generateFollowUpQuestions, combineExpandedFeedback, needsExpansion, type FollowUpQuestions } from "@/ai/features/expandYouthFeedback";

interface YouthFeedbackExpanderProps {
  initialFeedback: string;
  athleteAge: number;
  sessionGoals?: string[];
  coachNotes?: string;
  onExpandedFeedback: (expandedTranscript: string) => void;
  onCancel: () => void;
}

export function YouthFeedbackExpander({
  initialFeedback,
  athleteAge,
  sessionGoals = [],
  coachNotes,
  onExpandedFeedback,
  onCancel
}: YouthFeedbackExpanderProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [followUpQuestions, setFollowUpQuestions] = useState<FollowUpQuestions | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const shouldExpand = needsExpansion(initialFeedback, athleteAge);

  const handleGenerateQuestions = async () => {
    setIsGenerating(true);
    try {
      const questions = await generateFollowUpQuestions(
        initialFeedback,
        athleteAge,
        sessionGoals,
        coachNotes
      );
      setFollowUpQuestions(questions);
    } catch (error) {
      console.error("Failed to generate follow-up questions:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResponseChange = (questionIndex: number, response: string) => {
    setResponses(prev => ({
      ...prev,
      [questionIndex.toString()]: response
    }));
  };

  const handleComplete = () => {
    if (!followUpQuestions) return;
    
    const expandedTranscript = combineExpandedFeedback(
      initialFeedback,
      responses,
      followUpQuestions.questions
    );
    
    onExpandedFeedback(expandedTranscript);
  };

  const hasAnyResponses = Object.values(responses).some(response => response.trim().length > 0);

  if (!shouldExpand) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-green-800">
            <span className="text-xl">✅</span>
            <div>
              <p className="font-medium">Great feedback!</p>
              <p className="text-sm">This response has good detail for the athlete's age.</p>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={onCancel}>
              Use as is
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            🤔 Help Expand Feedback
            <Badge variant="outline">Age {athleteAge}</Badge>
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Original Feedback */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-900 mb-2">Original Response:</h3>
          <p className="text-blue-800 italic">"{initialFeedback}"</p>
        </div>

        {!followUpQuestions ? (
          /* Generate Questions Step */
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                This response could use more detail. Let's help the athlete share more about their experience 
                with some friendly follow-up questions designed for their age level.
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleGenerateQuestions}
                disabled={isGenerating}
                className="flex-1"
              >
                {isGenerating ? "Generating questions..." : "Generate Follow-up Questions"}
              </Button>
              <Button variant="outline" onClick={onCancel}>
                Use Original
              </Button>
            </div>
          </div>
        ) : (
          /* Questions and Responses Step */
          <div className="space-y-6">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="font-medium text-yellow-900 mb-2">Encouragement:</h3>
              <p className="text-yellow-800">{followUpQuestions.encouragement}</p>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Follow-up Questions</h3>
              <p className="text-sm text-muted-foreground">{followUpQuestions.context}</p>
              
              {followUpQuestions.questions.map((question, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Badge variant="secondary" className="mt-1">
                          {question.category}
                        </Badge>
                        <div className="flex-1">
                          <p className="font-medium">{question.question}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {question.reasoning}
                          </p>
                        </div>
                      </div>
                      
                      <Textarea
                        placeholder={`Help the athlete answer: ${question.question}`}
                        value={responses[index.toString()] || ""}
                        onChange={(e) => handleResponseChange(index, e.target.value)}
                        rows={3}
                        className="mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button 
                onClick={handleComplete}
                disabled={!hasAnyResponses}
              >
                Combine Responses
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}