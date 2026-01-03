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

    if (!trade || trade.userId !== currentUser.id) {
      return NextResponse.json({ error: 'Trade not found or not owned by user' }, { status: 404 });
    }

    // Delete the trade (cascade will handle related copyTrades)
    await prisma.postedTrade.delete({
      where: { id: tradeId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting trade:', error);
    return NextResponse.json(
      { error: 'Failed to delete trade' },
      { status: 500 }
    );
  }
}