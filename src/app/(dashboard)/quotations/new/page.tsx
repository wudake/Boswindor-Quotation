"use client";

import { useEffect } from "react";
import { useWizardStore } from "@/stores/quotation-wizard-store";
import { Stepper } from "@/components/quotation-wizard/stepper";
import { Step1Client } from "@/components/quotation-wizard/steps/step-1-client";
import { Step2Project } from "@/components/quotation-wizard/steps/step-2-project";
import { Step3Settings } from "@/components/quotation-wizard/steps/step-3-settings";
import { Step4Spec } from "@/components/quotation-wizard/steps/step-4-spec";
import { Step5Items } from "@/components/quotation-wizard/steps/step-5-items";
import { Step6Images } from "@/components/quotation-wizard/steps/step-6-images";
import { Step7Summary } from "@/components/quotation-wizard/steps/step-7-summary";
import { Step8Preview } from "@/components/quotation-wizard/steps/step-8-preview";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

export default function NewQuotationPage() {
  const { currentStep, setStep, nextStep, prevStep, reset, quotationId } =
    useWizardStore();

  // 如果 store 中残留了编辑数据（quotationId 存在），自动清空
  useEffect(() => {
    if (quotationId) {
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const steps = [
    <Step1Client key={1} onNext={nextStep} />,
    <Step2Project key={2} onNext={nextStep} onBack={prevStep} />,
    <Step3Settings key={3} onNext={nextStep} onBack={prevStep} />,
    <Step4Spec key={4} onNext={nextStep} onBack={prevStep} />,
    <Step5Items key={5} onNext={nextStep} onBack={prevStep} />,
    <Step6Images key={6} onNext={nextStep} onBack={prevStep} />,
    <Step7Summary key={7} onNext={nextStep} onBack={prevStep} />,
    <Step8Preview key={8} onBack={prevStep} />,
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">New Quotation</h1>
          <p className="text-sm text-muted-foreground">
            Step {currentStep + 1} of 8
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={reset}>
          <RotateCcw className="mr-1 h-4 w-4" />
          Reset
        </Button>
      </div>

      <Stepper
        currentStep={currentStep}
        onStepClick={(step) => {
          if (step < currentStep) setStep(step);
        }}
      />

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        {steps[currentStep]}
      </div>
    </div>
  );
}
