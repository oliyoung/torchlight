"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UseFormRegister, FieldErrors } from "react-hook-form";

interface MedicalInformationData {
  medicalConditions?: string;
  injuries?: string;
}

interface MedicalInformationFormProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  disabled?: boolean;
  className?: string;
}

export const MedicalInformationForm = ({
  register,
  errors,
  disabled = false,
  className = ""
}: MedicalInformationFormProps) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-medium">Medical Information</h3>
      <Textarea
        label="Medical Conditions"
        id="medicalConditions"
        {...register("medicalConditions")}
        rows={2}
        placeholder="Any medical conditions, allergies, or medications"
        disabled={disabled}
        errors={errors}
      />
      <Textarea
        label="Current or Past Injuries"
        id="injuries"
        {...register("injuries")}
        rows={2}
        placeholder="Any current or past injuries that may affect training"
        disabled={disabled}
        errors={errors} />
    </div>
  );
};

export type { MedicalInformationData };