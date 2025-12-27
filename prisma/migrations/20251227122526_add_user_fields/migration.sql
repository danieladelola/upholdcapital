-- AlterTable
ALTER TABLE "User" ADD COLUMN     "assets" JSONB DEFAULT '[]',
ADD COLUMN     "country" TEXT,
ADD COLUMN     "currency" TEXT DEFAULT 'USD',
ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "firstname" TEXT,
ADD COLUMN     "initials" TEXT,
ADD COLUMN     "lastname" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "photoURL" TEXT,
ADD COLUMN     "role" TEXT DEFAULT 'user',
ADD COLUMN     "usdBalance" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "verified" BOOLEAN DEFAULT false,
ADD COLUMN     "wallets" JSONB DEFAULT '[]';
