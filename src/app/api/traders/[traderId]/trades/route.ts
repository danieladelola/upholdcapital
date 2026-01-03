import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ traderId: string }> }
) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { traderId } = await params;

    // Check if trader exists and is a trader
    const trader = await prisma.user.findUnique({
      where: { id: traderId },
    });

    if (!trader || trader.role !== 'TRADER') {
      return NextResponse.json({ error: 'Invalid trader' }, { status: 400 });
    }

    const trades = await prisma.traderTrade.findMany({
      where: {
        traderId,
      },
      include: {
        asset: true,
      },
      orderBy: {
        date: 'desc',
      },
      take: 10, // Limit to recent 10 trades
    });

    return NextResponse.json(trades);
  } catch (error) {
    console.error('Error fetching trader trades:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trades' },
      { status: 500 }
    );
  }
}