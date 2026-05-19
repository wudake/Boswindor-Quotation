"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { step1Schema, type Step1Data } from "@/lib/quotation-schema";
import { useWizardStore } from "@/stores/quotation-wizard-store";
import { useConfigurationOptions } from "@/hooks/use-configuration-options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StepProps {
  onNext: () => void;
}

export function Step1Client({ onNext }: StepProps) {
  const { step1, setStepData } = useWizardStore();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: step1,
  });

  const clientType = watch("clientType");
  const leadSource = watch("leadSource");
  const { options: clientTypeOptions } = useConfigurationOptions("CLIENT_TYPE");
  const { options: leadSourceOptions } = useConfigurationOptions("LEAD_SOURCE");

  function onSubmit(data: Step1Data) {
    setStepData("step1", data);
    onNext();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="clientName">Client Name *</Label>
          <Input id="clientName" {...register("clientName")} />
          {errors.clientName && (
            <p className="text-sm text-destructive">{errors.clientName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input id="companyName" {...register("companyName")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country *</Label>
          <Input id="country" {...register("country")} />
          {errors.country && (
            <p className="text-sm text-destructive">{errors.country.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register("city")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="clientEmail">Email</Label>
          <Input id="clientEmail" type="email" {...register("clientEmail")} />
          {errors.clientEmail && (
            <p className="text-sm text-destructive">{errors.clientEmail.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="clientWhatsapp">WhatsApp / Phone</Label>
          <Input id="clientWhatsapp" {...register("clientWhatsapp")} />
        </div>
        <div className="space-y-2">
          <Label>Client Type</Label>
          <Select
            value={clientType || ""}
            onValueChange={(v) => setValue("clientType", v || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {clientTypeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Lead Source</Label>
          <Select
            value={leadSource || ""}
            onValueChange={(v) => setValue("leadSource", v || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {leadSourceOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit">Next</Button>
      </div>
    </form>
  );
}
