import "dotenv/config";
import { prisma } from '../src/lib/db';

async function main() {
  const email = 'user@vura.pro';

  // Find the user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log('User not found');
    return;
  }

  // Get some assets
  const assets = await prisma.asset.findMany({
    take: 5,
  });

  for (const asset of assets) {
    // Check if user asset already exists
    const existing = await prisma.userAsset.findUnique({
      where: {
        userId_assetId: {
          userId: user.id,
          assetId: asset.id,
        },
      },
    });

    if (!existing) {
      await prisma.userAsset.create({
        data: {
          userId: user.id,
          assetId: asset.id,
          balance: 1000, // Give some balance
        },
      });
      console.log(`Created user asset for ${asset.symbol}`);
    } else {
      console.log(`User asset for ${asset.symbol} already exists`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });