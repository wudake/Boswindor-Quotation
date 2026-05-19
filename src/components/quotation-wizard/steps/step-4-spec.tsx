"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { step4Schema, type Step4Data } from "@/lib/quotation-schema";
import { useWizardStore } from "@/stores/quotation-wizard-store";
import { useConfigurationOptions } from "@/hooks/use-configuration-options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export function Step4Spec({ onNext, onBack }: StepProps) {
  const { step4, setStepData } = useWizardStore();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
  } = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
    defaultValues: step4,
  });

  const surfaceTreatment = watch("surfaceTreatment");
  const certifications = watch("certifications") || [];
  const profileSeries = watch("profileSeries");
  const frameColor = watch("frameColor");
  const glassSpecification = watch("glassSpecification");
  const hardwareBrand = watch("hardwareBrand");
  const screenType = watch("screenType");
  const installationMethod = watch("installationMethod");

  const { options: surfaceTreatmentOptions } = useConfigurationOptions("SURFACE_TREATMENT");
  const { options: certificationOptions } = useConfigurationOptions("CERTIFICATION");
  const { options: profileSeriesOptions } = useConfigurationOptions("PROFILE_SERIES");
  const { options: frameColorOptions } = useConfigurationOptions("FRAME_COLOR");
  const { options: glassSpecOptions } = useConfigurationOptions("GLASS_SPECIFICATION");
  const { options: hardwareBrandOptions } = useConfigurationOptions("HARDWARE_BRAND");
  const { options: screenTypeOptions } = useConfigurationOptions("SCREEN_TYPE");
  const { options: installMethodOptions } = useConfigurationOptions("INSTALLATION_METHOD");

  function onSubmit(data: Step4Data) {
    setStepData("step4", data);
    onNext();
  }

  function toggleCertification(cert: string) {
    const current = certifications || [];
    if (current.includes(cert)) {
      setValue(
        "certifications",
        current.filter((c) => c !== cert)
      );
    } else {
      setValue("certifications", [...current, cert]);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="profileSeries">Profile Series</Label>
          {profileSeriesOptions.length > 0 ? (
            <Select
              value={profileSeries || ""}
              onValueChange={(v) => setValue("profileSeries", v || undefined)}
            >
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                {profileSeriesOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input id="profileSeries" {...register("profileSeries")} placeholder="e.g. AS118" />
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="frameColor">Frame Color</Label>
          {frameColorOptions.length > 0 ? (
            <Select
              value={frameColor || ""}
              onValueChange={(v) => setValue("frameColor", v || undefined)}
            >
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                {frameColorOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input id="frameColor" {...register("frameColor")} placeholder="e.g. Matt Black" />
          )}
        </div>
        <div className="space-y-2">
          <Label>Surface Treatment</Label>
          {surfaceTreatmentOptions.length > 0 ? (
            <Select
              value={surfaceTreatment || ""}
              onValueChange={(v) => setValue("surfaceTreatment", v || undefined)}
            >
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                {surfaceTreatmentOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="surfaceTreatment"
              {...register("surfaceTreatment")}
              placeholder="e.g. Powder Coating"
            />
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="hardwareBrand">Hardware Brand</Label>
          {hardwareBrandOptions.length > 0 ? (
            <Select
              value={hardwareBrand || ""}
              onValueChange={(v) => setValue("hardwareBrand", v || undefined)}
            >
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                {hardwareBrandOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input id="hardwareBrand" {...register("hardwareBrand")} placeholder="e.g. CMECH" />
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="screenType">Screen Type</Label>
          {screenTypeOptions.length > 0 ? (
            <Select
              value={screenType || ""}
              onValueChange={(v) => setValue("screenType", v || undefined)}
            >
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                {screenTypeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input id="screenType" {...register("screenType")} placeholder="e.g. Stainless Steel" />
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="installationMethod">Installation Method</Label>
          {installMethodOptions.length > 0 ? (
            <Select
              value={installationMethod || ""}
              onValueChange={(v) => setValue("installationMethod", v || undefined)}
            >
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                {installMethodOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="installationMethod"
              {...register("installationMethod")}
              placeholder="e.g. Timber reveals"
            />
          )}
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="glassSpecification">Glass Specification</Label>
          {glassSpecOptions.length > 0 ? (
            <Select
              value={glassSpecification || ""}
              onValueChange={(v) => setValue("glassSpecification", v || undefined)}
            >
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                {glassSpecOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Textarea
              id="glassSpecification"
              {...register("glassSpecification")}
              placeholder="e.g. 5+12A+5mm Low-E tempered glass"
              rows={3}
            />
          )}
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Certifications</Label>
          <div className="flex flex-wrap gap-4">
            {certificationOptions.map((opt) => (
              <div key={opt.value} className="flex items-center gap-2">
                <Checkbox
                  id={`cert-${opt.value}`}
                  checked={certifications.includes(opt.value)}
                  onCheckedChange={() => toggleCertification(opt.value)}
                />
                <Label htmlFor={`cert-${opt.value}`} className="cursor-pointer">
                  {opt.label}
                </Label>
              </div>
            ))}
          </div>
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
