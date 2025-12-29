/*
  Warnings:

  - You are about to drop the column `created_at` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `password_hash` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `logo_url` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `price_usd` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `asset_id` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `price_usd` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `trade_type` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `firstname` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastname` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password_hash` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `photoURL` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `usdBalance` on the `User` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `asset_id` on the `UserAsset` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `UserAsset` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,assetId]` on the table `UserAsset` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `passwordHash` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceUsd` to the `Asset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `assetId` to the `Trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceUsd` to the `Trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tradeType` to the `Trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `assetId` to the `UserAsset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `UserAsset` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'TRADER', 'ADMIN');

-- DropForeignKey
ALTER TABLE "Trade" DROP CONSTRAINT "Trade_asset_id_fkey";

-- DropForeignKey
ALTER TABLE "Trade" DROP CONSTRAINT "Trade_user_id_fkey";

-- DropForeignKey
ALTER TABLE "UserAsset" DROP CONSTRAINT "UserAsset_asset_id_fkey";

-- DropForeignKey
ALTER TABLE "UserAsset" DROP CONSTRAINT "UserAsset_user_id_fkey";

-- DropIndex
DROP INDEX "UserAsset_user_id_asset_id_key";

-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "created_at",
DROP COLUMN "password_hash",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "passwordHash" TEXT NOT NULL,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'ADMIN';

-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "created_at",
DROP COLUMN "logo_url",
DROP COLUMN "price_usd",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "priceUsd" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Trade" DROP COLUMN "asset_id",
DROP COLUMN "created_at",
DROP COLUMN "price_usd",
DROP COLUMN "trade_type",
DROP COLUMN "user_id",
ADD COLUMN     "assetId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "priceUsd" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "tradeType" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "created_at",
DROP COLUMN "firstname",
DROP COLUMN "lastname",
DROP COLUMN "password_hash",
DROP COLUMN "phoneNumber",
DROP COLUMN "photoURL",
DROP COLUMN "usdBalance",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "balance" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "passwordHash" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "profileImage" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';

-- AlterTable
ALTER TABLE "UserAsset" DROP COLUMN "asset_id",
DROP COLUMN "user_id",
ADD COLUMN     "assetId" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "AdminAuditLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAsset_userId_assetId_key" ON "UserAsset"("userId", "assetId");

-- AddForeignKey
ALTER TABLE "UserAsset" ADD CONSTRAINT "UserAsset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAsset" ADD CONSTRAINT "UserAsset_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
