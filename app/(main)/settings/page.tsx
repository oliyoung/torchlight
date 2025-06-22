"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "urql";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PageWrapper } from "@/components/ui/page-wrapper";

import { Loader2, User, Bell, Shield, Palette } from "lucide-react";

// GraphQL queries and mutations
const GET_COACH_PROFILE = `
  query GetCoachProfile {
    me {
      id
      firstName
      lastName
      displayName
      email
      avatar
      timezone
      role
    }
  }
`;

const UPDATE_COACH_MUTATION = `
  mutation UpdateCoach($input: UpdateCoachInput!) {
    updateCoach(input: $input) {
      id
      firstName
      lastName
      displayName
      email
      avatar
      timezone
      role
    }
  }
`;

const CREATE_COACH_MUTATION = `
  mutation CreateCoach($input: CreateCoachInput!) {
    createCoach(input: $input) {
      id
      firstName
      lastName
      displayName
      email
      avatar
      timezone
    }
  }
`;

// Form validation schema
const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  displayName: z.string().optional(),
  timezone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

function ProfileSection() {
  const [isEditing, setIsEditing] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [{ data, fetching, error }] = useQuery({
    query: GET_COACH_PROFILE,
  });

  // Debug logging
  React.useEffect(() => {
    console.log('Profile query state:', { data, fetching, error });
  }, [data, fetching, error]);

  const [, updateCoach] = useMutation(UPDATE_COACH_MUTATION);
  const [, createCoach] = useMutation(CREATE_COACH_MUTATION);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  // Reset form when data loads or set to editing mode if creating
  React.useEffect(() => {
    if (data?.me) {
      reset({
        firstName: data.me.firstName || "",
        lastName: data.me.lastName || "",
        displayName: data.me.displayName || "",
        timezone: data.me.timezone || "",
      });
    } else if (!fetching && !error) {
      // If no profile exists, start in editing mode
      setIsEditing(true);
    }
  }, [data, reset, fetching, error]);

  const onSubmit = async (formData: ProfileFormData) => {
    try {
      // If no profile exists, create one; otherwise update
      const isCreating = !data?.me;

      let result;
      if (isCreating) {
        result = await createCoach({ input: formData });
      } else {
        result = await updateCoach({ input: formData });
      }

      if (result.error) {
        console.error('Mutation error:', result.error);
        setMessage({
          type: 'error',
          text: `Failed to ${isCreating ? 'create' : 'update'} profile. Please try again.`
        });
        return;
      }

      setMessage({
        type: 'success',
        text: `Profile ${isCreating ? 'created' : 'updated'} successfully.`
      });

      // Refresh the query to get the new data
      if (isCreating) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Submit error:', error);
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred.'
      });
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
    setMessage(null);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setMessage(null);
  };

  if (fetching) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2 text-sm text-muted-foreground">
              Loading profile...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-red-600 mb-2">Error loading profile</div>
            <div className="text-sm text-muted-foreground">{error.message}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle case where no profile exists - allow creation
  const isCreatingProfile = !data?.me;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Profile Details
        </CardTitle>
        <CardDescription>
          {isCreatingProfile
            ? "Complete your profile setup to get started."
            : "Manage your personal information and account settings."
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                {...register("firstName")}
              />
              {errors.firstName && (
                <p className="text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                {...register("lastName")}
              />
              {errors.lastName && (
                <p className="text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              {...register("displayName")}
              placeholder="How you'd like to be addressed"
            />
          </div>

          <div className="space-y-2">
            <Label>Email Address</Label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600">
              {data?.me?.email || 'Not available'}
            </div>
            <p className="text-xs text-gray-500">Email cannot be changed here. Contact support if you need to update your email address.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              {...register("timezone")}
              placeholder="e.g., America/New_York"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isCreatingProfile ? 'Create Profile' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function NotificationSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notifications
        </CardTitle>
        <CardDescription>
          Configure how you receive notifications and updates.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          Notification settings coming soon...
        </div>
      </CardContent>
    </Card>
  );
}

function SecuritySection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Security & Privacy
        </CardTitle>
        <CardDescription>
          Manage your account security and privacy preferences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          Security settings coming soon...
        </div>
      </CardContent>
    </Card>
  );
}

function AppearanceSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Appearance
        </CardTitle>
        <CardDescription>
          Customize the look and feel of your dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          Theme and appearance settings coming soon...
        </div>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <PageWrapper
      title="Settings"
      description="Manage your account settings and preferences"
      breadcrumbs={[
        { label: "Settings", href: "/settings" },
      ]}
    >
      <div className="space-y-6">
        <ProfileSection />

        <Separator />

        <NotificationSection />

        <Separator />

        <SecuritySection />

        <Separator />

        <AppearanceSection />
      </div>
    </PageWrapper>
  );
}