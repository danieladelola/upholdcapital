/*
  Warnings:

  - You are about to drop the column `traderId` on the `PostedTrade` table. All the data in the column will be lost.
  - You are about to drop the `CopyTrade` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `PostedTrade` table without a default value. This is not possible if the table is not empty.
  - Made the column `followers` on table `PostedTrade` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isAdminPosted` on table `PostedTrade` required. This step will fail if there are existing NULL values in that column.
  - Made the column `losses` on table `PostedTrade` required. This step will fail if there are existing NULL values in that column.
  - Made the column `minStartup` on table `PostedTrade` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `PostedTrade` required. This step will fail if there are existing NULL values in that column.
  - Made the column `trades` on table `PostedTrade` required. This step will fail if there are existing NULL values in that column.
  - Made the column `username` on table `PostedTrade` required. This step will fail if there are existing NULL values in that column.
  - Made the column `winRate` on table `PostedTrade` required. This step will fail if there are existing NULL values in that column.
  - Made the column `wins` on table `PostedTrade` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CopyTrade" DROP CONSTRAINT "CopyTrade_postedTradeId_fkey";

-- DropForeignKey
ALTER TABLE "CopyTrade" DROP CONSTRAINT "CopyTrade_userId_fkey";

-- DropForeignKey
ALTER TABLE "PostedTrade" DROP CONSTRAINT "PostedTrade_traderId_fkey";

-- AlterTable
ALTER TABLE "PostedTrade" DROP COLUMN "traderId",
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "assetId" DROP NOT NULL,
ALTER COLUMN "amount" DROP NOT NULL,
ALTER COLUMN "entryPrice" DROP NOT NULL,
ALTER COLUMN "profitShare" DROP NOT NULL,
ALTER COLUMN "tradeType" DROP NOT NULL,
ALTER COLUMN "followers" SET NOT NULL,
ALTER COLUMN "isAdminPosted" SET NOT NULL,
ALTER COLUMN "losses" SET NOT NULL,
ALTER COLUMN "minStartup" SET NOT NULL,
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "trades" SET NOT NULL,
ALTER COLUMN "username" SET NOT NULL,
ALTER COLUMN "winRate" SET NOT NULL,
ALTER COLUMN "wins" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "followers" INTEGER,
ADD COLUMN     "losses" INTEGER,
ADD COLUMN     "minStartup" DOUBLE PRECISION,
ADD COLUMN     "profitShare" DOUBLE PRECISION,
ADD COLUMN     "traderTrades" INTEGER,
ADD COLUMN     "username" TEXT NOT NULL,
ADD COLUMN     "winRate" DOUBLE PRECISION,
ADD COLUMN     "wins" INTEGER;

-- DropTable
DROP TABLE "CopyTrade";

-- CreateTable
CREATE TABLE "TraderTrade" (
    "id" TEXT NOT NULL,
    "traderId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "size" DOUBLE PRECISION NOT NULL,
    "profit" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TraderTrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CopiedTrade" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "traderId" TEXT NOT NULL,
    "tradeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CopiedTrade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CopiedTrade_userId_traderId_key" ON "CopiedTrade"("userId", "traderId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "PostedTrade" ADD CONSTRAINT "PostedTrade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TraderTrade" ADD CONSTRAINT "TraderTrade_traderId_fkey" FOREIGN KEY ("traderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TraderTrade" ADD CONSTRAINT "TraderTrade_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CopiedTrade" ADD CONSTRAINT "CopiedTrade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CopiedTrade" ADD CONSTRAINT "CopiedTrade_traderId_fkey" FOREIGN KEY ("traderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CopiedTrade" ADD CONSTRAINT "CopiedTrade_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "TraderTrade"("id") ON DELETE CASCADE ON UPDATE CASCADE;
