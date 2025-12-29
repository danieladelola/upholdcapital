-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "stakeCycleDays" INTEGER,
ADD COLUMN     "stakeMax" DOUBLE PRECISION,
ADD COLUMN     "stakeMin" DOUBLE PRECISION,
ADD COLUMN     "stakeRoi" DOUBLE PRECISION,
ADD COLUMN     "stakingEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "UserAssetBalance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "UserAssetBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserStake" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "roi" DOUBLE PRECISION NOT NULL,
    "cycleDays" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',

    CONSTRAINT "UserStake_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAssetBalance_userId_assetId_key" ON "UserAssetBalance"("userId", "assetId");

-- AddForeignKey
ALTER TABLE "UserAssetBalance" ADD CONSTRAINT "UserAssetBalance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAssetBalance" ADD CONSTRAINT "UserAssetBalance_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStake" ADD CONSTRAINT "UserStake_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStake" ADD CONSTRAINT "UserStake_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
