import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.role !== 'TRADER' && currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const trades = await prisma.postedTrade.findMany({
      where: {
        traderId: currentUser.id,
      },
      include: {
        asset: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(trades);
  } catch (error) {
    console.error('Error fetching my trades:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trades' },
      { status: 500 }
    );
  }
}