import type { Meta, StoryObj } from "@storybook/react";
import { EmergencyContactForm } from "./emergency-contact-form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const emergencyContactSchema = z.object({
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
});

type FormValues = z.infer<typeof emergencyContactSchema>;

// Wrapper component to provide form context
const EmergencyContactFormWrapper = ({
  disabled = false,
  hasErrors = false,
  defaultValues = {}
}: {
  disabled?: boolean;
  hasErrors?: boolean;
  defaultValues?: Partial<FormValues>;
}) => {
  const {
    register,
    formState: { errors },
    trigger
  } = useForm<FormValues>({
    resolver: zodResolver(emergencyContactSchema),
    defaultValues,
  });

  // Simulate validation errors
  const mockErrors = hasErrors ? {
    emergencyContactName: { message: "Contact name is required" },
    emergencyContactPhone: { message: "Valid phone number is required" },
  } : {};

  return (
    <div className="max-w-2xl mx-auto p-6 bg-background">
      <EmergencyContactForm 
        register={register}
        errors={hasErrors ? mockErrors : errors}
        disabled={disabled}
      />
    </div>
  );
};

const meta: Meta<typeof EmergencyContactFormWrapper> = {
  title: "Forms/EmergencyContactForm",
  component: EmergencyContactFormWrapper,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Isolated emergency contact form component for athlete profiles. Includes contact name and phone number fields with validation."
      }
    }
  },
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Disable all form inputs'
    },
    hasErrors: {
      control: 'boolean',
      description: 'Show validation errors'
    },
    defaultValues: {
      control: 'object',
      description: 'Default form values'
    }
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EmergencyContactFormWrapper>;

export const Default: Story = {
  args: {
    disabled: false,
    hasErrors: false,
    defaultValues: {}
  },
  parameters: {
    docs: {
      description: {
        story: "Default emergency contact form with empty fields."
      }
    }
  }
};

export const WithData: Story = {
  args: {
    disabled: false,
    hasErrors: false,
    defaultValues: {
      emergencyContactName: "Jane Smith",
      emergencyContactPhone: "+1 (555) 123-4567"
    }
  },
  parameters: {
    docs: {
      description: {
        story: "Emergency contact form with prefilled data."
      }
    }
  }
};

export const WithErrors: Story = {
  args: {
    disabled: false,
    hasErrors: true,
    defaultValues: {}
  },
  parameters: {
    docs: {
      description: {
        story: "Emergency contact form showing validation errors."
      }
    }
  }
};

export const Disabled: Story = {
  args: {
    disabled: true,
    hasErrors: false,
    defaultValues: {
      emergencyContactName: "Jane Smith",
      emergencyContactPhone: "+1 (555) 123-4567"
    }
  },
  parameters: {
    docs: {
      description: {
        story: "Emergency contact form in disabled state (read-only)."
      }
    }
  }
};