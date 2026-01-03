import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { traderId, assetId, date, size, profit } = await request.json();

    if (!traderId || !assetId || !date || !size || profit === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if trader exists and has role trader
    const trader = await prisma.user.findUnique({
      where: { id: traderId },
    });

    if (!trader || trader.role !== 'TRADER') {
      return NextResponse.json({ error: 'Invalid trader' }, { status: 400 });
    }

    // Check if asset exists
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 400 });
    }

    const trade = await prisma.traderTrade.create({
      data: {
        traderId,
        assetId,
        date: new Date(date),
        size: parseFloat(size),
        profit: parseFloat(profit),
      },
    });

    return NextResponse.json(trade);
  } catch (error) {
    console.error('Error creating trader trade:', error);
    return NextResponse.json(
      { error: 'Failed to create trade' },
      { status: 500 }
    );
  }
}