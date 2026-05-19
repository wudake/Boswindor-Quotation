import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateQuoteNumber } from "@/lib/quote-number";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const where = session.user.role === "ADMIN" ? {} : { createdById: session.user.id };

  const quotations = await prisma.quotation.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { items: true } },
    },
  });

  return NextResponse.json(quotations);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { step1, step2, step3, step4, step5, step6, step7, step8 } = body;

  try {
    const quoteNo = await generateQuoteNumber();

    const quotation = await prisma.$transaction(async (tx) => {
      // 1. Create quotation main record
      const q = await tx.quotation.create({
        data: {
          quoteNo,
          status: "GENERATED",
          clientName: step1.clientName,
          companyName: step1.companyName || null,
          country: step1.country,
          city: step1.city || null,
          clientEmail: step1.clientEmail || null,
          clientWhatsapp: step1.clientWhatsapp || null,
          clientType: step1.clientType || null,
          leadSource: step1.leadSource || null,
          projectName: step2.projectName,
          projectAddress: step2.projectAddress || null,
          projectType: step2.projectType || null,
          projectStage: step2.projectStage || null,
          hasDrawings: step2.hasDrawings || false,
          expectedPurchaseTime: step2.expectedPurchaseTime || null,
          quoteDate: step3.quoteDate ? new Date(step3.quoteDate) : new Date(),
          quoteValidity: step3.quoteValidity || null,
          currency: step3.currency || "USD",
          tradeTerm: step3.tradeTerm || "EXW",
          productionLeadTime: step3.productionLeadTime || null,
          paymentTerm: step3.paymentTerm || null,
          profileSeries: step4.profileSeries || null,
          frameColor: step4.frameColor || null,
          surfaceTreatment: step4.surfaceTreatment || null,
          glassSpecification: step4.glassSpecification || null,
          hardwareBrand: step4.hardwareBrand || null,
          screenType: step4.screenType || null,
          installationMethod: step4.installationMethod || null,
          certifications: step4.certifications || [],
          totalArea: step7.totalArea || 0,
          productSubtotal: step7.productSubtotal || 0,
          accessoriesPackingFee: step7.accessoriesPackingFee || 0,
          shippingCost: step7.shippingCost || 0,
          discount: step7.discount || 0,
          grandTotal: step7.grandTotal || 0,
          termsAndConditions: step8.termsAndConditions || null,
          notes: step8.notes || null,
          tbcSummary: step8.tbcSummary || null,
          createdById: session.user.id,
        },
      });

      // 2. Create items
      for (const item of step5.items || []) {
        await tx.quotationItem.create({
          data: {
            quotationId: q.id,
            itemNo: item.itemNo || 1,
            windowDoorId: item.windowDoorId || null,
            productType: item.productType,
            width: item.width || null,
            height: item.height || null,
            quantity: item.quantity || 1,
            area: item.area || null,
            finalUnitPrice: item.finalUnitPrice || null,
            finalAmount: item.finalAmount || null,
            openingWay: item.openingWay || null,
            notes: item.notes || null,
          },
        });
      }

      // 3. Create images (match by itemNo since quotationItemId is String(item.itemNo))
      const createdItems = await tx.quotationItem.findMany({
        where: { quotationId: q.id },
        select: { id: true, itemNo: true },
      });
      const itemNoToId = new Map(createdItems.map((i) => [i.itemNo, i.id]));

      for (const img of step6.itemImages || []) {
        const itemNo = parseInt(img.quotationItemId, 10);
        const itemId = itemNoToId.get(itemNo);
        if (itemId) {
          await tx.quotationItemImage.create({
            data: {
              quotationItemId: itemId,
              filePath: img.filePath,
              description: img.description || null,
              isTbc: img.isTbc || false,
              tbcNotes: img.tbcNotes || null,
              sortOrder: img.sortOrder || 0,
            },
          });
        }
      }

      return q;
    });

    return NextResponse.json(quotation, { status: 201 });
  } catch (error) {
    console.error("Save quotation error:", error);
    return NextResponse.json(
      { error: "Failed to save quotation" },
      { status: 500 }
    );
  }
}
