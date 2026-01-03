import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const traders = await prisma.user.findMany({
      where: {
        role: 'TRADER',
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        winRate: true,
        followers: true,
        wins: true,
        losses: true,
        traderTrades: true,
        minStartup: true,
      },
      orderBy: {
        username: 'asc',
      },
    });

    return NextResponse.json(traders);
  } catch (error) {
    console.error('Error fetching traders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch traders' },
      { status: 500 }
    );
  }
}