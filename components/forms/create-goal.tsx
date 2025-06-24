"use client";

import { AthleteCombobox } from "@/components/ui/athlete-combobox";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SuccessMessage } from "@/components/ui/success-message";
import { Textarea } from "@/components/ui/textarea";
import { logger } from "@/lib/logger";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { useMutation } from "urql";
import { z } from "zod";

const CreateGoalMutation = `
  mutation CreateGoal($input: CreateGoalInput!) {
    createGoal(input: $input) {
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

export function CreateGoalForm({ onSuccess, onCancel, className }: CreateGoalFormProps) {
  const [success, setSuccess] = useState(false);
  const [goalResult, executeGoalMutation] = useMutation(CreateGoalMutation);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      athleteId: "",
    },
  });


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
      className={`flex flex-col gap-4 ${className || ""}`}
    >
      {goalResult.error && (
        <ErrorMessage message={goalResult.error.message} />
      )}
      {success && (
        <SuccessMessage message="Goal created successfully!" />
      )}

      <Textarea
        id="description"
        errors={errors}
        {...register("description")}
        placeholder="Describe the goal in detail (this will be used as the title)"
        className="resize-none h-24"
        required
      />

      <Input id="dueDate" type="date" {...register("dueDate")} errors={errors} />

      <div className="flex gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || goalResult.fetching}
          className="flex-1"
        >
          {goalResult.fetching ? "Creating..." : "Create Goal"}
        </Button>
      </div>
    </form>
  );
}