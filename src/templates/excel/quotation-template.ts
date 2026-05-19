import ExcelJS from "exceljs";
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

interface QuotationData {
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
  step4: Step4Data;
  step5: Step5Data;
  step6: Step6Data;
  step7: Step7Data;
  step8: Step8Data;
}

const THEME = {
  primary: "1E3A5F",
  primaryLight: "D6E4F0",
  accent: "C9A227",
  text: "333333",
  textLight: "666666",
  border: "B4C6D4",
  white: "FFFFFF",
  red: "C0392B",
};

function styleHeaderCell(cell: ExcelJS.Cell) {
  cell.font = { bold: true, color: { argb: THEME.white }, size: 11 };
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: THEME.primary },
  };
  cell.alignment = { horizontal: "center", vertical: "middle" };
  cell.border = {
    top: { style: "thin", color: { argb: THEME.border } },
    bottom: { style: "thin", color: { argb: THEME.border } },
    left: { style: "thin", color: { argb: THEME.border } },
    right: { style: "thin", color: { argb: THEME.border } },
  };
}

function styleDataCell(cell: ExcelJS.Cell, opts?: { bold?: boolean; align?: "left" | "right" | "center"; color?: string }) {
  cell.font = { color: { argb: opts?.color || THEME.text }, size: 10, bold: opts?.bold || false };
  cell.alignment = { horizontal: opts?.align || "left", vertical: "middle", wrapText: true };
  cell.border = {
    top: { style: "thin", color: { argb: THEME.border } },
    bottom: { style: "thin", color: { argb: THEME.border } },
    left: { style: "thin", color: { argb: THEME.border } },
    right: { style: "thin", color: { argb: THEME.border } },
  };
}

function styleLabelCell(cell: ExcelJS.Cell) {
  cell.font = { bold: true, color: { argb: THEME.textLight }, size: 10 };
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F5F7FA" } };
  cell.alignment = { horizontal: "left", vertical: "middle" };
  cell.border = {
    top: { style: "thin", color: { argb: THEME.border } },
    bottom: { style: "thin", color: { argb: THEME.border } },
    left: { style: "thin", color: { argb: THEME.border } },
    right: { style: "thin", color: { argb: THEME.border } },
  };
}

function styleSectionTitle(ws: ExcelJS.Worksheet, row: number, text: string, colCount: number) {
  ws.mergeCells(row, 1, row, colCount);
  const cell = ws.getCell(row, 1);
  cell.value = text;
  cell.font = { bold: true, color: { argb: THEME.white }, size: 12 };
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: THEME.primary } };
  cell.alignment = { horizontal: "left", vertical: "middle" };
  cell.border = {
    top: { style: "thin", color: { argb: THEME.border } },
    bottom: { style: "thin", color: { argb: THEME.border } },
    left: { style: "thin", color: { argb: THEME.border } },
    right: { style: "thin", color: { argb: THEME.border } },
  };
  ws.getRow(row).height = 28;
}

interface CompanyInfoData {
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
}

interface BankAccountData {
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftCode?: string | null;
  bankAddress?: string | null;
  notes?: string | null;
}

