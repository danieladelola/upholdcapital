import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/user/trader-assets - Get current user's assets for trading
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userAssets = await prisma.userAsset.findMany({
      where: { userId: currentUser.id },
      include: {
        asset: true,
      },
    });

    const result = userAssets.map(ua => ({
      id: ua.asset.id,
      name: ua.asset.name,
      symbol: ua.asset.symbol,
      logoUrl: ua.asset.logoUrl,
      priceUsd: ua.asset.priceUsd,
      balance: ua.balance,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching trader assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trader assets' },
      { status: 500 }
    );
  }
}