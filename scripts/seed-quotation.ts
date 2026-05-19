import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: "admin@boswindor.com" } });
  if (!admin) throw new Error("Admin user not found");

  const bank = await prisma.bankAccount.findFirst({ where: { isDefault: true } });

  const quoteNo = `BW-Q-20260513-001`;

  const quotation = await prisma.quotation.create({
    data: {
      quoteNo,
      status: "GENERATED",
      clientName: "Sergej Stevanovic",
      companyName: "Sergej Stevanovic Pty Ltd",
      country: "Australia",
      city: "Sydney",
      clientEmail: "sergej@example.com",
      clientWhatsapp: "+61 412 345 678",
      clientType: "End Customer",
      leadSource: "Email Inquiry",
      projectName: "Sydney Rosebery Residence",
      projectAddress: "Sydney, Suburb Rosebery",
      projectType: "Residential",
      projectStage: "Design Phase",
      hasDrawings: true,
      expectedPurchaseTime: "Within 2 months",
      quoteDate: new Date("2026-05-13"),
      quoteValidity: "30 days",
      currency: "AUD",
      tradeTerm: "DDP",
      productionLeadTime: "35 Calendar Days",
      paymentTerm: "1. T/T with 100% Pre-payment for PO amount less than 5000 USD\n2. T/T with 50% deposit and balance before shipment for PO amount over 5000 USD",
      profileSeries: "AS118 / TM100 / YSH85B / 100 Series",
      frameColor: "Matt Black (Powder Coated)",
      surfaceTreatment: "Powder Coated",
      glassSpecification: "6mmLow-e + Argon gas + 6mm Double Clear / Laminated Tempered",
      hardwareBrand: "Cmech / Kinlong / Bonway / Custom",
      screenType: "Stainless Steel / Nylon",
      installationMethod: "Standard Installation",
      certifications: ["AS2047", "AS1288"],
      totalArea: 56.92,
      productSubtotal: 19508.53,
      accessoriesPackingFee: 2955.07,
      shippingCost: 2992.00,
      discount: 0,
      grandTotal: 25455.60,
      termsAndConditions: "1. The Aluminium profile color is Customized, all the handle and hinge color is Silver or Black, all the accessories are included;\n2. The production is based on the specification provided by customer;\n3. Standard Package: foam plastic inside and carton outside.\n4. Our doors and windows come with a standard warranty of 10 years. If any quality issues arise during this period, we will provide free replacements.\n5. All products comply with AS2047 and AS1288 certifications. If installation fails due to certification issues, resulting in acceptance testing failure, our company will refund the full amount.",
      notes: "Dear Customer, any change of our company bank account will be issued with our official document and informed by phone call. Please don't make payment to any other account without our confirmation. Thanks!",
      tbcSummary: "",
      createdById: admin.id,
      bankAccountId: bank?.id || null,
    },
  });

  const items = [
    { itemNo: 1, productType: "AS118 Series SLIDING WINDOW (With Bars)", width: 1800, height: 1200, quantity: 1, area: 2.160, finalUnitPrice: 747.08, finalAmount: 747.08, notes: "Thermal Break Aluminum 2.0mm, Matt Black. Glass: 6mmLow-e+16A Argon+5mm+0.76pvb+5mm Laminated. Flyscreen: Stainless Steel." },
    { itemNo: 2, productType: "AS118 Series SLIDING WINDOW (With Bars)", width: 1800, height: 1700, quantity: 2, area: 6.120, finalUnitPrice: 1058.36, finalAmount: 2116.72, notes: "Thermal Break Aluminum 2.0mm, Matt Black. Glass: 6mmLow-e+16A Argon+5mm+0.76pvb+5mm Laminated. Flyscreen: Stainless Steel." },
    { itemNo: 3, productType: "AS118 Series SLIDING WINDOW (With Bars)", width: 2400, height: 1400, quantity: 1, area: 3.360, finalUnitPrice: 1162.12, finalAmount: 1162.12, notes: "Thermal Break Aluminum 2.0mm, Matt Black. Glass: 6mmLow-e+16A Argon+5mm+0.76pvb+5mm Laminated. Flyscreen: Stainless Steel." },
    { itemNo: 4, productType: "TM100 Series FIXED WINDOW (With Bars)", width: 1800, height: 2400, quantity: 1, area: 4.320, finalUnitPrice: 686.19, finalAmount: 686.19, notes: "Aluminum 2.0mm, Matt Black. Glass: 6mmLow-e+12A Argon+6mm Double Clear Tempered. No Flyscreen." },
    { itemNo: 5, productType: "YSH85B Series SINGLE-HUNG WINDOW (With Bars)", width: 2095, height: 1600, quantity: 1, area: 3.352, finalUnitPrice: 1447.83, finalAmount: 1447.83, notes: "Aluminum 1.4mm, Matt Black. Hardware: Custom Brand. Glass: 6mmLow-e+10A Argon+6mm Double Clear Tempered. Flyscreen: Stainless Steel." },
    { itemNo: 6, productType: "TM100 Series SWING DOOR (With Bars)", width: 3395, height: 2400, quantity: 1, area: 8.148, finalUnitPrice: 2132.28, finalAmount: 2132.28, notes: "Aluminum 2.0mm, Matt Black. Hardware: Kinlong Brand. Glass: 6mmLow-e+13A Argon+6mm Double Clear Tempered. Flyscreen: Stainless Steel." },
    { itemNo: 7, productType: "100 Series SLIDING DOOR (With Bars)", width: 6150, height: 2400, quantity: 1, area: 14.760, finalUnitPrice: 3411.79, finalAmount: 3411.79, notes: "Aluminum 2.0mm, Matt Black. Hardware: Bonway Brand. Glass: 6mmLow-e+10A Argon+6mm Double Clear Tempered. Flyscreen: Stainless Steel." },
    { itemNo: 8, productType: "100 Series SKYLIGHT", width: 1500, height: 2000, quantity: 4, area: 12.000, finalUnitPrice: 1560.87, finalAmount: 6243.48, notes: "Aluminum 2.0mm, Matt Black. Hardware: Motorised Blind. Glass: 6mmLow-e+12A Argon+6mm+1.14pvb+6mm Laminated. Flyscreen: Nylon." },
    { itemNo: 9, productType: "100 Series SKYLIGHT", width: 900, height: 1500, quantity: 2, area: 2.700, finalUnitPrice: 780.52, finalAmount: 1561.04, notes: "Aluminum 2.0mm, Matt Black. Hardware: Motorised Blind. Glass: 6mmLow-e+12A Argon+6mm+1.14pvb+6mm Laminated. Flyscreen: Nylon." },
  ];

  for (const item of items) {
    await prisma.quotationItem.create({
      data: { ...item, quotationId: quotation.id },
    });
  }

  console.log("Created quotation:", quotation.id, quotation.quoteNo);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
