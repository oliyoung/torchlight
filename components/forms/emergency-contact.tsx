"use client";

import { Input } from "@/components/ui/input";
import { UseFormRegister, FieldErrors } from "react-hook-form";

interface EmergencyContactData {
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

interface EmergencyContactFormProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  disabled?: boolean;
  className?: string;
}

export const EmergencyContactForm = ({
  register,
  errors,
  disabled = false,
  className = ""
}: EmergencyContactFormProps) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-medium">Emergency Contact</h3>
      <div className="grid grid-cols-2 gap-4">
        <Input
          id="emergencyContactName"
          {...register("emergencyContactName")}
          placeholder="Full name"
          disabled={disabled}
          errors={errors} />
        <Input
          id="emergencyContactPhone"
          type="tel"
          {...register("emergencyContactPhone")}
          placeholder="Phone number"
          disabled={disabled}
          errors={errors} />
      </div>
    </div>
  );
};

export type { EmergencyContactData };