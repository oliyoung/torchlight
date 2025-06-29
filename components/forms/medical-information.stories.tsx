import type { Meta, StoryObj } from "@storybook/react";
import { MedicalInformationForm } from "./medical-information";
import { FieldErrors, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const medicalInformationSchema = z.object({
  medicalConditions: z.string().optional(),
  injuries: z.string().optional(),
});

type FormValues = z.infer<typeof medicalInformationSchema>;

// Wrapper component to provide form context
const MedicalInformationFormWrapper = ({
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
  } = useForm<FormValues>({
    resolver: zodResolver(medicalInformationSchema),
    defaultValues,
  });

  // Simulate validation errors
  const mockErrors: FieldErrors<FormValues> = hasErrors ? {
    medicalConditions: { type: "manual", message: "Medical conditions are required" },
    injuries: { type: "manual", message: "Injury information is required" },
  } : {};

  return (
    <MedicalInformationForm
      register={register}
      errors={hasErrors ? mockErrors : errors}
      disabled={disabled}
    />
  );
};

const meta: Meta<typeof MedicalInformationFormWrapper> = {
  title: "Forms/MedicalInformationForm",
  component: MedicalInformationFormWrapper,
  parameters: {
    docs: {
      description: {
        component: "Isolated medical information form component for athlete profiles. Includes medical conditions and injury history fields."
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
type Story = StoryObj<typeof MedicalInformationFormWrapper>;

export const Default: Story = {
  args: {
    disabled: false,
    hasErrors: false,
    defaultValues: {}
  },
  parameters: {
    docs: {
      description: {
        story: "Default medical information form with empty fields."
      }
    }
  }
};

export const WithData: Story = {
  args: {
    disabled: false,
    hasErrors: false,
    defaultValues: {
      medicalConditions: "Asthma - uses inhaler as needed. Allergy to shellfish.",
      injuries: "Previous ACL tear in left knee (2022) - fully recovered. Minor ankle sprain (2023)."
    }
  },
  parameters: {
    docs: {
      description: {
        story: "Medical information form with realistic medical data."
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
        story: "Medical information form showing validation errors."
      }
    }
  }
};

export const Disabled: Story = {
  args: {
    disabled: true,
    hasErrors: false,
    defaultValues: {
      medicalConditions: "No known medical conditions",
      injuries: "No previous injuries"
    }
  },
  parameters: {
    docs: {
      description: {
        story: "Medical information form in disabled state (read-only)."
      }
    }
  }
};

export const LongContent: Story = {
  args: {
    disabled: false,
    hasErrors: false,
    defaultValues: {
      medicalConditions: "Type 1 Diabetes - managed with insulin pump. Regular blood sugar monitoring required before and after training. Carries glucose tablets. Emergency contact aware of condition and treatment protocol.",
      injuries: "2021: Stress fracture in right tibia - healed completely with 6 months rest. 2022: Rotator cuff strain - completed physical therapy, full range of motion restored. 2023: Minor hamstring pull - resolved with rest and stretching routine."
    }
  },
  parameters: {
    docs: {
      description: {
        story: "Medical information form with longer, detailed content to test text area expansion."
      }
    }
  }
};