import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dbToExportData } from "@/lib/quotation-mapper";
import { generateQuotationHTML } from "@/templates/pdf/quotation-template";
import { chromium } from "playwright";
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

  let browser;
  try {
    const data = dbToExportData(quotation);

    const [companyInfo, bankAccount] = await Promise.all([
      prisma.companyInfo.findFirst({ orderBy: { createdAt: "desc" } }),
      prisma.bankAccount.findFirst({
        where: { isDefault: true },
        orderBy: { createdAt: "desc" },
      }) || prisma.bankAccount.findFirst({ orderBy: { createdAt: "desc" } }),
    ]);

    const html = generateQuotationHTML(data, companyInfo, bankAccount);

    browser = await chromium.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "18mm", right: "16mm", bottom: "22mm", left: "16mm" },
    });

    await browser.close();

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${quotation.quoteNo}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF export error:", error);
    if (browser) await browser.close();
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
