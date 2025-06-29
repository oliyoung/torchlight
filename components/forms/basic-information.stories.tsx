import type { Meta, StoryObj } from "@storybook/react";
import { BasicInformationForm } from "./basic-information";
import { FieldErrors, useForm, Control } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const basicInformationSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  sport: z.string().optional(),
});

type FormValues = z.infer<typeof basicInformationSchema>;

// Wrapper component to provide form context
const BasicInformationFormWrapper = ({
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
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(basicInformationSchema),
    defaultValues,
  });

  // Simulate validation errors
  const mockErrors: FieldErrors<FormValues> = hasErrors ? {
    firstName: { type: "manual", message: "First name is required" },
    lastName: { type: "manual", message: "Last name is required" },
    email: { type: "manual", message: "Valid email is required" },
    sport: { type: "manual", message: "Sport selection is required" },
  } : {};

  return (
    <BasicInformationForm
      register={register}
      control={control as Control<any>}
      errors={hasErrors ? mockErrors : errors}
      disabled={disabled}
    />
  );
};

const meta: Meta<typeof BasicInformationFormWrapper> = {
  title: "Forms/BasicInformationForm",
  component: BasicInformationFormWrapper,
  parameters: {
    docs: {
      description: {
        component: "Basic information form component for athlete profiles. Includes name, email, and sport selection fields."
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
type Story = StoryObj<typeof BasicInformationFormWrapper>;

export const Default: Story = {
  args: {
    disabled: false,
    hasErrors: false,
    defaultValues: {}
  },
  parameters: {
    docs: {
      description: {
        story: "Default basic information form with empty fields."
      }
    }
  }
};

export const WithData: Story = {
  args: {
    disabled: false,
    hasErrors: false,
    defaultValues: {
      firstName: "Alex",
      lastName: "Rodriguez",
      email: "alex.rodriguez@email.com",
      sport: "basketball"
    }
  },
  parameters: {
    docs: {
      description: {
        story: "Basic information form with realistic athlete data."
      }
    }
  }
};

export const WithErrors: Story = {
  args: {
    disabled: false,
    hasErrors: true,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "invalid-email",
      sport: ""
    }
  },
  parameters: {
    docs: {
      description: {
        story: "Basic information form showing validation errors."
      }
    }
  }
};

export const Disabled: Story = {
  args: {
    disabled: true,
    hasErrors: false,
    defaultValues: {
      firstName: "Jordan",
      lastName: "Smith",
      email: "jordan.smith@email.com",
      sport: "soccer"
    }
  },
  parameters: {
    docs: {
      description: {
        story: "Basic information form in disabled state (read-only)."
      }
    }
  }
};

export const AlternativeSports: Story = {
  args: {
    disabled: false,
    hasErrors: false,
    defaultValues: {
      firstName: "Taylor",
      lastName: "Johnson",
      email: "taylor.johnson@email.com",
      sport: "tennis"
    }
  },
  parameters: {
    docs: {
      description: {
        story: "Basic information form showing different sport selection options."
      }
    }
  }
};