import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/user/assets - Get current user's assets with staking info
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const assets = await prisma.asset.findMany({
      where: {
        stakingEnabled: true,
      },
      include: {
        userAssets: {
          where: {
            userId: currentUser.id,
          },
          select: {
            balance: true,
          },
        },
        userAssetBalances: {
          where: {
            userId: currentUser.id,
          },
          select: {
            balance: true,
          },
        },
      },
    });

    const result = assets.map(asset => {
      // Prefer userAssets balance, fallback to userAssetBalances, default to 0
      const userAssetBalance = asset.userAssets[0]?.balance;
      const userAssetBalanceFromBalance = asset.userAssetBalances[0]?.balance;
      const balance = userAssetBalance !== undefined ? userAssetBalance : (userAssetBalanceFromBalance || 0);

      return {
        id: asset.id,
        name: asset.name,
        symbol: asset.symbol,
        logoUrl: asset.logoUrl,
        stakingEnabled: asset.stakingEnabled,
        stakeMin: asset.stakeMin,
        stakeMax: asset.stakeMax,
        stakeRoi: asset.stakeRoi,
        stakeCycleDays: asset.stakeCycleDays,
        userBalance: balance,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching user assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user assets' },
      { status: 500 }
    );
  }
}