export async function generateQuotationExcel(
  data: QuotationData,
  companyInfo?: CompanyInfoData | null,
  bankAccount?: BankAccountData | null
): Promise<Buffer> {
  const { step1, step2, step3, step4, step5, step6, step7, step8 } = data;
  const companyName = companyInfo?.name || "BOSWINDOR";
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet("Quotation Proposal");

  // Column widths
  ws.columns = [
    { width: 14 },
    { width: 22 },
    { width: 14 },
    { width: 22 },
    { width: 14 },
    { width: 14 },
    { width: 14 },
    { width: 16 },
  ];

  let row = 1;

  // === 1. TITLE / COVER ===
  ws.mergeCells(row, 1, row, 8);
  const titleCell = ws.getCell(row, 1);
  titleCell.value = companyName;
  titleCell.font = { size: 24, bold: true, color: { argb: THEME.primary } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(row).height = 40;
  row++;

  ws.mergeCells(row, 1, row, 8);
  const subTitleCell = ws.getCell(row, 1);
  subTitleCell.value = "PROJECT QUOTATION PROPOSAL";
  subTitleCell.font = { size: 14, bold: true, color: { argb: THEME.accent } };
  subTitleCell.alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(row).height = 28;
  row++;

  ws.mergeCells(row, 1, row, 8);
  const dateCell = ws.getCell(row, 1);
  dateCell.value = `Date: ${step3.quoteDate ? new Date(step3.quoteDate).toLocaleDateString("en-GB") : ""}`;
  dateCell.font = { size: 10, color: { argb: THEME.textLight } };
  dateCell.alignment = { horizontal: "center", vertical: "middle" };
  row += 2;

  // === 2. CLIENT & PROJECT INFO ===
  styleSectionTitle(ws, row, "CLIENT & PROJECT INFORMATION", 8);
  row++;

  const infoRows = [
    ["Client Name", step1.clientName, "Project Name", step2.projectName],
    ["Company", step1.companyName || "-", "Project Address", step2.projectAddress || "-"],
    ["Country", step1.country, "Project Type", step2.projectType || "-"],
    ["City", step1.city || "-", "Project Stage", step2.projectStage || "-"],
    ["Email", step1.clientEmail || "-", "Has Drawings", step2.hasDrawings ? "Yes" : "No"],
    ["WhatsApp", step1.clientWhatsapp || "-", "Purchase Time", step2.expectedPurchaseTime || "-"],
    ["Client Type", step1.clientType || "-", "Lead Source", step1.leadSource || "-"],
  ];

  for (const r of infoRows) {
    for (let c = 0; c < 4; c++) {
      const cell = ws.getCell(row, c + 1);
      cell.value = r[c];
      if (c % 2 === 0) styleLabelCell(cell);
      else styleDataCell(cell);
    }
    ws.mergeCells(row, 2, row, 2);
    ws.mergeCells(row, 4, row, 4);
    row++;
  }
  row++;

  // === 3. QUOTATION SETTINGS ===
  styleSectionTitle(ws, row, "QUOTATION SETTINGS", 8);
  row++;

  const settingRows = [
    ["Quote Validity", step3.quoteValidity || "-", "Currency", step3.currency || "-"],
    ["Trade Term", step3.tradeTerm || "-", "Production Lead Time", step3.productionLeadTime || "-"],
    ["Payment Term", step3.paymentTerm || "-", "", ""],
  ];

  for (const r of settingRows) {
    for (let c = 0; c < 4; c++) {
      const cell = ws.getCell(row, c + 1);
      cell.value = r[c];
      if (c % 2 === 0) styleLabelCell(cell);
      else styleDataCell(cell);
    }
    ws.mergeCells(row, 2, row, 2);
    ws.mergeCells(row, 4, row, 4);
    row++;
  }
  row++;

  // === 4. SPECIFICATION ===
  styleSectionTitle(ws, row, "SPECIFICATION DETAIL", 8);
  row++;

  const specRows = [
    ["Profile Series", step4.profileSeries || "-", "Frame Color", step4.frameColor || "-"],
    ["Surface Treatment", step4.surfaceTreatment || "-", "Hardware Brand", step4.hardwareBrand || "-"],
    ["Screen Type", step4.screenType || "-", "Installation Method", step4.installationMethod || "-"],
  ];

  for (const r of specRows) {
    for (let c = 0; c < 4; c++) {
      const cell = ws.getCell(row, c + 1);
      cell.value = r[c];
      if (c % 2 === 0) styleLabelCell(cell);
      else styleDataCell(cell);
    }
    ws.mergeCells(row, 2, row, 2);
    ws.mergeCells(row, 4, row, 4);
    row++;
  }

  // Glass specification (full width)
  ws.mergeCells(row, 1, row, 1);
  const glassLabel = ws.getCell(row, 1);
  glassLabel.value = "Glass Specification";
  styleLabelCell(glassLabel);
  ws.mergeCells(row, 2, row, 8);
  const glassVal = ws.getCell(row, 2);
  glassVal.value = step4.glassSpecification || "-";
  styleDataCell(glassVal);
  row++;

  // Certifications
  ws.mergeCells(row, 1, row, 1);
  const certLabel = ws.getCell(row, 1);
  certLabel.value = "Certifications";
  styleLabelCell(certLabel);
  ws.mergeCells(row, 2, row, 8);
  const certVal = ws.getCell(row, 2);
  certVal.value = (step4.certifications || []).join(", ") || "-";
  styleDataCell(certVal);
  row += 2;

  // === 5. PRODUCT ITEMS ===
  styleSectionTitle(ws, row, "PRODUCT SCHEDULE", 8);
  row++;

  const itemHeaders = ["Item No.", "Window/Door ID", "Product Type", "Width (mm)", "Height (mm)", "Qty", "Area (m²)", "Unit Price", "Amount"];
  for (let c = 0; c < itemHeaders.length; c++) {
    const cell = ws.getCell(row, c + 1);
    cell.value = itemHeaders[c];
    styleHeaderCell(cell);
  }
  row++;

  for (const item of step5.items) {
    const cells = [
      item.itemNo,
      item.windowDoorId || "-",
      item.productType,
      item.width || "-",
      item.height || "-",
      item.quantity,
      item.area ? Number(item.area).toFixed(4) : "-",
      item.finalUnitPrice ? Number(item.finalUnitPrice).toFixed(2) : "-",
      item.finalAmount ? Number(item.finalAmount).toFixed(2) : "-",
    ];
    for (let c = 0; c < cells.length; c++) {
      const cell = ws.getCell(row, c + 1);
      cell.value = cells[c];
      styleDataCell(cell, { align: c >= 3 ? "right" : "left" });
    }
    row++;
  }
  row++;

  // === 6. PRICE SUMMARY ===
  styleSectionTitle(ws, row, "PRICE SUMMARY", 8);
  row++;

  const summaryRows = [
    ["Total Area", `${step7.totalArea ? Number(step7.totalArea).toFixed(4) : "0.0000"} m²`],
    ["Product Subtotal", `${step3.currency || ""} ${step7.productSubtotal ? Number(step7.productSubtotal).toFixed(2) : "0.00"}`],
    ["Accessories / Packing Fee", `${step3.currency || ""} ${step7.accessoriesPackingFee ? Number(step7.accessoriesPackingFee).toFixed(2) : "0.00"}`],
    ["Shipping Cost", `${step3.currency || ""} ${step7.shippingCost ? Number(step7.shippingCost).toFixed(2) : "0.00"}`],
    ["Discount", `${step3.currency || ""} -${step7.discount ? Number(step7.discount).toFixed(2) : "0.00"}`],
  ];

  for (const r of summaryRows) {
    ws.mergeCells(row, 1, row, 5);
    const labelCell = ws.getCell(row, 1);
    labelCell.value = r[0];
    styleLabelCell(labelCell);
    ws.mergeCells(row, 6, row, 9);
    const valCell = ws.getCell(row, 6);
    valCell.value = r[1];
    styleDataCell(valCell, { align: "right" });
    row++;
  }

  // Grand Total
  ws.mergeCells(row, 1, row, 5);
  const totalLabel = ws.getCell(row, 1);
  totalLabel.value = "GRAND TOTAL";
  totalLabel.font = { bold: true, color: { argb: THEME.white }, size: 12 };
  totalLabel.fill = { type: "pattern", pattern: "solid", fgColor: { argb: THEME.accent } };
  totalLabel.alignment = { horizontal: "left", vertical: "middle" };
  totalLabel.border = {
    top: { style: "medium", color: { argb: THEME.border } },
    bottom: { style: "medium", color: { argb: THEME.border } },
    left: { style: "medium", color: { argb: THEME.border } },
    right: { style: "medium", color: { argb: THEME.border } },
  };
  ws.mergeCells(row, 6, row, 9);
  const totalVal = ws.getCell(row, 6);
  totalVal.value = `${step3.currency || ""} ${step7.grandTotal ? Number(step7.grandTotal).toFixed(2) : "0.00"}`;
  totalVal.font = { bold: true, color: { argb: THEME.white }, size: 12 };
  totalVal.fill = { type: "pattern", pattern: "solid", fgColor: { argb: THEME.accent } };
  totalVal.alignment = { horizontal: "right", vertical: "middle" };
  totalVal.border = {
    top: { style: "medium", color: { argb: THEME.border } },
    bottom: { style: "medium", color: { argb: THEME.border } },
    left: { style: "medium", color: { argb: THEME.border } },
    right: { style: "medium", color: { argb: THEME.border } },
  };
  ws.getRow(row).height = 32;
  row += 2;

  // === 7. NOTES & TBC ITEMS ===
  styleSectionTitle(ws, row, "NOTES & TBC ITEMS", 8);
  row++;

  const tbcImages = (step6.itemImages || []).filter((img) => img.isTbc);
  if (tbcImages.length > 0) {
    for (const img of tbcImages) {
      ws.mergeCells(row, 1, row, 8);
      const cell = ws.getCell(row, 1);
      cell.value = `TBC: ${img.tbcNotes || img.description || "Pending confirmation"}`;
      cell.font = { color: { argb: THEME.red }, size: 10 };
      cell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
      row++;
    }
  } else {
    ws.mergeCells(row, 1, row, 8);
    const cell = ws.getCell(row, 1);
    cell.value = "No TBC items.";
    cell.font = { italic: true, color: { argb: THEME.textLight }, size: 10 };
    row++;
  }

  if (step8.notes) {
    ws.mergeCells(row, 1, row, 8);
    const cell = ws.getCell(row, 1);
    cell.value = `Notes: ${step8.notes}`;
    cell.font = { size: 10 };
    cell.alignment = { wrapText: true };
    row++;
  }
  row++;

  // === 8. TERMS & CONDITIONS ===
  styleSectionTitle(ws, row, "TERMS & CONDITIONS", 8);
  row++;

  ws.mergeCells(row, 1, row, 8);
  const termsCell = ws.getCell(row, 1);
  termsCell.value = step8.termsAndConditions ||
    `1. This quotation is valid for ${step3.quoteValidity || "30 days"} from the date of issue.\n` +
    `2. Payment terms: ${step3.paymentTerm || "50% deposit + 50% balance"}.\n` +
    `3. Production lead time: ${step3.productionLeadTime || "5-7 weeks"} after deposit received.\n` +
    `4. Prices are based on ${step3.tradeTerm || "EXW"} terms.\n` +
    `5. All dimensions and specifications must be confirmed before production.`;
  termsCell.font = { size: 10 };
  termsCell.alignment = { vertical: "top", wrapText: true };
  ws.getRow(row).height = 100;
  row += 2;

  // === 9. BANK INFORMATION ===
  styleSectionTitle(ws, row, "BANK ACCOUNT INFORMATION", 8);
  row++;

  if (bankAccount) {
    const bankRows = [
      ["Bank Name", bankAccount.bankName],
      ["Account Name", bankAccount.accountName],
      ["Account Number", bankAccount.accountNumber],
      ["SWIFT Code", bankAccount.swiftCode || "-"],
      ["Bank Address", bankAccount.bankAddress || "-"],
      ["Notes", bankAccount.notes || "-"],
    ];
    for (const r of bankRows) {
      ws.mergeCells(row, 1, row, 2);
      const labelCell = ws.getCell(row, 1);
      labelCell.value = r[0];
      styleLabelCell(labelCell);
      ws.mergeCells(row, 3, row, 8);
      const valCell = ws.getCell(row, 3);
      valCell.value = r[1];
      styleDataCell(valCell);
      row++;
    }
  } else {
    ws.mergeCells(row, 1, row, 8);
    const bankCell = ws.getCell(row, 1);
    bankCell.value = `Please contact ${companyName} sales team for bank details.`;
    bankCell.font = { size: 10, color: { argb: THEME.red } };
    bankCell.alignment = { horizontal: "center", vertical: "middle" };
    row++;
  }
  row++;

  // === 10. ACCEPTANCE ===
  styleSectionTitle(ws, row, "ACCEPTANCE / CONFIRMATION", 8);
  row++;

  ws.mergeCells(row, 1, row, 4);
  const signLabel1 = ws.getCell(row, 1);
  signLabel1.value = "Client Signature:";
  styleLabelCell(signLabel1);

  ws.mergeCells(row, 5, row, 8);
  const signVal1 = ws.getCell(row, 5);
  signVal1.value = "";
  styleDataCell(signVal1);
  ws.getRow(row).height = 40;
  row++;

  ws.mergeCells(row, 1, row, 4);
  const signLabel2 = ws.getCell(row, 1);
  signLabel2.value = "Date:";
  styleLabelCell(signLabel2);

  ws.mergeCells(row, 5, row, 8);
  const signVal2 = ws.getCell(row, 5);
  signVal2.value = "";
  styleDataCell(signVal2);
  row++;

  ws.mergeCells(row, 1, row, 8);
  const footerCell = ws.getCell(row, 1);
  footerCell.value = `Thank you for choosing ${companyName}. We look forward to working with you.`;
  footerCell.font = { italic: true, color: { argb: THEME.textLight }, size: 10 };
  footerCell.alignment = { horizontal: "center", vertical: "middle" };
  row++;

  // Freeze panes for product schedule
  ws.views = [{ state: "frozen", xSplit: 0, ySplit: 0 }];

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
