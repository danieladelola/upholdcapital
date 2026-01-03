import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const copiedTrades = await prisma.copiedTrade.findMany({
      where: {
        userId: currentUser.id,
      },
      select: {
        traderId: true,
      },
    });

    return NextResponse.json(copiedTrades);
  } catch (error) {
    console.error('Error fetching copied trades:', error);
    return NextResponse.json(
      { error: 'Failed to fetch copied trades' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { traderId, tradeId } = await request.json();

    if (!traderId) {
      return NextResponse.json({ error: 'Missing traderId' }, { status: 400 });
    }

    // Check if trader exists
    const trader = await prisma.user.findUnique({
      where: { id: traderId },
    });

    if (!trader || trader.role !== 'TRADER') {
      return NextResponse.json({ error: 'Invalid trader' }, { status: 400 });
    }

    // If tradeId provided, check if it exists and belongs to trader
    if (tradeId) {
      const trade = await prisma.traderTrade.findUnique({
        where: { id: tradeId },
      });

      if (!trade || trade.traderId !== traderId) {
        return NextResponse.json({ error: 'Invalid trade' }, { status: 400 });
      }
    }

    // Check if already copied
    const existing = await prisma.copiedTrade.findUnique({
      where: {
        userId_traderId: {
          userId: currentUser.id,
          traderId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Already copying this trader' }, { status: 400 });
    }

    const copiedTrade = await prisma.copiedTrade.create({
      data: {
        userId: currentUser.id,
        traderId,
        tradeId: tradeId || null,
      },
    });

    return NextResponse.json(copiedTrade);
  } catch (error) {
    console.error('Error creating copied trade:', error);
    return NextResponse.json(
      { error: 'Failed to copy trade' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { traderId } = await request.json();

    if (!traderId) {
      return NextResponse.json({ error: 'Missing traderId' }, { status: 400 });
    }

    // Delete all copied trades for this trader by this user
    await prisma.copiedTrade.deleteMany({
      where: {
        userId: currentUser.id,
        traderId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting copied trades:', error);
    return NextResponse.json(
      { error: 'Failed to stop copying' },
      { status: 500 }
    );
  }
}