import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { dbToExportData } from "@/lib/quotation-mapper";
import { generateQuotationHTML } from "@/templates/pdf/quotation-template";
import { chromium } from "playwright";
import fs from "fs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const quotation = await prisma.quotation.findFirst({
    where: { quoteNo: "BW-Q-20260513-001" },
    include: {
      items: {
        include: { images: true },
        orderBy: { itemNo: "asc" },
      },
    },
  });

  if (!quotation) throw new Error("Quotation not found");

  const [companyInfo, bankAccount] = await Promise.all([
    prisma.companyInfo.findFirst({ orderBy: { createdAt: "desc" } }),
    prisma.bankAccount.findFirst({ where: { isDefault: true }, orderBy: { createdAt: "desc" } }),
  ]);

  const data = dbToExportData(quotation);
  const html = generateQuotationHTML(data, companyInfo, bankAccount);

  fs.writeFileSync("/tmp/quotation-preview.html", html);

  const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle" });
  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "18mm", right: "16mm", bottom: "22mm", left: "16mm" },
  });
  await browser.close();

  fs.writeFileSync("/tmp/Boswindor_Quotation_BW-Q-20260513-001.pdf", new Uint8Array(pdfBuffer));
  console.log("PDF generated: /tmp/Boswindor_Quotation_BW-Q-20260513-001.pdf");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
