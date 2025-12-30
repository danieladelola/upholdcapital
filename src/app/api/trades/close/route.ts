import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.role !== 'TRADER' && currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { tradeId } = await request.json();

    if (!tradeId) {
      return NextResponse.json({ error: 'Trade ID required' }, { status: 400 });
    }

    // Check if the trade belongs to the user
    const trade = await prisma.postedTrade.findUnique({
      where: { id: tradeId },
    });

    if (!trade || trade.traderId !== currentUser.id) {
      return NextResponse.json({ error: 'Trade not found or not owned by user' }, { status: 404 });
    }

    // Update status to closed
    await prisma.postedTrade.update({
      where: { id: tradeId },
      data: { status: 'closed' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error closing trade:', error);
    return NextResponse.json(
      { error: 'Failed to close trade' },
      { status: 500 }
    );
  }
}