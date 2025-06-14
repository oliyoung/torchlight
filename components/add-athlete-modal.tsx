"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ErrorMessage } from "@/components/ui/error-message";
import { Input } from "@/components/ui/input";
import { SportSelect } from "@/components/ui/sport-select";
import { SuccessMessage } from "@/components/ui/success-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useMutation } from "urql";
import { z } from "zod";
import { useRouter } from "next/navigation";

const CreateAthleteMutation = `
  mutation CreateAthlete($input: CreateAthleteInput!) {
    createAthlete(input: $input) { id }
  }
`;

const athleteSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  sport: z.string().min(1, "Sport is required"),
  tags: z.string().optional(),
  notes: z.string().optional(),
  birthday: z.string().optional(),
});

type FormValues = z.infer<typeof athleteSchema>;

interface AddAthleteModalProps {
  onSuccess?: () => void;
  triggerButton?: React.ReactNode;
}

export function AddAthleteModal({ onSuccess, triggerButton }: AddAthleteModalProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(athleteSchema),
  });
  const [success, setSuccess] = useState(false);
  const [result, executeMutation] = useMutation(CreateAthleteMutation);

  const onSubmit = async (values: FormValues) => {
    setSuccess(false);
    const tagsArray = values.tags
      ? values.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
      : [];
    const { data, error } = await executeMutation({
      input: {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        sport: values.sport,
        tags: tagsArray,
        notes: values.notes ?? "",
        birthday: values.birthday ?? "",
      },
    });
    if (!error && data?.createAthlete?.id) {
      setSuccess(true);
      reset();

      // Close modal after a short delay to show success message
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }

        // Refresh the page to show the new athlete
        router.refresh();
      }, 1500);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset form when closing
      reset();
      setSuccess(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button>
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Athlete
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Athlete</DialogTitle>
          <DialogDescription>
            Add a new athlete to your database. Fill in their details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {result.error && <ErrorMessage message={result.error.message} />}
          {success && <SuccessMessage message="Athlete created successfully!" />}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                First Name
              </label>
              <Input
                id="firstName"
                {...register("firstName")}
                autoComplete="given-name"
                className="mt-1"
              />
              {errors.firstName && (
                <span className="text-xs text-destructive">
                  {errors.firstName.message}
                </span>
              )}
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Last Name
              </label>
              <Input
                id="lastName"
                {...register("lastName")}
                autoComplete="family-name"
                className="mt-1"
              />
              {errors.lastName && (
                <span className="text-xs text-destructive">
                  {errors.lastName.message}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Controller
                name="sport"
                control={control}
                render={({ field }) => (
                  <SportSelect
                    label="Primary Sport"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.sport?.message}
                  />
                )}
              />
            </div>

            <div>
              <label
                htmlFor="birthday"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Birthday
              </label>
              <Input
                id="birthday"
                type="date"
                {...register("birthday")}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={result.fetching}
            >
              Cancel
            </Button>
            <Button type="submit" variant='default' disabled={result.fetching}>
              {result.fetching ? "Creating..." : "Create Athlete"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}