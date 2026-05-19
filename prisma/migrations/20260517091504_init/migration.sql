-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'SALES');

-- CreateEnum
CREATE TYPE "QuotationStatus" AS ENUM ('DRAFT', 'GENERATED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ConfigCategory" AS ENUM ('PROFILE_SERIES', 'FRAME_COLOR', 'SURFACE_TREATMENT', 'GLASS_SPECIFICATION', 'HARDWARE_BRAND', 'SCREEN_TYPE', 'INSTALLATION_METHOD', 'CERTIFICATION', 'PRODUCT_TYPE', 'CURRENCY', 'TRADE_TERM', 'PAYMENT_TERM', 'PROJECT_TYPE', 'PROJECT_STAGE', 'CLIENT_TYPE', 'LEAD_SOURCE', 'OPENING_WAY');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'SALES',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyName" TEXT,
    "country" TEXT NOT NULL,
    "city" TEXT,
    "email" TEXT,
    "whatsapp" TEXT,
    "clientType" TEXT,
    "leadSource" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotations" (
    "id" TEXT NOT NULL,
    "quoteNo" TEXT NOT NULL,
    "status" "QuotationStatus" NOT NULL DEFAULT 'DRAFT',
    "clientName" TEXT NOT NULL,
    "companyName" TEXT,
    "country" TEXT NOT NULL,
    "city" TEXT,
    "clientEmail" TEXT,
    "clientWhatsapp" TEXT,
    "clientType" TEXT,
    "leadSource" TEXT,
    "projectName" TEXT NOT NULL,
    "projectAddress" TEXT,
    "projectType" TEXT,
    "projectStage" TEXT,
    "hasDrawings" BOOLEAN NOT NULL DEFAULT false,
    "expectedPurchaseTime" TEXT,
    "quoteDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quoteValidity" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "tradeTerm" TEXT NOT NULL DEFAULT 'EXW',
    "productionLeadTime" TEXT,
    "paymentTerm" TEXT,
    "profileSeries" TEXT,
    "frameColor" TEXT,
    "surfaceTreatment" TEXT,
    "glassSpecification" TEXT,
    "hardwareBrand" TEXT,
    "screenType" TEXT,
    "installationMethod" TEXT,
    "certifications" TEXT[],
    "totalArea" DECIMAL(10,4),
    "productSubtotal" DECIMAL(12,2),
    "accessoriesPackingFee" DECIMAL(12,2),
    "shippingCost" DECIMAL(12,2),
    "discount" DECIMAL(12,2),
    "grandTotal" DECIMAL(12,2),
    "termsAndConditions" TEXT,
    "notes" TEXT,
    "tbcSummary" TEXT,
    "createdById" TEXT NOT NULL,
    "customerId" TEXT,
    "bankAccountId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotation_items" (
    "id" TEXT NOT NULL,
    "itemNo" INTEGER NOT NULL,
    "windowDoorId" TEXT,
    "productType" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "area" DECIMAL(10,4),
    "finalUnitPrice" DECIMAL(12,2),
    "finalAmount" DECIMAL(12,2),
    "openingWay" TEXT,
    "notes" TEXT,
    "quotationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quotation_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotation_item_images" (
    "id" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "description" TEXT,
    "isTbc" BOOLEAN NOT NULL DEFAULT false,
    "tbcNotes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "quotationItemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quotation_item_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_info" (
    "id" TEXT NOT NULL,
    "logoUrl" TEXT,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "website" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "certificationsText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "swiftCode" TEXT,
    "bankAddress" TEXT,
    "notes" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuration_options" (
    "id" TEXT NOT NULL,
    "category" "ConfigCategory" NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "labelEn" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuration_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_rules" (
    "id" TEXT NOT NULL,
    "productType" TEXT NOT NULL,
    "profileSeries" TEXT,
    "baseUnitPrice" DECIMAL(12,2) NOT NULL,
    "minArea" DECIMAL(10,4),
    "maxArea" DECIMAL(10,4),
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "quotations_quoteNo_key" ON "quotations"("quoteNo");

-- CreateIndex
CREATE UNIQUE INDEX "quotation_items_quotationId_itemNo_key" ON "quotation_items"("quotationId", "itemNo");

-- CreateIndex
CREATE UNIQUE INDEX "configuration_options_category_value_key" ON "configuration_options"("category", "value");

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "bank_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_item_images" ADD CONSTRAINT "quotation_item_images_quotationItemId_fkey" FOREIGN KEY ("quotationItemId") REFERENCES "quotation_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
