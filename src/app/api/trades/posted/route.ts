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
      include: {
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