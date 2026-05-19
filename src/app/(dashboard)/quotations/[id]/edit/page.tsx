"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWizardStore } from "@/stores/quotation-wizard-store";

function toNum(value: unknown): number | undefined {
  if (value == null) return undefined;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (typeof value === "object" && value !== null) {
    const v = value as Record<string, unknown>;
    if (Array.isArray(v.d) && typeof v.e === "number" && typeof v.s === "number") {
      const digits = (v.d as number[]).join("");
      const exp = v.e as number;
      const sign = v.s as number;
      let num = Number(digits);
      if (exp !== 0) num = num * Math.pow(10, exp);
      return num * sign;
    }
    if ("toNumber" in v && typeof v.toNumber === "function") {
      return (v as { toNumber: () => number }).toNumber();
    }
  }
  return Number(value);
}
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
import { ArrowLeft, Loader2, RotateCcw } from "lucide-react";

interface QuotationDetail {
  id: string;
  quoteNo: string;
  status: string;
  clientName: string;
  companyName: string | null;
  country: string;
  city: string | null;
  clientEmail: string | null;
  clientWhatsapp: string | null;
  clientType: string | null;
  leadSource: string | null;
  projectName: string;
  projectAddress: string | null;
  projectType: string | null;
  projectStage: string | null;
  hasDrawings: boolean;
  expectedPurchaseTime: string | null;
  quoteDate: string;
  quoteValidity: string | null;
  currency: string;
  tradeTerm: string;
  productionLeadTime: string | null;
  paymentTerm: string | null;
  profileSeries: string | null;
  frameColor: string | null;
  surfaceTreatment: string | null;
  glassSpecification: string | null;
  hardwareBrand: string | null;
  screenType: string | null;
  installationMethod: string | null;
  certifications: string[];
  totalArea: number;
  productSubtotal: number;
  accessoriesPackingFee: number;
  shippingCost: number;
  discount: number;
  grandTotal: number;
  termsAndConditions: string | null;
  notes: string | null;
  tbcSummary: string | null;
  items: {
    id: string;
    itemNo: number;
    windowDoorId: string | null;
    productType: string;
    width: number | null;
    height: number | null;
    quantity: number;
    area: number | null;
    finalUnitPrice: number | null;
    finalAmount: number | null;
    openingWay: string | null;
    notes: string | null;
    images: {
      id: string;
      filePath: string;
      description: string | null;
      isTbc: boolean;
      tbcNotes: string | null;
      sortOrder: number;
    }[];
  }[];
}

export default function EditQuotationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { currentStep, setStep, nextStep, prevStep, reset, hydrate } =
    useWizardStore();

  useEffect(() => {
    async function fetchQuotation() {
      try {
        const res = await fetch(`/api/quotations/${id}`);
        if (!res.ok) throw new Error("Failed to load quotation");
        const q: QuotationDetail = await res.json();

        hydrate(
          {
            step1: {
              clientName: q.clientName,
              companyName: q.companyName || "",
              country: q.country,
              city: q.city || "",
              clientEmail: q.clientEmail || "",
              clientWhatsapp: q.clientWhatsapp || "",
              clientType: q.clientType || "",
              leadSource: q.leadSource || "",
            },
            step2: {
              projectName: q.projectName,
              projectAddress: q.projectAddress || "",
              projectType: q.projectType || "",
              projectStage: q.projectStage || "",
              hasDrawings: q.hasDrawings,
              expectedPurchaseTime: q.expectedPurchaseTime || "",
            },
            step3: {
              quoteDate: new Date(q.quoteDate),
              quoteValidity: q.quoteValidity || "30 days",
              currency: q.currency || "USD",
              tradeTerm: q.tradeTerm || "EXW",
              productionLeadTime: q.productionLeadTime || "5-7 weeks",
              paymentTerm: q.paymentTerm || "50% deposit + 50% balance",
            },
            step4: {
              profileSeries: q.profileSeries || "",
              frameColor: q.frameColor || "",
              surfaceTreatment: q.surfaceTreatment || "",
              glassSpecification: q.glassSpecification || "",
              hardwareBrand: q.hardwareBrand || "",
              screenType: q.screenType || "",
              installationMethod: q.installationMethod || "",
              certifications: q.certifications || [],
            },
            step5: {
              items: q.items.map((item) => ({
                id: item.id,
                itemNo: item.itemNo,
                windowDoorId: item.windowDoorId || undefined,
                productType: item.productType,
                width: item.width || undefined,
                height: item.height || undefined,
                quantity: item.quantity,
                area: toNum(item.area) ?? undefined,
                finalUnitPrice: toNum(item.finalUnitPrice) ?? undefined,
                finalAmount: toNum(item.finalAmount) ?? undefined,
                openingWay: item.openingWay || undefined,
                notes: item.notes || undefined,
              })),
            },
            step6: {
              itemImages: q.items.flatMap((item) =>
                item.images.map((img) => ({
                  id: img.id,
                  quotationItemId: String(item.itemNo),
                  filePath: img.filePath,
                  description: img.description || undefined,
                  isTbc: img.isTbc,
                  tbcNotes: img.tbcNotes || undefined,
                  sortOrder: img.sortOrder,
                }))
              ),
            },
            step7: {
              totalArea: toNum(q.totalArea) ?? 0,
              productSubtotal: toNum(q.productSubtotal) ?? 0,
              accessoriesPackingFee: toNum(q.accessoriesPackingFee) ?? 0,
              shippingCost: toNum(q.shippingCost) ?? 0,
              discount: toNum(q.discount) ?? 0,
              grandTotal: toNum(q.grandTotal) ?? 0,
            },
            step8: {
              termsAndConditions: q.termsAndConditions || "",
              notes: q.notes || "",
              tbcSummary: q.tbcSummary || "",
            },
          },
          q.id
        );
      } catch {
        setError("加载报价失败，请返回重试。");
      } finally {
        setLoading(false);
      }
    }

    fetchQuotation();

    return () => {
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">加载报价中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.push("/quotations")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回
        </Button>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/quotations")}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            返回
          </Button>
          <div>
            <h1 className="text-2xl font-bold">编辑报价</h1>
            <p className="text-sm text-muted-foreground">
              第 {currentStep + 1} 步，共 8 步
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={reset}>
          <RotateCcw className="mr-1 h-4 w-4" />
          重置
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
