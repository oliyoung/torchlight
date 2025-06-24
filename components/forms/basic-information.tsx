"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SportSelect } from "@/components/ui/sport-select";
import { UseFormRegister, FieldErrors, Control } from "react-hook-form";
import { Controller } from "react-hook-form";

interface BasicInformationData {
  firstName?: string;
  lastName?: string;
  email?: string;
  sport?: string;
}

interface BasicInformationFormProps {
  register: UseFormRegister<any>;
  control: Control<any>;
  errors: FieldErrors<any>;
  disabled?: boolean;
  className?: string;
}

export const BasicInformationForm = ({
  register,
  control,
  errors,
  disabled = false,
  className = ""
}: BasicInformationFormProps) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-medium">Basic Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <Input id="firstName" {...register("firstName")} autoComplete="given-name" disabled={disabled} errors={errors} />
        <Input id="lastName" {...register("lastName")} autoComplete="family-name" disabled={disabled} errors={errors} />
      </div>
      <Input
        id="email"
        type="email"
        {...register("email")}
        autoComplete="email"
        disabled={disabled}
        errors={errors}
      />
      <Controller
        name="sport"
        control={control}
        render={({ field }) => (
          <SportSelect
            label="Primary Sport"
            value={field.value}
            onChange={field.onChange}
            error={String(errors.sport?.message) || undefined}
            disabled={disabled}
          />
        )}
      />
    </div>
  );
};

export type { BasicInformationData };