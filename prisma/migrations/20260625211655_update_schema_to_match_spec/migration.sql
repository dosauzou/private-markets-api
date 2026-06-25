-- CreateEnum
CREATE TYPE "FundStatus" AS ENUM ('Fundraising', 'Investing', 'Closed');

-- CreateEnum
CREATE TYPE "InvestorType" AS ENUM ('Individual', 'Institution', 'FamilyOffice');

-- CreateTable
CREATE TABLE "Fund" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vintage_year" INTEGER NOT NULL,
    "target_size_usd" DECIMAL(18,2) NOT NULL,
    "status" "FundStatus" NOT NULL DEFAULT 'Fundraising',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Investor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "investor_type" "InvestorType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Investor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Investment" (
    "id" TEXT NOT NULL,
    "fund_id" TEXT NOT NULL,
    "investor_id" TEXT NOT NULL,
    "amount_usd" DECIMAL(18,2) NOT NULL,
    "investment_date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Investment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Investor_email_key" ON "Investor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Investment_fund_id_investor_id_key" ON "Investment"("fund_id", "investor_id");

-- AddForeignKey
ALTER TABLE "Investment" ADD CONSTRAINT "Investment_fund_id_fkey" FOREIGN KEY ("fund_id") REFERENCES "Fund"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investment" ADD CONSTRAINT "Investment_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "Investor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
