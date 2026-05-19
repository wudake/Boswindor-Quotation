import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateQuotationHTML } from "@/templates/pdf/quotation-template";
import { chromium } from "playwright";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let browser;
  try {
    const data = await request.json();

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
        "Content-Disposition": `attachment; filename="Boswindor_Quotation_${data.step1.clientName}_${data.step2.projectName}_${new Date().toISOString().slice(0, 10)}.pdf"`,
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
