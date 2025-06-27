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
import { GoalEvaluationResponse } from "@/lib/types";

const CreateGoalMutation = `
  mutation CreateGoal($input: CreateGoalInput!) {
    createGoal(input: $input) {
      id
      title
    }
  }
`;

const EvaluateGoalMutation = `
  mutation ExtractAndEvaluateGoal($input: CreateGoalInput!) {
    extractAndEvaluateGoal(input: $input) {
      id
      title
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
  onSuccess?: (goalId: string) => void;
  onCancel?: () => void;
  className?: string;
}

export function CreateGoalForm({ onSuccess, onCancel }: CreateGoalFormProps) {
  const [success, setSuccess] = useState(false);
  const [evaluation, setEvaluation] = useState<GoalEvaluationResponse | null>(null);
  const [goalResult, executeGoalMutation] = useMutation(CreateGoalMutation);
  const [goalEvaluation, executeGoalEvaluation] = useMutation(EvaluateGoalMutation)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      athleteId: "",
    },
  });

  const onEvaluateGoal = async (values: FormValues) => {
    try {
      const { data, error: goalError } = await executeGoalEvaluation({
        input: {
          athleteId: values.athleteId,
          title: values.description.slice(0, 100),
          description: values.description || "",
          category: "SKILL", // Default category since it's required
          priority: "MEDIUM", // Default priority since it's required
          dueDate: values.dueDate ? new Date(values.dueDate) : undefined,
        },
      });

      if (goalError) {
        throw new Error(goalError.message);
      }
      if (data.createGoal?.id) {
        setEvaluation(data.extractAndEvaluateGoal);
      }
    } catch (error) {
      logger.error({ error }, "Error creating goal");
    }
  }

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    setSuccess(false);

    try {
      const { data, error: goalError } = await executeGoalMutation({
        input: {
          athleteId: values.athleteId,
          title: values.description.slice(0, 100),
          description: values.description || "",
          category: "SKILL", // Default category since it's required
          priority: "MEDIUM", // Default priority since it's required
          dueDate: values.dueDate ? new Date(values.dueDate) : undefined,
        },
      });

      if (goalError) {
        throw new Error(goalError.message);
      }

      setSuccess(true);

      // Reset form state
      reset();

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

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      {goalResult.error && (
        <ErrorMessage message={goalResult.error.message} />
      )}
      {success && (
        <SuccessMessage message="Goal created successfully!" />
      )}
      <Textarea
        id="description"
        label="What goal would you like to achieve?"
        errors={errors}
        {...register("description")}
        placeholder="Describe the goal in detail (this will be used as the title)"
        className="resize-none h-24"
        required
      />
      <GoalEvaluationDisplay evaluation={evaluation} />
      <div className="flex flex-row gap-2 justify-between">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        )}
        {!evaluation && (<Button onClick={() => onEvaluateGoal({ athleteId: "", description: "", dueDate: "" })} disabled={isSubmitting || goalEvaluation.fetching}>Evaluate Goal</Button>)}
        {onSuccess && evaluation && (<Button type="submit" disabled={isSubmitting || goalResult.fetching} > {goalResult.fetching ? "Creating..." : "Create Goal"} </Button>)}
      </div>
    </form>
  );
}