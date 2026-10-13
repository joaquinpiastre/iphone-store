-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "PhoneCondition" AS ENUM ('NEW', 'USED', 'LIKE_NEW');

-- CreateEnum
CREATE TYPE "PhoneStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD');

-- CreateEnum
CREATE TYPE "TradeInStatus" AS ENUM ('NEW', 'CONTACTED', 'CLOSED', 'REJECTED');

-- CreateTable
CREATE TABLE "Phone" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "storageGb" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "condition" "PhoneCondition" NOT NULL,
    "batteryHealth" INTEGER,
    "imei" TEXT,
    "accessories" TEXT[],
    "warrantyMonths" INTEGER NOT NULL DEFAULT 0,
    "priceUsd" INTEGER NOT NULL,
    "costUsd" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" "PhoneStatus" NOT NULL DEFAULT 'AVAILABLE',
    "soldAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhoneImage" (
    "id" TEXT NOT NULL,
    "phoneId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PhoneImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradeInPrice" (
    "id" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "storageGb" INTEGER NOT NULL,
    "basePriceUsd" INTEGER NOT NULL,

    CONSTRAINT "TradeInPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradeInModifier" (
    "id" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "option" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "discountPct" INTEGER NOT NULL DEFAULT 0,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TradeInModifier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradeInRequest" (
    "id" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "email" TEXT,
    "model" TEXT NOT NULL,
    "storageGb" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "screen" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "batteryPct" INTEGER NOT NULL,
    "powersOn" BOOLEAN NOT NULL,
    "faceIdWorks" BOOLEAN NOT NULL,
    "hasBox" BOOLEAN NOT NULL,
    "hasCharger" BOOLEAN NOT NULL,
    "estimatedUsd" INTEGER NOT NULL,
    "targetPhoneId" TEXT,
    "differenceUsd" INTEGER,
    "status" "TradeInStatus" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TradeInRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "Phone_slug_key" ON "Phone"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Phone_imei_key" ON "Phone"("imei");

-- CreateIndex
CREATE INDEX "Phone_model_idx" ON "Phone"("model");

-- CreateIndex
CREATE INDEX "Phone_condition_idx" ON "Phone"("condition");

-- CreateIndex
CREATE INDEX "Phone_priceUsd_idx" ON "Phone"("priceUsd");

-- CreateIndex
CREATE INDEX "Phone_status_featured_idx" ON "Phone"("status", "featured");

-- CreateIndex
CREATE INDEX "Phone_status_createdAt_idx" ON "Phone"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Phone_batteryHealth_idx" ON "Phone"("batteryHealth");

-- CreateIndex
CREATE INDEX "PhoneImage_phoneId_position_idx" ON "PhoneImage"("phoneId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "TradeInPrice_model_storageGb_key" ON "TradeInPrice"("model", "storageGb");

-- CreateIndex
CREATE UNIQUE INDEX "TradeInModifier_group_option_key" ON "TradeInModifier"("group", "option");

-- CreateIndex
CREATE INDEX "TradeInRequest_status_createdAt_idx" ON "TradeInRequest"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- AddForeignKey
ALTER TABLE "PhoneImage" ADD CONSTRAINT "PhoneImage_phoneId_fkey" FOREIGN KEY ("phoneId") REFERENCES "Phone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeInRequest" ADD CONSTRAINT "TradeInRequest_targetPhoneId_fkey" FOREIGN KEY ("targetPhoneId") REFERENCES "Phone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

