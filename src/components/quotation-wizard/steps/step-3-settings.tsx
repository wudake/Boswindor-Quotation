"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { step3Schema, type Step3Data } from "@/lib/quotation-schema";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

export function Step3Settings({ onNext, onBack }: StepProps) {
  const { step3, setStepData } = useWizardStore();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: step3,
  });

  const quoteDate = watch("quoteDate");
  const currency = watch("currency");
  const tradeTerm = watch("tradeTerm");
  const quoteValidity = watch("quoteValidity");
  const paymentTerm = watch("paymentTerm");
  const { options: currencyOptions } = useConfigurationOptions("CURRENCY");
  const { options: tradeTermOptions } = useConfigurationOptions("TRADE_TERM");
  const { options: paymentTermOptions } = useConfigurationOptions("PAYMENT_TERM");

  function onSubmit(data: Step3Data) {
    setStepData("step3", data);
    onNext();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Quote Date *</Label>
          <Popover>
            <PopoverTrigger>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !quoteDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {quoteDate ? format(quoteDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={quoteDate}
                onSelect={(d) => d && setValue("quoteDate", d)}
              />
            </PopoverContent>
          </Popover>
          {errors.quoteDate && (
            <p className="text-sm text-destructive">{errors.quoteDate.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Quote Validity</Label>
          <Select
            value={quoteValidity || ""}
            onValueChange={(v) => setValue("quoteValidity", v || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15 days">15 days</SelectItem>
              <SelectItem value="30 days">30 days</SelectItem>
              <SelectItem value="60 days">60 days</SelectItem>
              <SelectItem value="90 days">90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Currency</Label>
          <Select
            value={currency || ""}
            onValueChange={(v) => setValue("currency", v || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {currencyOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Trade Term</Label>
          <Select
            value={tradeTerm || ""}
            onValueChange={(v) => setValue("tradeTerm", v || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {tradeTermOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="productionLeadTime">Production Lead Time</Label>
          <Input id="productionLeadTime" {...register("productionLeadTime")} />
        </div>
        <div className="space-y-2">
          <Label>Payment Term</Label>
          <Select
            value={paymentTerm || ""}
            onValueChange={(v) => setValue("paymentTerm", v || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {paymentTermOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
