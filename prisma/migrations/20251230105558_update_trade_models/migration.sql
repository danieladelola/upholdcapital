/*
  Warnings:

  - You are about to drop the column `price` on the `PostedTrade` table. All the data in the column will be lost.
  - Added the required column `amount` to the `PostedTrade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entryPrice` to the `PostedTrade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profitShare` to the `PostedTrade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tradeType` to the `PostedTrade` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PostedTrade" DROP COLUMN "price",
ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "entryPrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "profitShare" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "tradeType" TEXT NOT NULL;
