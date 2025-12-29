import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { planId, userId } = await request.json();
    if (!planId || !userId) {
      return NextResponse.json({ error: 'Plan ID and User ID required' }, { status: 400 });
    }

    // Get the plan
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });
    if (!plan || !plan.enabled) {
      return NextResponse.json({ error: 'Plan not found or disabled' }, { status: 404 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check balance
    if ((user.balance || 0) < plan.price) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Deduct balance
    await prisma.user.update({
      where: { id: userId },
      data: { balance: (user.balance || 0) - plan.price },
    });

    // Calculate end date based on duration
    const startDate = new Date();
    let endDate: Date;
    if (plan.duration === 'monthly') {
      endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // approx 30 days
    } else if (plan.duration === 'yearly') {
      endDate = new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate());
    } else {
      endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // default to monthly
    }

    // Create subscription
    const subscription = await prisma.userSubscription.create({
      data: {
        userId,
        subscriptionId: planId,
        endDate,
      },
    });

    return NextResponse.json({ success: true, subscription });
  } catch (error) {
    console.error('Error subscribing:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}