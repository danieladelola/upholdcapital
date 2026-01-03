import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const postedTrades = await prisma.postedTrade.findMany({
      select: {
        id: true,
        trader: {
          select: {
            id: true,
            displayName: true,
            profileImage: true,
            firstName: true,
            lastName: true,
          },
        },
        asset: true,
        tradeType: true,
        amount: true,
        entryPrice: true,
        profitShare: true,
        notes: true,
        duration: true,
        status: true,
        createdAt: true,
        name: true,
        username: true,
        followers: true,
        winRate: true,
        wins: true,
        losses: true,
        trades: true,
        minStartup: true,
        isAdminPosted: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(postedTrades);
  } catch (error) {
    console.error('Error fetching posted trades:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posted trades' },
      { status: 500 }
    );
  }
}