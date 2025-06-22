"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation } from "urql"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ErrorMessage } from "@/components/ui/error-message"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, User, Trophy, ArrowRight } from "lucide-react"
import type { CoachRole } from "@/lib/types"
import { useAuth } from "@/lib/auth/context"
import { useCoachProfile } from "@/lib/hooks/use-coach-profile"
import { COACH_ROLE_CONFIG } from "@/lib/utils/coach-role-limits"

const CREATE_COACH_MUTATION = `
  mutation CreateCoach($input: CreateCoachInput!) {
    createCoach(input: $input) {
      id
      email
      firstName
      lastName
      displayName
      timezone
      role
      onboardingCompleted
    }
  }
`

const onboardingSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name must be less than 50 characters"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name must be less than 50 characters"),
  displayName: z.string().max(50, "Display name must be less than 50 characters").optional(),
  timezone: z.string().min(1, "Timezone is required"),
  role: z.enum(["PROFESSIONAL", "PERSONAL", "SELF"] as const, {
    required_error: "Please select a coaching mode"
  })
})

type OnboardingFormData = z.infer<typeof onboardingSchema>

const COACH_ROLE_OPTIONS: Array<{
  role: CoachRole;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  description: string;
  maxAthletes: string;
  features: string[];
}> = [
    {
      role: 'PROFESSIONAL' as CoachRole,
      icon: Trophy,
      title: 'Professional Coach',
      subtitle: 'For coaching businesses',
      description: 'Manage unlimited athletes with full coaching features',
      maxAthletes: 'Unlimited',
      features: ['Unlimited athletes', 'Advanced analytics', 'Team management', 'Full feature access']
    },
    {
      role: 'PERSONAL' as CoachRole,
      icon: Users,
      title: 'Personal Coach',
      subtitle: 'For parents & families',
      description: 'Perfect for parents coaching their children',
      maxAthletes: `Up to ${COACH_ROLE_CONFIG.PERSONAL.maxAthletes}`,
      features: [`Up to ${COACH_ROLE_CONFIG.PERSONAL.maxAthletes} athletes`, 'Family-focused UI', 'Simplified interface', 'Parent-friendly tools']
    },
    {
      role: 'SELF' as CoachRole,
      icon: User,
      title: 'Self-Coached',
      subtitle: 'For individual athletes',
      description: 'Manage your own training and progress',
      maxAthletes: `${COACH_ROLE_CONFIG.SELF.maxAthletes} (yourself)`,
      features: ['Personal dashboard', 'Individual focus', 'Self-tracking tools', 'Training insights']
    }
  ];

export default function OnboardingPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { coach, loading: profileLoading } = useCoachProfile()

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      displayName: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    }
  })

  const [, createCoach] = useMutation(CREATE_COACH_MUTATION)

  // Redirect if already onboarded
  useEffect(() => {
    if (!profileLoading && coach?.onboardingCompleted) {
      router.push('/')
    }
  }, [coach, profileLoading, router])

  // Redirect if not authenticated (but wait for auth to finish loading)
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const onSubmit = async (data: OnboardingFormData) => {
    try {
      const result = await createCoach({
        input: {
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          displayName: data.displayName?.trim() || undefined,
          timezone: data.timezone,
          role: data.role,
        }
      })

      if (result.error) {
        form.setError("root", { message: result.error.message })
        return
      }

      // Success! Redirect to athlete creation
      router.push('/athletes/new?onboarding=true')
    } catch (err) {
      form.setError("root", { 
        message: err instanceof Error ? err.message : "An unexpected error occurred" 
      })
    }
  }

  const handleRoleSelect = (role: CoachRole) => {
    form.setValue("role", role)
    form.clearErrors("role")
  }

  // Show loading while checking auth/profile
  if (authLoading || profileLoading || (!authLoading && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin  h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg inline-block">
            <span className="text-sm font-medium text-primary">Step 1 of 2: Profile Setup</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to Torchlight!
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Let's set up your coaching profile to get started. Choose the mode that best fits how you'll be using Torchlight.
          </p>
        </div>

        <div className="bg-card shadow-lg p-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Coach Role Selection */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  Select Your Coaching Mode
                </h2>
                <p className="text-muted-foreground">
                  This determines your interface and athlete limits. You can change this later in settings.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {COACH_ROLE_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = form.watch("role") === option.role;

                  return (
                    <Card
                      key={option.role}
                      className={`p-6 cursor-pointer transition-all border-2 hover:shadow-md ${isSelected
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border hover:border-border/80'
                        }`}
                      onClick={() => handleRoleSelect(option.role)}
                    >
                      <div className="text-center space-y-4">
                        <div className={`mx-auto w-16 h-16 flex items-center justify-center ${isSelected ? 'bg-primary/10' : 'bg-muted'
                          }`}>
                          <Icon className={`w-8 h-8 ${isSelected ? 'text-primary' : 'text-muted-foreground'
                            }`} />
                        </div>

                        <div>
                          <h3 className="font-semibold text-lg text-foreground mb-1">
                            {option.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {option.subtitle}
                          </p>
                          <Badge variant="secondary" className="mb-3">
                            {option.maxAthletes}
                          </Badge>
                          <p className="text-sm text-muted-foreground mb-4">
                            {option.description}
                          </p>
                        </div>

                        <ul className="text-sm text-muted-foreground space-y-1 text-left">
                          {option.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-muted-foreground"></span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Card>
                  );
                })}
              </div>
              {form.formState.errors.role && (
                <p className="text-sm text-destructive">{form.formState.errors.role.message}</p>
              )}
            </div>

            {/* Profile Information */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  Profile Information
                </h2>
                <p className="text-muted-foreground">
                  Tell us a bit about yourself to personalize your experience.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Input
                    id="firstName"
                    {...form.register("firstName")}
                    placeholder="Your first name"
                    disabled={form.formState.isSubmitting}
                    className="h-12"
                    errors={form.formState.errors}
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    id="lastName"
                    {...form.register("lastName")}
                    placeholder="Your last name"
                    disabled={form.formState.isSubmitting}
                    className="h-12"
                    errors={form.formState.errors}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Input
                  id="displayName"
                  {...form.register("displayName")}
                  placeholder="How you'd like to be called"
                  disabled={form.formState.isSubmitting}
                  className="h-12"
                  errors={form.formState.errors}
                />
              </div>

            </div>

            {form.formState.errors.root && (
              <div className=" bg-destructive/10 border border-destructive/20 p-4">
                <ErrorMessage message={form.formState.errors.root.message || "An error occurred"} />
              </div>
            )}

            <div className="flex justify-center pt-6">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || !form.watch("role")}
                size="lg"
                className="px-8 py-3 text-lg"
              >
                {form.formState.isSubmitting ? (
                  "Setting up your profile..."
                ) : (
                  <>
                    Next
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              You'll receive a 14-day free trial to get started with Torchlight.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}