import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Step1Data,
  Step2Data,
  Step3Data,
  Step4Data,
  Step5Data,
  Step6Data,
  Step7Data,
  Step8Data,
} from "@/lib/quotation-schema";

interface WizardState {
  currentStep: number;
  quotationId: string | null;
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
  step4: Step4Data;
  step5: Step5Data;
  step6: Step6Data;
  step7: Step7Data;
  step8: Step8Data;
}

const initialState: WizardState = {
  currentStep: 0,
  quotationId: null,
  step1: {
    clientName: "",
    country: "",
    companyName: "",
    city: "",
    clientEmail: "",
    clientWhatsapp: "",
    clientType: "",
    leadSource: "",
  },
  step2: {
    projectName: "",
    projectAddress: "",
    projectType: "",
    projectStage: "",
    hasDrawings: false,
    expectedPurchaseTime: "",
  },
  step3: {
    quoteDate: new Date(),
    quoteValidity: "30 days",
    currency: "USD",
    tradeTerm: "EXW",
    productionLeadTime: "5-7 weeks",
    paymentTerm: "50% deposit + 50% balance",
  },
  step4: {
    profileSeries: "",
    frameColor: "",
    surfaceTreatment: "",
    glassSpecification: "",
    hardwareBrand: "",
    screenType: "",
    installationMethod: "",
    certifications: [],
  },
  step5: {
    items: [],
  },
  step6: {
    itemImages: [],
  },
  step7: {
    totalArea: 0,
    productSubtotal: 0,
    accessoriesPackingFee: 0,
    shippingCost: 0,
    discount: 0,
    grandTotal: 0,
  },
  step8: {
    termsAndConditions: "",
    notes: "",
    tbcSummary: "",
  },
};

interface WizardActions {
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setStepData: <K extends keyof WizardState>(
    stepKey: K,
    data: Partial<WizardState[K]>
  ) => void;
  reset: () => void;
  getAllData: () => Omit<WizardState, "currentStep">;
  hydrate: (data: Omit<WizardState, "currentStep" | "quotationId">, quotationId?: string) => void;
}

export const useWizardStore = create<WizardState & WizardActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      setStep: (step) => set({ currentStep: step }),
      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, 7),
        })),
      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 0),
        })),
      setStepData: (stepKey, data) =>
        set((state) => ({
          [stepKey]: { ...(state[stepKey] as object), ...data },
        } as Partial<WizardState>)),
      reset: () => set(initialState),
      getAllData: () => {
        const { currentStep: _, ...data } = get();
        return data;
      },
      hydrate: (data, quotationId) =>
        set({
          currentStep: 0,
          quotationId: quotationId || null,
          step1: data.step1,
          step2: data.step2,
          step3: data.step3,
          step4: data.step4,
          step5: data.step5,
          step6: data.step6,
          step7: data.step7,
          step8: data.step8,
        }),
    }),
    {
      name: "quotation-wizard-draft",
      partialize: (state) => ({
        currentStep: state.currentStep,
        step1: state.step1,
        step2: state.step2,
        step3: state.step3,
        step4: state.step4,
        step5: state.step5,
        step6: state.step6,
        step7: state.step7,
        step8: state.step8,
      }),
    }
  )
);
