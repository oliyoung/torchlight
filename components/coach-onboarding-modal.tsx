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

const CREATE_COACH_MUTATION = `
  mutation CreateCoach($input: CreateCoachInput!) {
    createCoach(input: $input) {
      id
      email
      firstName
      lastName
      displayName
      timezone
      onboardingCompleted
    }
  }
`

interface CoachOnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CoachOnboardingModal({ isOpen, onClose, onSuccess }: Readonly<CoachOnboardingModalProps>) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    displayName: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [, createCoach] = useMutation(CREATE_COACH_MUTATION)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await createCoach({
        input: {
          firstName: formData.firstName.trim() || undefined,
          lastName: formData.lastName.trim() || undefined,
          displayName: formData.displayName.trim() || undefined,
          timezone: formData.timezone,
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome to WiseGrowth!</DialogTitle>
          <DialogDescription>
            Let's set up your coaching profile to get started.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              value={formData.timezone}
              onChange={handleInputChange("timezone")}
              placeholder="Your timezone"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              This helps with scheduling. We've detected your timezone automatically.
            </p>
          </div>

          {error && <ErrorMessage message={error} />}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Setting up your profile..." : "Complete Setup"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            You'll receive a 14-day free trial to get started with WiseGrowth.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}