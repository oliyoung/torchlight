"use client";

import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";
import { SuccessMessage } from "@/components/ui/success-message";
import { Textarea } from "@/components/ui/textarea";
import { logger } from "@/lib/logger";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useMutation } from "urql";
import { z } from "zod";
import { GoalEvaluationDisplay } from "../ui/goal-evaluation-display";
import { GoalEvaluationResponse, GoalCategory } from "@/lib/types";

const CreateGoalMutation = `
  mutation CreateGoal($input: CreateGoalInput!) {
    createGoal(input: $input) {
      id
      title
    }
  }
`;

const EvaluateGoalMutation = `
  mutation ExtractAndEvaluateGoal($input: AIExtractAndEvaluateGoalInput!) {
    extractAndEvaluateGoal(input: $input) {
      coreGoal {
        primaryObjective
        type
        sport
        measurableOutcome
      }
      goalEvaluation {
        overallQualityScore
        specificScore
        measurableScore
        achievableScore
        relevantScore
        timeBoundScore
        evaluationSummary {
          strengths
          weaknesses
          riskFactors
          improvementPriorities
        }
      }
      refinedGoalSuggestion {
        improvedGoalStatement
        keyChanges
        rationale
      }
      timeline {
        duration
        targetDate
        urgencyLevel
        milestones
      }
      motivation {
        whyItMatters
        emotionalContext
        externalDrivers
        supportSystem
      }
      availability {
        trainingTime
        location
        equipment
        scheduleConstraints
        budget
      }
      constraints {
        experienceLevel
        physicalLimitations
        previousChallenges
        riskFactors
      }
      successIndicators {
        successDefinition
        measurementMethods
        secondaryBenefits
      }
      extractionConfidence {
        overallConfidence
        assumptions
        missingInformation
        suggestedQuestions
      }
      coachingFeedback {
        coachDevelopmentInsight
        dataQuality
        improvementSuggestions
        keyGapsIdentified
        riskFlags
      }
    }
  }
`;

const goalSchema = z.object({
  athleteId: z.string().min(1, "Athlete is required"),
  description: z.string().min(1, "Description is required"),
  dueDate: z.string().optional(),
});


type FormValues = z.infer<typeof goalSchema>;

interface CreateGoalFormProps {
  athleteId: string;
  onSuccess?: (goalId: string) => void;
  onCancel?: () => void;
  onEvaluate?: (goal: string) => void;
}

