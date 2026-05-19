import { z } from "zod";

export const step1Schema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  companyName: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  city: z.string().optional(),
  clientEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  clientWhatsapp: z.string().optional(),
  clientType: z.string().optional(),
  leadSource: z.string().optional(),
});

export const step2Schema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  projectAddress: z.string().optional(),
  projectType: z.string().optional(),
  projectStage: z.string().optional(),
  hasDrawings: z.boolean().optional(),
  expectedPurchaseTime: z.string().optional(),
});

export const step3Schema = z.object({
  quoteDate: z.date().optional(),
  quoteValidity: z.string().optional(),
  currency: z.string().optional(),
  tradeTerm: z.string().optional(),
  productionLeadTime: z.string().optional(),
  paymentTerm: z.string().optional(),
});

export const step4Schema = z.object({
  profileSeries: z.string().optional(),
  frameColor: z.string().optional(),
  surfaceTreatment: z.string().optional(),
  glassSpecification: z.string().optional(),
  hardwareBrand: z.string().optional(),
  screenType: z.string().optional(),
  installationMethod: z.string().optional(),
  certifications: z.array(z.string()).optional(),
});

export const itemSchema = z.object({
  id: z.string().optional(),
  itemNo: z.number().optional(),
  windowDoorId: z.string().optional(),
  productType: z.string().min(1, "Product type is required"),
  width: z.number().min(1, "Width is required").optional(),
  height: z.number().min(1, "Height is required").optional(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  area: z.number().optional(),
  finalUnitPrice: z.number().min(0).optional(),
  finalAmount: z.number().min(0).optional(),
  openingWay: z.string().optional(),
  notes: z.string().optional(),
});

export const step5Schema = z.object({
  items: z.array(itemSchema).min(1, "At least one product item is required"),
});

export const step6Schema = z.object({
  itemImages: z
    .array(
      z.object({
        id: z.string().optional(),
        quotationItemId: z.string(),
        filePath: z.string(),
        description: z.string().optional(),
        isTbc: z.boolean().optional(),
        tbcNotes: z.string().optional(),
        sortOrder: z.number().optional(),
      })
    )
    .optional(),
});

export const step7Schema = z.object({
  totalArea: z.number().min(0).optional(),
  productSubtotal: z.number().min(0).optional(),
  accessoriesPackingFee: z.number().min(0).optional(),
  shippingCost: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  grandTotal: z.number().min(0).optional(),
});

export const step8Schema = z.object({
  termsAndConditions: z.string().optional(),
  notes: z.string().optional(),
  tbcSummary: z.string().optional(),
});

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;
export type Step5Data = z.infer<typeof step5Schema>;
export type Step6Data = z.infer<typeof step6Schema>;
export type Step7Data = z.infer<typeof step7Schema>;
export type Step8Data = z.infer<typeof step8Schema>;

export interface QuotationFormData
  extends Step1Data,
    Step2Data,
    Step3Data,
    Step4Data,
    Step5Data,
    Step6Data,
    Step7Data,
    Step8Data {}
