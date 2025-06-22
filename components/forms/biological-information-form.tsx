"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegister, FieldErrors } from "react-hook-form";

interface BiologicalInformationData {
  birthday?: string;
  gender?: string;
  height?: string;
  weight?: string;
}

interface BiologicalInformationFormProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  disabled?: boolean;
  className?: string;
}

export const BiologicalInformationForm = ({
  register,
  errors,
  disabled = false,
  className = ""
}: BiologicalInformationFormProps) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-medium">Biological Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <Input id="birthday" type="date" {...register("birthday")} disabled={disabled}  errors={errors}/>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <select
            id="gender"
            {...register("gender")}
            disabled={disabled}
            className="flex h-10 w-full input"
          >
            <option value="">Select gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
            <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
          </select>
          {errors.gender && (
            <span className="text-xs text-destructive">
              {String(errors.gender.message) || "This field is required"}
            </span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input id="height" type="number" step="0.1" {...register("height")} placeholder="e.g. 178" disabled={disabled} errors={errors} />
        <Input id="weight" type="number" step="0.1" {...register("weight")} placeholder="e.g. 68" disabled={disabled} errors={errors} />
      </div>
    </div>
  );
};

export type { BiologicalInformationData };