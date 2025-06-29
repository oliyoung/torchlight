import type { Meta, StoryObj } from "@storybook/react";
import { BiologicalInformationForm } from "./biological-information";
import { FieldErrors, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const biologicalInformationSchema = z.object({
  birthday: z.string().optional(),
  gender: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
});

type FormValues = z.infer<typeof biologicalInformationSchema>;

// Wrapper component to provide form context
const BiologicalInformationFormWrapper = ({
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
    resolver: zodResolver(biologicalInformationSchema),
    defaultValues,
  });

  // Simulate validation errors
  const mockErrors: FieldErrors<FormValues> = hasErrors ? {
    birthday: { type: "manual", message: "Birthday is required" },
    gender: { type: "manual", message: "Gender selection is required" },
    height: { type: "manual", message: "Height must be a valid number" },
    weight: { type: "manual", message: "Weight must be a valid number" },
  } : {};

  return (
    <BiologicalInformationForm
      register={register}
      errors={hasErrors ? mockErrors : errors}
      disabled={disabled}
    />
  );
};

const meta: Meta<typeof BiologicalInformationFormWrapper> = {
  title: "Forms/BiologicalInformationForm",
  component: BiologicalInformationFormWrapper,
  parameters: {
    docs: {
      description: {
        component: "Biological information form component for athlete profiles. Includes birthday, gender, height, and weight fields."
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
type Story = StoryObj<typeof BiologicalInformationFormWrapper>;

export const Default: Story = {
  args: {
    disabled: false,
    hasErrors: false,
    defaultValues: {}
  },
  parameters: {
    docs: {
      description: {
        story: "Default biological information form with empty fields."
      }
    }
  }
};

export const WithData: Story = {
  args: {
    disabled: false,
    hasErrors: false,
    defaultValues: {
      birthday: "2005-03-15",
      gender: "MALE",
      height: "175",
      weight: "70"
    }
  },
  parameters: {
    docs: {
      description: {
        story: "Biological information form with realistic athlete data."
      }
    }
  }
};

export const WithErrors: Story = {
  args: {
    disabled: false,
    hasErrors: true,
    defaultValues: {
      birthday: "",
      gender: "",
      height: "invalid",
      weight: "invalid"
    }
  },
  parameters: {
    docs: {
      description: {
        story: "Biological information form showing validation errors."
      }
    }
  }
};

export const Disabled: Story = {
  args: {
    disabled: true,
    hasErrors: false,
    defaultValues: {
      birthday: "1998-11-22",
      gender: "FEMALE",
      height: "168",
      weight: "65"
    }
  },
  parameters: {
    docs: {
      description: {
        story: "Biological information form in disabled state (read-only)."
      }
    }
  }
};

export const AlternativeGenders: Story = {
  args: {
    disabled: false,
    hasErrors: false,
    defaultValues: {
      birthday: "2000-07-08",
      gender: "OTHER",
      height: "182",
      weight: "85"
    }
  },
  parameters: {
    docs: {
      description: {
        story: "Biological information form showing alternative gender selection."
      }
    }
  }
};

export const YoungAthlete: Story = {
  args: {
    disabled: false,
    hasErrors: false,
    defaultValues: {
      birthday: "2008-09-12",
      gender: "MALE",
      height: "155",
      weight: "45"
    }
  },
  parameters: {
    docs: {
      description: {
        story: "Biological information form for a younger athlete with appropriate measurements."
      }
    }
  }
};