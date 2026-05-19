import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const quotation = await prisma.quotation.findUnique({
    where: { id },
    include: {
      items: {
        include: { images: true },
        orderBy: { itemNo: "asc" },
      },
    },
  });

  if (!quotation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Authorization check
  if (session.user.role !== "ADMIN" && quotation.createdById !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(quotation);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.quotation.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (session.user.role !== "ADMIN" && existing.createdById !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const quotation = await prisma.quotation.update({
    where: { id },
    data: {
      status: body.status,
      clientName: body.clientName,
      companyName: body.companyName,
      country: body.country,
      city: body.city,
      clientEmail: body.clientEmail,
      clientWhatsapp: body.clientWhatsapp,
      clientType: body.clientType,
      leadSource: body.leadSource,
      projectName: body.projectName,
      projectAddress: body.projectAddress,
      projectType: body.projectType,
      projectStage: body.projectStage,
      hasDrawings: body.hasDrawings,
      expectedPurchaseTime: body.expectedPurchaseTime,
      quoteDate: body.quoteDate ? new Date(body.quoteDate) : undefined,
      quoteValidity: body.quoteValidity,
      currency: body.currency,
      tradeTerm: body.tradeTerm,
      productionLeadTime: body.productionLeadTime,
      paymentTerm: body.paymentTerm,
      profileSeries: body.profileSeries,
      frameColor: body.frameColor,
      surfaceTreatment: body.surfaceTreatment,
      glassSpecification: body.glassSpecification,
      hardwareBrand: body.hardwareBrand,
      screenType: body.screenType,
      installationMethod: body.installationMethod,
      certifications: body.certifications,
      totalArea: body.totalArea,
      productSubtotal: body.productSubtotal,
      accessoriesPackingFee: body.accessoriesPackingFee,
      shippingCost: body.shippingCost,
      discount: body.discount,
      grandTotal: body.grandTotal,
      termsAndConditions: body.termsAndConditions,
      notes: body.notes,
      tbcSummary: body.tbcSummary,
    },
  });

  return NextResponse.json(quotation);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const existing = await prisma.quotation.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (session.user.role !== "ADMIN" && existing.createdById !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.quotation.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
