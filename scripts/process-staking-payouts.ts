import "dotenv/config"
import { PrismaClient } from '../src/lib/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

async function processStakingPayouts() {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today

  try {
    // Find active stakes where endDate <= today
    const expiredStakes = await prisma.userStake.findMany({
      where: {
        status: 'active',
        endDate: {
          lte: today,
        },
      },
    });

    for (const stake of expiredStakes) {
      const profit = stake.amount * (stake.roi / 100);
      const totalReturn = stake.amount + profit;

      // Add to UserAssetBalance
      await prisma.userAssetBalance.update({
        where: {
          userId_assetId: {
            userId: stake.userId,
            assetId: stake.assetId,
          },
        },
        data: {
          balance: {
            increment: totalReturn,
          },
        },
      });

      // Set status to completed
      await prisma.userStake.update({
        where: { id: stake.id },
        data: { status: 'completed' },
      });

      console.log(`Processed payout for stake ${stake.id}: added ${totalReturn} to user ${stake.userId}`);
    }

    console.log(`Processed ${expiredStakes.length} staking payouts`);
  } catch (error) {
    console.error('Error processing staking payouts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

processStakingPayouts();