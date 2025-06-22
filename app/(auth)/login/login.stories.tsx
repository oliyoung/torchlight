import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorMessage } from "@/components/ui/error-message";
import { Separator } from "@/components/ui/separator";

// Standalone login form component for Storybook
const StandaloneLoginForm = ({
  showError = false,
  errorMessage = "Invalid email or password. Please try again.",
  isEmailLoading = false,
  isGoogleLoading = false,
  errorFromUrl = null
}: {
  showError?: boolean;
  errorMessage?: string;
  isEmailLoading?: boolean;
  isGoogleLoading?: boolean;
  errorFromUrl?: string | null;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localEmailLoading, setLocalEmailLoading] = useState(false);
  const [localGoogleLoading, setLocalGoogleLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Use prop loading states or local state
  const emailLoading = isEmailLoading || localEmailLoading;
  const googleLoading = isGoogleLoading || localGoogleLoading;

  // Determine which error to show
  const displayError = errorFromUrl || (showError ? errorMessage : null) || localError;

  // Error messages for different URL parameters
  const getErrorFromUrl = (errorType: string) => {
    switch (errorType) {
      case "auth_callback_failed":
        return "Authentication failed. Please try again.";
      case "session_expired":
        return "Your session has expired. Please sign in again.";
      case "no_session":
        return "Please sign in to continue.";
      case "signed_out":
        return "You have been signed out successfully.";
      case "force_logout":
        return "You have been logged out for security reasons.";
      default:
        return "An error occurred. Please try again.";
    }
  };

  const handleEmailAuth = async (isSignUp: boolean) => {
    if (!email || !password) {
      setLocalError("Please fill in all fields");
      return;
    }

    setLocalError(null);
    setLocalEmailLoading(true);

    // Simulate authentication
    setTimeout(() => {
      setLocalEmailLoading(false);
      // Simulate success
      alert(isSignUp ? "Account created successfully!" : "Signed in successfully!");
    }, 2000);
  };

  const handleGoogleAuth = async () => {
    setLocalError(null);
    setLocalGoogleLoading(true);

    // Simulate Google authentication
    setTimeout(() => {
      setLocalGoogleLoading(false);
      alert("Google sign-in successful!");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary rounded-lg flex items-center justify-center mb-6">
            <span className="text-white font-bold text-lg">TL</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Torchlight</h1>
          <p className="mt-2 text-gray-600">Sign in to your account or create a new one</p>
        </div>

        <Card className="mt-8">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Get Started</CardTitle>
            <CardDescription className="text-center">
              Choose your preferred sign-in method
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Error Message */}
            {displayError && (
              <div className="rounded-md bg-red-50 border border-red-200 p-4">
                <ErrorMessage message={displayError} />
              </div>
            )}

            {/* Google OAuth Button */}
            <Button
              variant="outline"
              type="button"
              disabled={emailLoading || googleLoading}
              onClick={handleGoogleAuth}
              className="w-full"
            >
              {googleLoading ? (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email and Password Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={emailLoading || googleLoading}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={emailLoading || googleLoading}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Email Auth Buttons */}
            <div className="space-y-2">
              <Button
                type="button"
                disabled={emailLoading || googleLoading}
                onClick={() => handleEmailAuth(false)}
                className="w-full"
              >
                {emailLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={emailLoading || googleLoading}
                onClick={() => handleEmailAuth(true)}
                className="w-full"
              >
                {emailLoading ? "Creating account..." : "Create Account"}
              </Button>
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-600 mt-4">
              <p>
                By continuing, you agree to our{" "}
                <a href="#" className="text-primary hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-primary hover:underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const meta: Meta<typeof StandaloneLoginForm> = {
  title: "Pages/Login",
  component: StandaloneLoginForm,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Complete login page with email/password and Google OAuth authentication. Shows different states including loading, errors, and success scenarios."
      }
    }
  },
  argTypes: {
    showError: {
      control: 'boolean',
      description: 'Show a general authentication error'
    },
    errorMessage: {
      control: 'text',
      description: 'Custom error message to display'
    },
    isEmailLoading: {
      control: 'boolean',
      description: 'Show loading state for email authentication'
    },
    isGoogleLoading: {
      control: 'boolean',
      description: 'Show loading state for Google authentication'
    },
    errorFromUrl: {
      control: 'select',
      options: [null, 'auth_callback_failed', 'session_expired', 'no_session', 'signed_out', 'force_logout'],
      description: 'Error type from URL parameters'
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof StandaloneLoginForm>;

export const Default: Story = {
  args: {
    showError: false,
    isEmailLoading: false,
    isGoogleLoading: false,
    errorFromUrl: null
  },
  parameters: {
    docs: {
      description: {
        story: "Default login page state with email and Google authentication options."
      }
    }
  }
};

export const WithError: Story = {
  args: {
    showError: true,
    errorMessage: "Invalid email or password. Please try again.",
    isEmailLoading: false,
    isGoogleLoading: false,
    errorFromUrl: null
  },
  parameters: {
    docs: {
      description: {
        story: "Login page displaying an authentication error message."
      }
    }
  }
};

export const EmailLoading: Story = {
  args: {
    showError: false,
    isEmailLoading: true,
    isGoogleLoading: false,
    errorFromUrl: null
  },
  parameters: {
    docs: {
      description: {
        story: "Login page with email authentication in loading state."
      }
    }
  }
};

export const GoogleLoading: Story = {
  args: {
    showError: false,
    isEmailLoading: false,
    isGoogleLoading: true,
    errorFromUrl: null
  },
  parameters: {
    docs: {
      description: {
        story: "Login page with Google OAuth authentication in loading state."
      }
    }
  }
};

export const SessionExpired: Story = {
  args: {
    showError: false,
    isEmailLoading: false,
    isGoogleLoading: false,
    errorFromUrl: 'session_expired'
  },
  parameters: {
    docs: {
      description: {
        story: "Login page showing session expired error (redirected from protected page)."
      }
    }
  }
};

export const AuthCallbackFailed: Story = {
  args: {
    showError: false,
    isEmailLoading: false,
    isGoogleLoading: false,
    errorFromUrl: 'auth_callback_failed'
  },
  parameters: {
    docs: {
      description: {
        story: "Login page showing authentication callback failure error."
      }
    }
  }
};

export const ForceLogout: Story = {
  args: {
    showError: false,
    isEmailLoading: false,
    isGoogleLoading: false,
    errorFromUrl: 'force_logout'
  },
  parameters: {
    docs: {
      description: {
        story: "Login page after user was forcefully logged out for security reasons."
      }
    }
  }
};

export const SignedOut: Story = {
  args: {
    showError: false,
    isEmailLoading: false,
    isGoogleLoading: false,
    errorFromUrl: 'signed_out'
  },
  parameters: {
    docs: {
      description: {
        story: "Login page showing successful sign-out confirmation."
      }
    }
  }
};

export const CustomError: Story = {
  args: {
    showError: true,
    errorMessage: "Account temporarily locked. Please contact support.",
    isEmailLoading: false,
    isGoogleLoading: false,
    errorFromUrl: null
  },
  parameters: {
    docs: {
      description: {
        story: "Login page with a custom error message example."
      }
    }
  }
};