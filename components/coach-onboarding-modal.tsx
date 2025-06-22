"use client"

import { useState } from "react"
import { useMutation } from "urql"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ErrorMessage } from "@/components/ui/error-message"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, User, Trophy } from "lucide-react"
import type { CoachRole } from "@/lib/types"
import { getRoleDisplayConfig, COACH_ROLE_CONFIG } from "@/lib/utils/coach-role-limits"

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

interface CoachOnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

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

export function CoachOnboardingModal({ isOpen, onClose, onSuccess }: Readonly<CoachOnboardingModalProps>) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    displayName: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    role: null as CoachRole | null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [, createCoach] = useMutation(CREATE_COACH_MUTATION)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!formData.role) {
      setError("Please select a coaching mode")
      setIsSubmitting(false)
      return
    }

    try {
      const result = await createCoach({
        input: {
          firstName: formData.firstName.trim() || undefined,
          lastName: formData.lastName.trim() || undefined,
          displayName: formData.displayName.trim() || undefined,
          timezone: formData.timezone,
          role: formData.role,
        }
      })

      if (result.error) {
        setError(result.error.message)
        return
      }

      // Success! Close modal and trigger refresh
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  const handleRoleSelect = (role: CoachRole) => {
    setFormData(prev => ({
      ...prev,
      role
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome to Torchlight!</DialogTitle>
          <DialogDescription>
            Choose your coaching mode and set up your profile to get started.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Coach Role Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Select Your Coaching Mode</Label>
            <div className="grid gap-3">
              {COACH_ROLE_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = formData.role === option.role;
                
                return (
                  <Card
                    key={option.role}
                    className={`p-4 cursor-pointer transition-all border-2 ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleRoleSelect(option.role)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        isSelected ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          isSelected ? 'text-blue-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm">{option.title}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {option.maxAthletes}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {option.description}
                        </p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {option.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-1">
                              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Profile Information */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Profile Information</Label>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange("firstName")}
                  placeholder="Your first name"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange("lastName")}
                  placeholder="Your last name"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name (Optional)</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={handleInputChange("displayName")}
                placeholder="How you'd like to be called"
                disabled={isSubmitting}
              />
            </div>

          </div>

          {error && <ErrorMessage message={error} />}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || !formData.role}
              className="w-full"
            >
              {isSubmitting ? "Setting up your profile..." : "Complete Setup"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            You'll receive a 14-day free trial to get started with Torchlight.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}