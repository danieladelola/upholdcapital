import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { assetId, amount }: { assetId: string; amount: number } = body;

    if (!assetId || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Get asset with staking info
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      select: {
        id: true,
        symbol: true,
        name: true,
        stakingEnabled: true,
        stakeMin: true,
        stakeMax: true,
        stakeRoi: true,
        stakeCycleDays: true,
      },
    });

    if (!asset || !asset.stakingEnabled) {
      return NextResponse.json({ error: 'Staking not enabled for this asset' }, { status: 400 });
    }

    if (amount < (asset.stakeMin || 0) || amount > (asset.stakeMax || 0)) {
      return NextResponse.json({ error: 'Amount out of staking range' }, { status: 400 });
    }

    // Check user balance
    const userAssetBalance = await prisma.userAssetBalance.findUnique({
      where: {
        userId_assetId: {
          userId: currentUser.id,
          assetId,
        },
      },
    });

    if (!userAssetBalance || userAssetBalance.balance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Calculate end date
    const cycleDays = asset.stakeCycleDays || 1;
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + cycleDays * 24 * 60 * 60 * 1000);

    // Create stake
    const stake = await prisma.userStake.create({
      data: {
        userId: currentUser.id,
        assetId,
        amount,
        roi: asset.stakeRoi || 0,
        cycleDays,
        startDate,
        endDate,
        status: 'active',
      },
    });

    // Deduct balance
    await prisma.userAssetBalance.update({
      where: {
        userId_assetId: {
          userId: currentUser.id,
          assetId,
        },
      },
      data: {
        balance: {
          decrement: amount,
        },
      },
    });

    return NextResponse.json({ stake });
  } catch (error) {
    console.error('Error creating stake:', error);
    return NextResponse.json(
      { error: 'Failed to create stake' },
      { status: 500 }
    );
  }
}