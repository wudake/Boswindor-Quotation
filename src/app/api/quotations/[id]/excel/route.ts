import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dbToExportData } from "@/lib/quotation-mapper";
import { generateQuotationExcel } from "@/templates/excel/quotation-template";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  if (session.user.role !== "ADMIN" && quotation.createdById !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = dbToExportData(quotation);

    const [companyInfo, bankAccount] = await Promise.all([
      prisma.companyInfo.findFirst({ orderBy: { createdAt: "desc" } }),
      prisma.bankAccount.findFirst({
        where: { isDefault: true },
        orderBy: { createdAt: "desc" },
      }) || prisma.bankAccount.findFirst({ orderBy: { createdAt: "desc" } }),
    ]);

    const buffer = await generateQuotationExcel(data, companyInfo, bankAccount);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${quotation.quoteNo}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Excel export error:", error);
    return NextResponse.json(
      { error: "Failed to generate Excel" },
      { status: 500 }
    );
  }
}
