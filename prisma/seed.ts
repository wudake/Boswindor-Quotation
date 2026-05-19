import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@boswindor.com" },
    update: {},
    create: {
      email: "admin@boswindor.com",
      name: "Administrator",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  const sales = await prisma.user.upsert({
    where: { email: "sales@boswindor.com" },
    update: {},
    create: {
      email: "sales@boswindor.com",
      name: "Sales User",
      password: await bcrypt.hash("sales123", 10),
      role: "SALES",
    },
  });

  console.log({ admin, sales });

  // Seed default configuration options
  const configs = [
    { category: "CURRENCY", value: "USD", label: "USD" },
    { category: "CURRENCY", value: "AUD", label: "AUD" },
    { category: "CURRENCY", value: "EUR", label: "EUR" },
    { category: "CURRENCY", value: "GBP", label: "GBP" },
    { category: "TRADE_TERM", value: "EXW", label: "EXW" },
    { category: "TRADE_TERM", value: "FOB", label: "FOB" },
    { category: "TRADE_TERM", value: "CIF", label: "CIF" },
    { category: "TRADE_TERM", value: "DDP", label: "DDP" },
    { category: "CLIENT_TYPE", value: "Builder", label: "Builder" },
    { category: "CLIENT_TYPE", value: "Contractor", label: "Contractor" },
    { category: "CLIENT_TYPE", value: "Homeowner", label: "Homeowner" },
    { category: "LEAD_SOURCE", value: "Facebook", label: "Facebook" },
    { category: "LEAD_SOURCE", value: "Website", label: "Website" },
    { category: "LEAD_SOURCE", value: "Exhibition", label: "Exhibition" },
    { category: "PROJECT_TYPE", value: "Villa", label: "Villa" },
    { category: "PROJECT_TYPE", value: "Apartment", label: "Apartment" },
    { category: "PROJECT_TYPE", value: "Commercial", label: "Commercial" },
    { category: "PRODUCT_TYPE", value: "Sliding Window", label: "Sliding Window" },
    { category: "PRODUCT_TYPE", value: "Fixed Window", label: "Fixed Window" },
    { category: "PRODUCT_TYPE", value: "Casement Window", label: "Casement Window" },
    { category: "PRODUCT_TYPE", value: "Sliding Door", label: "Sliding Door" },
    { category: "PRODUCT_TYPE", value: "Folding Door", label: "Folding Door" },
    { category: "SURFACE_TREATMENT", value: "Powder Coating", label: "Powder Coating" },
    { category: "SURFACE_TREATMENT", value: "Anodized", label: "Anodized" },
  ];

  for (const cfg of configs) {
    await prisma.configurationOption.upsert({
      where: {
        category_value: {
          category: cfg.category as any,
          value: cfg.value,
        },
      },
      update: {},
      create: {
        category: cfg.category as any,
        value: cfg.value,
        label: cfg.label,
      },
    });
  }

  console.log("Seed completed.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
