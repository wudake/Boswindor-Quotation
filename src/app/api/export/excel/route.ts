import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateQuotationExcel } from "@/templates/excel/quotation-template";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();

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
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Boswindor_Quotation_${data.step1.clientName}_${data.step2.projectName}_${new Date().toISOString().slice(0, 10)}.xlsx"`,
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
