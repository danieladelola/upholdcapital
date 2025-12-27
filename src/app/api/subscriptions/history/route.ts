import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const subscriptions = await prisma.userSubscription.findMany({
      where: { userId },
      include: { subscription: true },
      orderBy: { createdAt: 'desc' },
    });

    // Map to the expected format
    const history = subscriptions.map(sub => ({
      id: sub.id,
      planName: sub.subscription.name,
      amount: sub.subscription.price,
      startDate: sub.startDate.toISOString(),
      endDate: sub.endDate?.toISOString() || '',
      status: sub.status,
    }));

    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching subscription history:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}