"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { step2Schema, type Step2Data } from "@/lib/quotation-schema";
import { useWizardStore } from "@/stores/quotation-wizard-store";
import { useConfigurationOptions } from "@/hooks/use-configuration-options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

export function Step2Project({ onNext, onBack }: StepProps) {
  const { step2, setStepData } = useWizardStore();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: step2,
  });

  const projectType = watch("projectType");
  const projectStage = watch("projectStage");
  const hasDrawings = watch("hasDrawings");
  const { options: projectTypeOptions } = useConfigurationOptions("PROJECT_TYPE");
  const { options: projectStageOptions } = useConfigurationOptions("PROJECT_STAGE");

  function onSubmit(data: Step2Data) {
    setStepData("step2", data);
    onNext();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="projectName">Project Name *</Label>
          <Input id="projectName" {...register("projectName")} />
          {errors.projectName && (
            <p className="text-sm text-destructive">{errors.projectName.message}</p>
          )}
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="projectAddress">Project Address</Label>
          <Input id="projectAddress" {...register("projectAddress")} />
        </div>
        <div className="space-y-2">
          <Label>Project Type</Label>
          <Select
            value={projectType || ""}
            onValueChange={(v) => setValue("projectType", v || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {projectTypeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Project Stage</Label>
          <Select
            value={projectStage || ""}
            onValueChange={(v) => setValue("projectStage", v || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {projectStageOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="hasDrawings"
            checked={hasDrawings}
            onCheckedChange={(v) => setValue("hasDrawings", v === true)}
          />
          <Label htmlFor="hasDrawings" className="cursor-pointer">
            Has Drawings
          </Label>
        </div>
        <div className="space-y-2">
          <Label htmlFor="expectedPurchaseTime">Expected Purchase Time</Label>
          <Input id="expectedPurchaseTime" {...register("expectedPurchaseTime")} />
        </div>
      </div>
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">Next</Button>
      </div>
    </form>
  );
}
