import type { Quotation, QuotationItem, QuotationItemImage } from "@/generated/prisma/client";

interface QuotationWithItems extends Quotation {
  items: (QuotationItem & { images: QuotationItemImage[] })[];
}

function toNum(value: unknown): number | undefined {
  if (value == null) return undefined;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (typeof value === "object" && "toNumber" in (value as object)) {
    return (value as { toNumber: () => number }).toNumber();
  }
  return Number(value);
}

export function dbToExportData(quotation: QuotationWithItems) {
  return {
    step1: {
      clientName: quotation.clientName,
      companyName: quotation.companyName || undefined,
      country: quotation.country,
      city: quotation.city || undefined,
      clientEmail: quotation.clientEmail || undefined,
      clientWhatsapp: quotation.clientWhatsapp || undefined,
      clientType: quotation.clientType || undefined,
      leadSource: quotation.leadSource || undefined,
    },
    step2: {
      projectName: quotation.projectName,
      projectAddress: quotation.projectAddress || undefined,
      projectType: quotation.projectType || undefined,
      projectStage: quotation.projectStage || undefined,
      hasDrawings: quotation.hasDrawings,
      expectedPurchaseTime: quotation.expectedPurchaseTime || undefined,
    },
    step3: {
      quoteDate: quotation.quoteDate,
      quoteValidity: quotation.quoteValidity || undefined,
      currency: quotation.currency || undefined,
      tradeTerm: quotation.tradeTerm || undefined,
      productionLeadTime: quotation.productionLeadTime || undefined,
      paymentTerm: quotation.paymentTerm || undefined,
    },
    step4: {
      profileSeries: quotation.profileSeries || undefined,
      frameColor: quotation.frameColor || undefined,
      surfaceTreatment: quotation.surfaceTreatment || undefined,
      glassSpecification: quotation.glassSpecification || undefined,
      hardwareBrand: quotation.hardwareBrand || undefined,
      screenType: quotation.screenType || undefined,
      installationMethod: quotation.installationMethod || undefined,
      certifications: quotation.certifications || [],
    },
    step5: {
      items: quotation.items.map((item) => ({
        id: item.id,
        itemNo: item.itemNo,
        windowDoorId: item.windowDoorId || undefined,
        productType: item.productType,
        width: item.width || undefined,
        height: item.height || undefined,
        quantity: item.quantity,
        area: toNum(item.area),
        finalUnitPrice: toNum(item.finalUnitPrice),
        finalAmount: toNum(item.finalAmount),
        openingWay: item.openingWay || undefined,
        notes: item.notes || undefined,
      })),
    },
    step6: {
      itemImages: quotation.items.flatMap((item) =>
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
      totalArea: toNum(quotation.totalArea),
      productSubtotal: toNum(quotation.productSubtotal),
      accessoriesPackingFee: toNum(quotation.accessoriesPackingFee),
      shippingCost: toNum(quotation.shippingCost),
      discount: toNum(quotation.discount),
      grandTotal: toNum(quotation.grandTotal),
    },
    step8: {
      termsAndConditions: quotation.termsAndConditions || undefined,
      notes: quotation.notes || undefined,
      tbcSummary: quotation.tbcSummary || undefined,
    },
  };
}
