-- AlterTable
ALTER TABLE "PostedTrade" ADD COLUMN     "followers" INTEGER,
ADD COLUMN     "isAdminPosted" BOOLEAN DEFAULT false,
ADD COLUMN     "losses" INTEGER,
ADD COLUMN     "minStartup" DOUBLE PRECISION,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "trades" INTEGER,
ADD COLUMN     "username" TEXT,
ADD COLUMN     "winRate" DOUBLE PRECISION,
ADD COLUMN     "wins" INTEGER;
