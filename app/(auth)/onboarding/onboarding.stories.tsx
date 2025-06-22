import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, User, Trophy, ArrowRight } from "lucide-react";
import type { CoachRole } from "@/lib/types";
import { COACH_ROLE_CONFIG } from "@/lib/utils/coach-role-limits";
import { useState } from "react";

// Inline onboarding form component for Storybook
const OnboardingFormInline = ({ initialRole }: { initialRole?: CoachRole | null } = {}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    displayName: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    role: initialRole || null as CoachRole | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!formData.role) {
      setError("Please select a coaching mode");
      setIsSubmitting(false);
      return;
    }

    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Profile created successfully!");
    }, 1000);
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleRoleSelect = (role: CoachRole) => {
    setFormData(prev => ({
      ...prev,
      role
    }));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg inline-block">
            <span className="text-sm font-medium text-primary">Step 1 of 2: Profile Setup</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to Torchlight! 🎯
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Let's set up your coaching profile to get started. Choose the mode that best fits how you'll be using Torchlight.
          </p>
        </div>

        <div className="bg-card shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
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
                  const isSelected = formData.role === option.role;

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
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange("firstName")}
                    placeholder="Your first name"
                    disabled={isSubmitting}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange("lastName")}
                    placeholder="Your last name"
                    disabled={isSubmitting}
                    className="h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-sm font-medium">
                  Display Name (Optional)
                </Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange("displayName")}
                  placeholder="How you'd like to be called"
                  disabled={isSubmitting}
                  className="h-12"
                />
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 p-4">
                <ErrorMessage message={error} />
              </div>
            )}

            <div className="flex justify-center pt-6">
              <Button
                type="submit"
                disabled={isSubmitting || !formData.role}
                size="lg"
                className="px-8 py-3 text-lg"
              >
                {isSubmitting ? (
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
  );
};

// Create a mock component that doesn't use hooks
const MockOnboardingPage = ({
  userLoading = false,
  coachLoading = false,
  hasCompletedOnboarding = false
}: {
  userLoading?: boolean;
  coachLoading?: boolean;
  hasCompletedOnboarding?: boolean;
}) => {
  if (userLoading || coachLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (hasCompletedOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  // Inline onboarding form component
  return <OnboardingFormInline />;
};

const meta: Meta<typeof MockOnboardingPage> = {
  title: "Pages/OnboardingStates",
  component: MockOnboardingPage,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Onboarding page states and flows without Next.js router dependencies. Shows loading states, completed states, and the main onboarding form."
      }
    },
  },
  argTypes: {
    userLoading: {
      control: 'boolean',
      description: 'Show user authentication loading state'
    },
    coachLoading: {
      control: 'boolean',
      description: 'Show coach profile loading state'
    },
    hasCompletedOnboarding: {
      control: 'boolean',
      description: 'Show completed onboarding redirect state'
    }
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MockOnboardingPage>;

export const Default: Story = {
  args: {
    userLoading: false,
    coachLoading: false,
    hasCompletedOnboarding: false
  },
  parameters: {
    docs: {
      description: {
        story: "Default onboarding flow showing the complete form."
      }
    }
  }
};

export const LoadingAuth: Story = {
  args: {
    userLoading: true,
    coachLoading: false,
    hasCompletedOnboarding: false
  },
  parameters: {
    docs: {
      description: {
        story: "Loading state while checking user authentication."
      }
    }
  }
};

export const LoadingProfile: Story = {
  args: {
    userLoading: false,
    coachLoading: true,
    hasCompletedOnboarding: false
  },
  parameters: {
    docs: {
      description: {
        story: "Loading state while checking coach profile."
      }
    }
  }
};

export const AlreadyCompleted: Story = {
  args: {
    userLoading: false,
    coachLoading: false,
    hasCompletedOnboarding: true
  },
  parameters: {
    docs: {
      description: {
        story: "State when user has already completed onboarding (redirecting to dashboard)."
      }
    }
  }
};