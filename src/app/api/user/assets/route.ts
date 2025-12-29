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

    const userAssets = await prisma.userAssetBalance.findMany({
      where: {
        userId: currentUser.id,
      },
      include: {
        asset: {
          select: {
            name: true,
            symbol: true,
            logoUrl: true,
            stakingEnabled: true,
            stakeMin: true,
            stakeMax: true,
            stakeRoi: true,
            stakeCycleDays: true,
          },
        },
      },
    });

    const result = userAssets.map(ua => ({
      id: ua.asset.id,
      name: ua.asset.name,
      symbol: ua.asset.symbol,
      logo: ua.asset.logoUrl,
      stakingEnabled: ua.asset.stakingEnabled,
      stakeMin: ua.asset.stakeMin,
      stakeMax: ua.asset.stakeMax,
      stakeRoi: ua.asset.stakeRoi,
      stakeCycleDays: ua.asset.stakeCycleDays,
      userBalance: ua.balance,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching user assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user assets' },
      { status: 500 }
    );
  }
}