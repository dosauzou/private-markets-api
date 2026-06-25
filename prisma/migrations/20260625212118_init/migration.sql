/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Fund` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Investment` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Investor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Fund" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Investment" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Investor" DROP COLUMN "updatedAt";