export function CreateGoalForm({ athleteId, onSuccess, onCancel, onEvaluate }: CreateGoalFormProps) {
  const [success, setSuccess] = useState(false);
  const [evaluation, setEvaluation] = useState<GoalEvaluationResponse | null>(null);
  const [currentStep, setCurrentStep] = useState<'input' | 'evaluation' | 'create'>('input');
  const [goalResult, executeGoalMutation] = useMutation(CreateGoalMutation);
  const [goalEvaluation, executeGoalEvaluation] = useMutation(EvaluateGoalMutation);

  const {
    getValues,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      athleteId: athleteId || "",
    },
  });

  const currentDescription = getValues("description");

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    logger.info({ values, currentStep }, "Form submitted");

    if (currentStep === 'input') {
      await onEvaluateGoal(values);
    } else if (currentStep === 'evaluation') {
      await onCreateGoal(values);
    }
  };

  const onEvaluateGoal = async (values: FormValues) => {
    try {
      logger.info({ values }, "Starting goal evaluation");
      if (onEvaluate) {
        onEvaluate(values.description);
      }
      const { data, error: evalError } = await executeGoalEvaluation({
        input: {
          athleteId: values.athleteId,
          goalText: values.description,
        },
      });

      if (evalError) {
        logger.error({ evalError }, "GraphQL error during evaluation");
        throw new Error(evalError.message);
      }

      if (data?.extractAndEvaluateGoal) {
        logger.info({ evaluation: data.extractAndEvaluateGoal }, "Goal evaluation completed");
        setEvaluation(data.extractAndEvaluateGoal);
        setCurrentStep('evaluation');
      } else {
        logger.warn({ data }, "No evaluation data returned");
      }
    } catch (error) {
      logger.error({ error }, "Error evaluating goal");
    }
  };

  const onCreateGoal = async (values: FormValues) => {
    setSuccess(false);
    setCurrentStep('create');

    try {
      // Use the improved goal statement from evaluation if available
      const goalTitle = evaluation?.refinedGoalSuggestion?.improvedGoalStatement || values.description;
      const goalDescription = values.description;

      // Map AI evaluation type to valid GoalCategory enum
      const mapAiTypeToCategory = (aiType: string | undefined): GoalCategory => {
        if (!aiType) return GoalCategory.Skill;

        const normalizedType = aiType.toLowerCase();

        // Map AI types to GraphQL enum values
        if (normalizedType.includes("strength") || normalizedType.includes("power")) {
          return GoalCategory.Strength;
        }
        if (normalizedType.includes("endurance") || normalizedType.includes("cardio") || normalizedType.includes("cardiovascular")) {
          return GoalCategory.Endurance;
        }
        if (normalizedType.includes("skill") || normalizedType.includes("technical")) {
          return GoalCategory.Skill;
        }
        if (normalizedType.includes("mental") || normalizedType.includes("psychology") || normalizedType.includes("mindset")) {
          return GoalCategory.Mental;
        }
        if (normalizedType.includes("flexibility") || normalizedType.includes("mobility")) {
          return GoalCategory.Flexibility;
        }
        if (normalizedType.includes("speed") || normalizedType.includes("agility")) {
          return GoalCategory.Speed;
        }
        if (normalizedType.includes("technique") || normalizedType.includes("form")) {
          return GoalCategory.Technique;
        }
        if (normalizedType.includes("nutrition") || normalizedType.includes("diet")) {
          return GoalCategory.Nutrition;
        }
        if (normalizedType.includes("recovery") || normalizedType.includes("rest") || normalizedType.includes("injury")) {
          return GoalCategory.Recovery;
        }

        // Default fallback
        return GoalCategory.Skill;
      };

      const category = mapAiTypeToCategory(evaluation?.coreGoal?.type);

      logger.info({
        aiType: evaluation?.coreGoal?.type,
        mappedCategory: category,
        evaluation: evaluation?.coreGoal
      }, "Mapping AI type to goal category");

      // Determine priority from evaluation or use default
      const priority = evaluation?.goalEvaluation?.overallQualityScore && evaluation.goalEvaluation.overallQualityScore >= 8 ? "HIGH" : "MEDIUM";

      const { data, error: goalError } = await executeGoalMutation({
        input: {
          athleteId: values.athleteId,
          title: goalTitle.slice(0, 100),
          description: goalDescription,
          category: category,
          priority: priority,
          dueDate: values.dueDate ? new Date(values.dueDate) : undefined,
        },
      });

      if (goalError) {
        throw new Error(goalError.message);
      }

      // Store the evaluation data in the goal's evaluationResponse field
      if (data?.createGoal?.id && evaluation) {
        // Update the goal with evaluation data
        // This could be done with an updateGoal mutation to store the evaluation
      }

      setSuccess(true);

      // Call success callback if provided
      if (onSuccess && data?.createGoal?.id) {
        setTimeout(() => {
          onSuccess(data.createGoal.id);
        }, 1500);
      }
    } catch (error) {
      logger.error({ error }, "Error creating goal");
    }
  };


  const goBackToInput = () => {
    setCurrentStep('input');
    setEvaluation(null);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      {(goalResult.error || goalEvaluation.error) && (
        <ErrorMessage message={goalResult.error?.message || goalEvaluation.error?.message || "An error occurred"} />
      )}
      {success && (
        <SuccessMessage message="Goal created successfully!" />
      )}
      {currentStep === 'input' && (
        <>
          {/* Hidden athleteId field if provided as prop, otherwise show error */}
          {athleteId ? (
            <input type="hidden" {...register("athleteId")} value={athleteId} />
          ) : (
            <div className="text-red-500 text-sm">
              Athlete ID is required but not provided
            </div>
          )}
          <Textarea
            id="description"
            label="What goal would you like to achieve?"
            errors={errors}
            {...register("description")}
            placeholder="Describe the goal in detail (this will be used as the title)"
            className="resize-none h-24 text-xl"
            required
          />
          {/* Show validation errors */}
          {errors.athleteId && (
            <div className="text-red-500 text-sm">{errors.athleteId.message}</div>
          )}
          {errors.description && (
            <div className="text-red-500 text-sm">{errors.description.message}</div>
          )}
          <div className="flex flex-row gap-2 justify-between">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting || goalEvaluation.fetching || !athleteId}
            >
              {goalEvaluation.fetching ? "Evaluating..." : "Evaluate Goal"}
            </Button>
          </div>
        </>
      )}

      {currentStep === 'evaluation' && evaluation && (
        <>
          <GoalEvaluationDisplay goal={currentDescription} evaluation={evaluation} />
          <div className="flex flex-row gap-2 justify-between">
            <Button type="button" variant="outline" onClick={goBackToInput}>
              Back to Edit
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || goalResult.fetching}
            >
              {goalResult.fetching ? "Creating..." : "Create Goal"}
            </Button>
          </div>
        </>
      )}

      {currentStep === 'create' && (
        <div className="text-center py-4">
          <p>Creating your goal...</p>
        </div>
      )}
    </form>
  );
}