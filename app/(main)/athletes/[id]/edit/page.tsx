"use client";

import { useMutation, useQuery } from "urql";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SportSelect } from "@/components/ui/sport-select";
import { ErrorMessage } from "@/components/ui/error-message";
import { SuccessMessage } from "@/components/ui/success-message";

const updateAthleteSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  sport: z.string().min(1, "Sport is required"),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

type UpdateAthleteFormData = z.infer<typeof updateAthleteSchema>;

const GetAthleteQuery = `
  query GetAthlete($id: ID!) {
    athlete(id: $id) {
      id
      firstName
      lastName
      email
      sport
      tags
      notes
    }
  }
`;

const UpdateAthleteMutation = `
  mutation UpdateAthlete($id: ID!, $input: UpdateAthleteInput!) {
    updateAthlete(id: $id, input: $input) {
      id
      firstName
      lastName
      email
      sport
      tags
      notes
    }
  }
`;

const EditAthleteForm: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const athleteId = params.id as string;

  const [{ data: athleteData, fetching: fetchingAthlete, error: fetchError }] = useQuery({
    query: GetAthleteQuery,
    variables: { id: athleteId },
  });

  const [, updateAthlete] = useMutation(UpdateAthleteMutation);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(updateAthleteSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      sport: "",
      tags: [] as string[],
      notes: "",
    },
  });

  const {
    register,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = form;

  // Reset form when athlete data loads
  useEffect(() => {
    if (athleteData?.athlete) {
      reset({
        firstName: athleteData.athlete.firstName || "",
        lastName: athleteData.athlete.lastName || "",
        email: athleteData.athlete.email || "",
        sport: athleteData.athlete.sport || "",
        tags: athleteData.athlete.tags || [],
        notes: athleteData.athlete.notes || "",
      });
    }
  }, [athleteData, reset]);

  const onSubmit = async (data: UpdateAthleteFormData) => {
    setError(null);
    setSuccess(null);

    try {
      const result = await updateAthlete({
        id: athleteId,
        input: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          sport: data.sport,
          tags: data.tags,
          notes: data.notes || null,
        },
      });

      if (result.error) {
        setError(result.error.message);
        return;
      }

      setSuccess("Athlete updated successfully!");
      setTimeout(() => {
        router.push(`/athletes/${athleteId}`);
      }, 1500);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    }
  };

  if (fetchingAthlete) {
    return (
      <PageWrapper
        title="Edit Athlete"
        breadcrumbs={[
          { label: "Athletes", href: "/athletes" },
          { label: "Loading...", href: "#" },
          { label: "Edit", href: "#" },
        ]}
      >
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading athlete...</div>
        </div>
      </PageWrapper>
    );
  }

  if (fetchError || !athleteData?.athlete) {
    return (
      <PageWrapper
        title="Edit Athlete"
        breadcrumbs={[
          { label: "Athletes", href: "/athletes" },
          { label: "Error", href: "#" },
        ]}
      >
        <div className="flex items-center justify-center py-8">
          <div className="text-destructive">
            {fetchError?.message || "Athlete not found"}
          </div>
        </div>
      </PageWrapper>
    );
  }

  const athlete = athleteData.athlete;

  return (
    <PageWrapper
      title="Edit Athlete"
      breadcrumbs={[
        { label: "Athletes", href: "/athletes" },
        { label: `${athlete.firstName} ${athlete.lastName}`, href: `/athletes/${athleteId}` },
        { label: "Edit", href: "#" },
      ]}
    >
      <div className="max-w-2xl mx-auto">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {success && <SuccessMessage message={success} />}
          {error && <ErrorMessage message={error} />}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                {...register("firstName")}
                placeholder="Enter first name"
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                {...register("lastName")}
                placeholder="Enter last name"
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sport">Sport</Label>
            <Controller
              name="sport"
              control={control}
              render={({ field }) => (
                <SportSelect
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.sport && (
              <p className="text-sm text-destructive">{errors.sport.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <Input
                  id="tags"
                  placeholder="Enter tags separated by commas"
                  value={Array.isArray(field.value) ? field.value.join(", ") : ""}
                  onChange={(e) => {
                    const tags = e.target.value.split(",").map(tag => tag.trim()).filter(Boolean);
                    field.onChange(tags);
                  }}
                />
              )}
            />
            <p className="text-sm text-muted-foreground">
              Separate multiple tags with commas
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Add any additional notes about the athlete"
              rows={4}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Athlete"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/athletes/${athleteId}`)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </PageWrapper>
  );
};

export default function Page() {
  return <EditAthleteForm />;
}