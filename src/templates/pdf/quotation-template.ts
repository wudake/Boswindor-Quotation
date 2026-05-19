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

interface CompanyInfoData {
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  certificationsText?: string | null;
}

interface BankAccountData {
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftCode?: string | null;
  bankAddress?: string | null;
  notes?: string | null;
}

export function generateQuotationHTML(
  data: QuotationData,
  companyInfo?: CompanyInfoData | null,
  bankAccount?: BankAccountData | null
): string {
  const { step1, step2, step3, step4, step5, step6, step7, step8 } = data;
  const currency = step3.currency || "USD";
  const quoteDate = step3.quoteDate
    ? new Date(step3.quoteDate).toLocaleDateString("en-GB")
    : "";

  const companyName = companyInfo?.name || "BOSWINDOR";
  const companyLogoHtml = companyInfo?.logoUrl
    ? `<img src="${companyInfo.logoUrl}" alt="${companyName}" style="max-height:36px;" />`
    : companyName;

  const bankInfoHtml = bankAccount
    ? `<div class="info-grid" style="max-width:600px;margin:0 auto;text-align:left;">
        <div class="info-row"><span class="label">Bank Name:</span> <span class="value">${bankAccount.bankName}</span></div>
        <div class="info-row"><span class="label">Account Name:</span> <span class="value">${bankAccount.accountName}</span></div>
        <div class="info-row"><span class="label">Account Number:</span> <span class="value">${bankAccount.accountNumber}</span></div>
        ${bankAccount.swiftCode ? `<div class="info-row"><span class="label">SWIFT Code:</span> <span class="value">${bankAccount.swiftCode}</span></div>` : ""}
        ${bankAccount.bankAddress ? `<div class="info-row"><span class="label">Bank Address:</span> <span class="value">${bankAccount.bankAddress}</span></div>` : ""}
        ${bankAccount.notes ? `<div class="info-row"><span class="label">Notes:</span> <span class="value">${bankAccount.notes}</span></div>` : ""}
       </div>`
    : `<div class="bank-box">
        <strong>Important:</strong> Please contact your Boswindor sales representative for official bank account details.<br/>
        Do not transfer funds to any account not verified by your sales contact.
       </div>`;

  const companyFooterHtml = companyInfo
    ? `<div style="margin-top:10px;font-size:9pt;color:#555;">
        ${companyInfo.address ? `${companyInfo.address} | ` : ""}
        ${companyInfo.phone ? `Tel: ${companyInfo.phone} | ` : ""}
        ${companyInfo.email ? `Email: ${companyInfo.email} | ` : ""}
        ${companyInfo.website || ""}
       </div>`
    : "";

  const itemsHtml = step5.items
    .map(
      (item) => `
    <tr>
      <td>${item.itemNo}</td>
      <td>${item.windowDoorId || "-"}</td>
      <td>${item.productType}</td>
      <td>${item.width || "-"}</td>
      <td>${item.height || "-"}</td>
      <td>${item.quantity}</td>
      <td>${item.area ? Number(item.area).toFixed(4) : "-"}</td>
      <td>${item.finalUnitPrice ? Number(item.finalUnitPrice).toFixed(2) : "-"}</td>
      <td>${item.finalAmount ? Number(item.finalAmount).toFixed(2) : "-"}</td>
      <td>${item.openingWay || "-"}</td>
    </tr>
  `
    )
    .join("");

  const itemDetailPages = step5.items
    .map((item) => {
      const images = (step6.itemImages || []).filter(
        (img) => img.quotationItemId === (item.id || String(item.itemNo))
      );
      const imagesHtml = images.length
        ? images
            .map(
              (img) => `
          <div class="item-image-box">
            <img src="${img.filePath}" alt="${img.description || ""}" />
            ${img.description ? `<p class="img-desc">${img.description}</p>` : ""}
            ${img.isTbc ? `<p class="img-tbc">TBC: ${img.tbcNotes || "Pending confirmation"}</p>` : ""}
          </div>
        `
            )
            .join("")
        : `<p class="no-images">No images uploaded.</p>`;

      return `
      <div class="page item-detail-page">
        <div class="page-header">
          <div class="logo">${companyLogoHtml}</div>
          <div class="doc-title">PRODUCT ITEM DETAIL</div>
        </div>
        <div class="item-detail-content">
          <h2>${item.windowDoorId || `Item ${item.itemNo}`} — ${item.productType}</h2>
          <div class="item-specs">
            <div class="spec-row"><span>Width:</span> <strong>${item.width || "-"} mm</strong></div>
            <div class="spec-row"><span>Height:</span> <strong>${item.height || "-"} mm</strong></div>
            <div class="spec-row"><span>Quantity:</span> <strong>${item.quantity}</strong></div>
            <div class="spec-row"><span>Area:</span> <strong>${item.area ? Number(item.area).toFixed(4) : "-"} m²</strong></div>
            <div class="spec-row"><span>Opening Way:</span> <strong>${item.openingWay || "-"}</strong></div>
            <div class="spec-row"><span>Unit Price:</span> <strong>${currency} ${item.finalUnitPrice ? Number(item.finalUnitPrice).toFixed(2) : "-"}</strong></div>
            <div class="spec-row"><span>Amount:</span> <strong>${currency} ${item.finalAmount ? Number(item.finalAmount).toFixed(2) : "-"}</strong></div>
          </div>
          <div class="item-images">
            ${imagesHtml}
          </div>
          ${item.notes ? `<div class="item-notes"><strong>Notes:</strong> ${item.notes}</div>` : ""}
        </div>
        <div class="page-footer">${companyName} Quotation Proposal | Page <span class="pageNumber"></span></div>
      </div>
    `;
    })
    .join("");

  const tbcImages = (step6.itemImages || []).filter((img) => img.isTbc);
  const tbcHtml =
    tbcImages.length > 0
      ? tbcImages
          .map(
            (img) => `
        <div class="tbc-item">
          <span class="tbc-badge">TBC</span>
          <span class="tbc-text">${img.tbcNotes || img.description || "Pending confirmation"}</span>
        </div>
      `
          )
          .join("")
      : `<p class="no-tbc">No items pending confirmation.</p>`;

  const certifications = (step4.certifications || []).join(", ") || "-";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${companyName} Quotation</title>
  <style>
    @page { size: A4; margin: 18mm 16mm 22mm 16mm; }
    * { box-sizing: border-box; }
    body {
      font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.45;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .page {
      page-break-after: always;
      position: relative;
      min-height: 100vh;
      padding-bottom: 28px;
    }
    .page:last-child { page-break-after: auto; }
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #1E3A5F;
      padding-bottom: 10px;
      margin-bottom: 18px;
    }
    .logo {
      font-size: 22pt;
      font-weight: 800;
      color: #1E3A5F;
      letter-spacing: 1px;
    }
    .doc-title {
      font-size: 11pt;
      font-weight: 600;
      color: #C9A227;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .page-footer {
      position: fixed;
      bottom: 10mm;
      left: 16mm;
      right: 16mm;
      font-size: 8pt;
      color: #888;
      text-align: center;
      border-top: 1px solid #ddd;
      padding-top: 6px;
    }
    .cover-page {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      min-height: 80vh;
    }
    .cover-page .logo { font-size: 36pt; margin-bottom: 8px; }
    .cover-page .doc-title { font-size: 16pt; margin-bottom: 30px; }
    .cover-meta {
      margin-top: 40px;
      font-size: 11pt;
      color: #555;
    }
    .cover-meta p { margin: 6px 0; }
    h1 {
      font-size: 14pt;
      color: #1E3A5F;
      border-bottom: 1px solid #1E3A5F;
      padding-bottom: 6px;
      margin: 0 0 14px 0;
    }
    h2 {
      font-size: 12pt;
      color: #1E3A5F;
      margin: 16px 0 10px 0;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px 24px;
      margin-bottom: 14px;
    }
    .info-row { display: flex; }
    .info-row .label {
      min-width: 130px;
      color: #666;
      font-size: 9.5pt;
    }
    .info-row .value {
      font-weight: 600;
      color: #222;
      font-size: 9.5pt;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0 16px 0;
      font-size: 9pt;
    }
    th, td {
      border: 0.5px solid #B4C6D4;
      padding: 6px 8px;
      text-align: left;
    }
    th {
      background: #1E3A5F;
      color: #fff;
      font-weight: 600;
    }
    td { background: #fff; }
    tr:nth-child(even) td { background: #F5F7FA; }
    td.numeric, th.numeric { text-align: right; }
    .summary-table { max-width: 420px; margin-left: auto; }
    .summary-table td { border: 0.5px solid #B4C6D4; }
    .summary-table .total-row td {
      background: #C9A227;
      color: #fff;
      font-weight: 700;
      font-size: 11pt;
    }
    .tbc-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin: 8px 0;
      padding: 8px 10px;
      background: #FDF2F2;
      border-left: 3px solid #C0392B;
      border-radius: 3px;
    }
    .tbc-badge {
      background: #C0392B;
      color: #fff;
      font-size: 8pt;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 3px;
      white-space: nowrap;
    }
    .tbc-text { color: #C0392B; font-size: 9.5pt; }
    .terms-box {
      background: #F5F7FA;
      border: 0.5px solid #B4C6D4;
      padding: 14px;
      border-radius: 4px;
      white-space: pre-wrap;
      font-size: 9.5pt;
    }
    .bank-box {
      background: #FFF8E1;
      border: 1px solid #C9A227;
      padding: 14px;
      border-radius: 4px;
      text-align: center;
      font-size: 10pt;
      color: #856404;
    }
    .sign-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-top: 30px;
    }
    .sign-box {
      border-top: 1px solid #333;
      padding-top: 8px;
      font-size: 9pt;
      color: #555;
    }
    .item-detail-page h2 {
      font-size: 14pt;
      margin-bottom: 14px;
      border-bottom: 2px solid #1E3A5F;
      padding-bottom: 6px;
    }
    .item-specs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 20px;
      margin-bottom: 16px;
    }
    .spec-row { display: flex; font-size: 10pt; }
    .spec-row span { color: #666; min-width: 100px; }
    .spec-row strong { color: #222; }
    .item-images {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 12px;
      margin: 12px 0;
    }
    .item-image-box {
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 6px;
      text-align: center;
    }
    .item-image-box img {
      max-width: 100%;
      max-height: 160px;
      object-fit: cover;
      border-radius: 3px;
    }
    .img-desc { font-size: 8pt; color: #555; margin: 4px 0 0; }
    .img-tbc { font-size: 8pt; color: #C0392B; font-weight: 600; margin: 4px 0 0; }
    .no-images, .no-tbc { color: #888; font-style: italic; font-size: 9.5pt; }
    .item-notes { background: #F5F7FA; padding: 8px 10px; border-radius: 3px; margin-top: 10px; font-size: 9.5pt; }
  </style>
</head>
<body>

<!-- 1. COVER PAGE -->
<div class="page cover-page">
  <div class="logo">${companyLogoHtml}</div>
  <div class="doc-title">Project Quotation Proposal</div>
  <div class="cover-meta">
    <p><strong>Project:</strong> ${step2.projectName}</p>
    <p><strong>Client:</strong> ${step1.clientName}${step1.companyName ? ` (${step1.companyName})` : ""}</p>
    <p><strong>Country:</strong> ${step1.country}</p>
    <p><strong>Date:</strong> ${quoteDate}</p>
    <p><strong>Currency:</strong> ${currency}</p>
    <p><strong>Trade Term:</strong> ${step3.tradeTerm || "EXW"}</p>
  </div>
  <div class="page-footer">${companyName} Quotation Proposal | Page <span class="pageNumber"></span></div>
</div>

<!-- 2. CLIENT & PROJECT INFO -->
<div class="page">
  <div class="page-header">
    <div class="logo">${companyLogoHtml}</div>
    <div class="doc-title">Client & Project Information</div>
  </div>
  <h1>Client & Project Information</h1>
  <div class="info-grid">
    <div class="info-row"><span class="label">Client Name:</span> <span class="value">${step1.clientName}</span></div>
    <div class="info-row"><span class="label">Project Name:</span> <span class="value">${step2.projectName}</span></div>
    <div class="info-row"><span class="label">Company:</span> <span class="value">${step1.companyName || "-"}</span></div>
    <div class="info-row"><span class="label">Project Address:</span> <span class="value">${step2.projectAddress || "-"}</span></div>
    <div class="info-row"><span class="label">Country:</span> <span class="value">${step1.country}</span></div>
    <div class="info-row"><span class="label">Project Type:</span> <span class="value">${step2.projectType || "-"}</span></div>
    <div class="info-row"><span class="label">City:</span> <span class="value">${step1.city || "-"}</span></div>
    <div class="info-row"><span class="label">Project Stage:</span> <span class="value">${step2.projectStage || "-"}</span></div>
    <div class="info-row"><span class="label">Email:</span> <span class="value">${step1.clientEmail || "-"}</span></div>
    <div class="info-row"><span class="label">Has Drawings:</span> <span class="value">${step2.hasDrawings ? "Yes" : "No"}</span></div>
    <div class="info-row"><span class="label">WhatsApp:</span> <span class="value">${step1.clientWhatsapp || "-"}</span></div>
    <div class="info-row"><span class="label">Purchase Time:</span> <span class="value">${step2.expectedPurchaseTime || "-"}</span></div>
    <div class="info-row"><span class="label">Client Type:</span> <span class="value">${step1.clientType || "-"}</span></div>
    <div class="info-row"><span class="label">Lead Source:</span> <span class="value">${step1.leadSource || "-"}</span></div>
  </div>
  <div class="page-footer">${companyName} Quotation Proposal | Page <span class="pageNumber"></span></div>
</div>

<!-- 3. SPECIFICATION -->
<div class="page">
  <div class="page-header">
    <div class="logo">${companyLogoHtml}</div>
    <div class="doc-title">Specification Detail</div>
  </div>
  <h1>Specification Detail</h1>
  <div class="info-grid">
    <div class="info-row"><span class="label">Profile Series:</span> <span class="value">${step4.profileSeries || "-"}</span></div>
    <div class="info-row"><span class="label">Frame Color:</span> <span class="value">${step4.frameColor || "-"}</span></div>
    <div class="info-row"><span class="label">Surface Treatment:</span> <span class="value">${step4.surfaceTreatment || "-"}</span></div>
    <div class="info-row"><span class="label">Hardware Brand:</span> <span class="value">${step4.hardwareBrand || "-"}</span></div>
    <div class="info-row"><span class="label">Screen Type:</span> <span class="value">${step4.screenType || "-"}</span></div>
    <div class="info-row"><span class="label">Installation Method:</span> <span class="value">${step4.installationMethod || "-"}</span></div>
  </div>
  <h2>Glass Specification</h2>
  <p>${step4.glassSpecification || "-"}</p>
  <h2>Certifications</h2>
  <p>${certifications}</p>
  <div class="page-footer">${companyName} Quotation Proposal | Page <span class="pageNumber"></span></div>
</div>

<!-- 4. PRODUCT SCHEDULE -->
<div class="page">
  <div class="page-header">
    <div class="logo">${companyLogoHtml}</div>
    <div class="doc-title">Product Schedule</div>
  </div>
  <h1>Product Schedule</h1>
  <table>
    <thead>
      <tr>
        <th>No.</th>
        <th>ID</th>
        <th>Product Type</th>
        <th class="numeric">Width</th>
        <th class="numeric">Height</th>
        <th class="numeric">Qty</th>
        <th class="numeric">Area (m²)</th>
        <th class="numeric">Unit Price</th>
        <th class="numeric">Amount</th>
        <th>Opening</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>
  <div class="page-footer">${companyName} Quotation Proposal | Page <span class="pageNumber"></span></div>
</div>

<!-- 5. PRODUCT ITEM DETAILS -->
${itemDetailPages}

<!-- 6. PRICE SUMMARY -->
<div class="page">
  <div class="page-header">
    <div class="logo">${companyLogoHtml}</div>
    <div class="doc-title">Price Summary</div>
  </div>
  <h1>Price Summary</h1>
  <table class="summary-table">
    <tbody>
      <tr><td>Total Area</td><td class="numeric">${step7.totalArea ? Number(step7.totalArea).toFixed(4) : "0.0000"} m²</td></tr>
      <tr><td>Product Subtotal</td><td class="numeric">${currency} ${step7.productSubtotal ? Number(step7.productSubtotal).toFixed(2) : "0.00"}</td></tr>
      <tr><td>Accessories / Packing Fee</td><td class="numeric">${currency} ${step7.accessoriesPackingFee ? Number(step7.accessoriesPackingFee).toFixed(2) : "0.00"}</td></tr>
      <tr><td>Shipping Cost</td><td class="numeric">${currency} ${step7.shippingCost ? Number(step7.shippingCost).toFixed(2) : "0.00"}</td></tr>
      <tr><td>Discount</td><td class="numeric" style="color:#C0392B">-${currency} ${step7.discount ? Number(step7.discount).toFixed(2) : "0.00"}</td></tr>
      <tr class="total-row"><td>GRAND TOTAL</td><td class="numeric">${currency} ${step7.grandTotal ? Number(step7.grandTotal).toFixed(2) : "0.00"}</td></tr>
    </tbody>
  </table>
  <div class="page-footer">${companyName} Quotation Proposal | Page <span class="pageNumber"></span></div>
</div>

<!-- 7. NOTES & TBC -->
<div class="page">
  <div class="page-header">
    <div class="logo">${companyLogoHtml}</div>
    <div class="doc-title">Notes & TBC Items</div>
  </div>
  <h1>Notes & TBC Items</h1>
  <h2>TBC (To Be Confirmed)</h2>
  ${tbcHtml}
  ${step8.notes ? `<h2>Additional Notes</h2><p>${step8.notes}</p>` : ""}
  <div class="page-footer">${companyName} Quotation Proposal | Page <span class="pageNumber"></span></div>
</div>

<!-- 8. TERMS -->
<div class="page">
  <div class="page-header">
    <div class="logo">${companyLogoHtml}</div>
    <div class="doc-title">Terms & Conditions</div>
  </div>
  <h1>Terms & Conditions</h1>
  <div class="terms-box">${step8.termsAndConditions ||
    `1. This quotation is valid for ${step3.quoteValidity || "30 days"} from the date of issue.\n` +
    `2. Payment terms: ${step3.paymentTerm || "50% deposit + 50% balance"}.\n` +
    `3. Production lead time: ${step3.productionLeadTime || "5-7 weeks"} after deposit received.\n` +
    `4. Prices are based on ${step3.tradeTerm || "EXW"} terms.\n` +
    `5. All dimensions and specifications must be confirmed before production.`}</div>
  <div class="page-footer">${companyName} Quotation Proposal | Page <span class="pageNumber"></span></div>
</div>

<!-- 9. BANK INFO -->
<div class="page">
  <div class="page-header">
    <div class="logo">${companyLogoHtml}</div>
    <div class="doc-title">Bank Account Information</div>
  </div>
  <h1>Bank Account Information</h1>
  ${bankInfoHtml}
  <div class="page-footer">${companyName} Quotation Proposal | Page <span class="pageNumber"></span></div>
</div>

<!-- 10. ACCEPTANCE -->
<div class="page">
  <div class="page-header">
    <div class="logo">${companyLogoHtml}</div>
    <div class="doc-title">Acceptance / Confirmation</div>
  </div>
  <h1>Acceptance / Confirmation</h1>
  <p>By signing below, the client confirms acceptance of this quotation and agrees to the terms and conditions stated herein.</p>
  <div class="sign-grid">
    <div>
      <p><strong>Client:</strong></p>
      <div class="sign-box">Signature & Date</div>
    </div>
    <div>
      <p><strong>${companyName} Representative:</strong></p>
      <div class="sign-box">Signature & Date</div>
    </div>
  </div>
  <div class="page-footer">${companyName} Quotation Proposal | Page <span class="pageNumber"></span></div>
</div>

</body>
</html>`;
}
