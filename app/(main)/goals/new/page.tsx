"use client";

import { AthleteCombobox } from "@/components/ui/athlete-combobox";
import { AssistantMultiSelect } from "@/components/ui/assistant-multi-select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { ErrorMessage } from "@/components/ui/error-message";
import { GoalTitleSelect } from "@/components/ui/goal-title-select";
import { Label } from "@/components/ui/label";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { SuccessMessage } from "@/components/ui/success-message";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { useMutation, useQuery } from "urql";
import { z } from "zod";
import { logger } from '@/lib/logger';

const AthleteQuery = `
  query Athlete($id: ID!) {
    athlete(id: $id) {
      id
      firstName
      lastName
      sport
    }
  }
`;

const CreateGoalMutation = `
  mutation CreateGoal($input: CreateGoalInput!) {
    createGoal(input: $input) {
      id
      title
      sport
      trainingPlans {
        id
      }
    }
  }
`;

const CreateTrainingPlanMutation = `
  mutation CreateTrainingPlan($input: CreateTrainingPlanInput!) {
    createTrainingPlan(input: $input) {
      id
    }
  }
`;

const goalSchema = z.object({
  athleteId: z.string().min(1, "Athlete is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  assistantIds: z.array(z.string()).optional(),
  createTrainingPlan: z.boolean(),
});

type FormValues = z.infer<typeof goalSchema>;

export default function NewGoalPage() {
  const router = useRouter();

  const [success, setSuccess] = useState(false);
  const [goalResult, executeGoalMutation] = useMutation(CreateGoalMutation);
  const [trainingPlanResult, executeTrainingPlanMutation] = useMutation(
    CreateTrainingPlanMutation,
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      athleteId: "",
      createTrainingPlan: true,
    },
  });

  const selectedAthleteId = watch("athleteId");
  const createTrainingPlan = watch("createTrainingPlan");

  // Query for selected athlete's details
  const [{ data: athleteData }] = useQuery({
    query: AthleteQuery,
    variables: { id: selectedAthleteId },
    pause: !selectedAthleteId,
  });

  const athleteSport = athleteData?.athlete?.sport || "";

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    setSuccess(false);

    try {
      // First create the goal
      const { data: goalData, error: goalError } = await executeGoalMutation({
        input: {
          athleteId: values.athleteId,
          title: values.title,
          description: values.description || "",
          sport: athleteSport, // Use the athlete's sport
          dueDate: values.dueDate,
        },
      });

      if (goalError) {
        throw new Error(goalError.message);
      }

      const goalId = goalData?.createGoal?.id;

      // If createTrainingPlan is true and we have a goal ID, create the training plan
      if (createTrainingPlan && goalId && values.assistantIds?.length) {
        const { data: trainingPlanData, error: trainingPlanError } =
          await executeTrainingPlanMutation({
            input: {
              athleteId: values.athleteId,
              goalIds: [goalId], // Link the newly created goal to this training plan
              assistantIds: values.assistantIds,
            },
          });

        if (trainingPlanError) {
          throw new Error(trainingPlanError.message);
        }
      }

      setSuccess(true);

      // Navigate back to goals page after a short delay
      setTimeout(() => {
        router.push("/goals");
      }, 1500);
    } catch (error) {
      logger.error({ error }, "Error creating goal");
    }
  };

  return (
    <PageWrapper
      title="Create New Goal"
      description="Create a goal for any athlete"
      breadcrumbs={[
        { label: "Goals", href: "/goals" },
        { label: "New Goal", href: "#" },
      ]}
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Goal</CardTitle>
          <CardDescription>
            Define a goal for an athlete and optionally create a supporting training plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="new-goal-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {goalResult.error && (
              <ErrorMessage message={goalResult.error.message} />
            )}
            {trainingPlanResult.error && (
              <ErrorMessage message={trainingPlanResult.error.message} />
            )}
            {success && (
              <SuccessMessage message="Goal created successfully! Redirecting..." />
            )}

            <div className="space-y-2">
              <Controller
                name="athleteId"
                control={control}
                render={({ field }) => (
                  <AthleteCombobox
                    label="Athlete"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.athleteId?.message}
                  />
                )}
              />
            </div>

            {selectedAthleteId && (
              <div className="space-y-2">
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <GoalTitleSelect
                      label="Goal Title"
                      value={field.value}
                      onChange={field.onChange}
                      sport={athleteSport}
                      error={errors.title?.message}
                      disabled={!athleteSport}
                    />
                  )}
                />
              </div>
            )}

            {athleteSport && createTrainingPlan && selectedAthleteId && (
              <div className="space-y-2">
                <Controller
                  name="assistantIds"
                  control={control}
                  render={({ field }) => (
                    <AssistantMultiSelect
                      label="Select Sport-Specific Assistants"
                      sport={athleteSport}
                      strength={watch("title")}
                      selectedAssistantIds={field.value || []}
                      onChange={field.onChange}
                      placeholder="Select assistants for this goal's training plan"
                    />
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  Select at least one assistant specialized in this goal
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Describe the goal in detail"
                className="resize-none h-24"
              />
            </div>

            <div className="space-y-2">
              <Controller
                name="dueDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Target Date"
                    date={field.value}
                    setDate={field.onChange}
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="createTrainingPlan"
                  {...register("createTrainingPlan")}
                  className="h-4 w-4 border-gray-300"
                />
                <Label htmlFor="createTrainingPlan">
                  Create Supporting Training Plan
                </Label>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                A training plan helps achieve the goal through structured
                activities and exercises
              </p>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            form="new-goal-form"
            disabled={
              isSubmitting ||
              goalResult.fetching ||
              trainingPlanResult.fetching ||
              !selectedAthleteId ||
              !athleteSport
            }
            className="w-full"
          >
            {goalResult.fetching || trainingPlanResult.fetching
              ? "Creating..."
              : createTrainingPlan
                ? "Create Goal & Training Plan"
                : "Create Goal"}
          </Button>
        </CardFooter>
      </Card>
    </PageWrapper>
  );
}