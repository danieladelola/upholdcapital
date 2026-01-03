import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Current user role:', currentUser.role);

    if (currentUser.role !== 'TRADER' && currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { assetId, tradeType, amount, profitShare, notes, entryPrice, duration, name, username, followers, winRate, wins, losses, trades: tradeCount, minStartup } = await request.json();

    console.log('Received data:', { assetId, tradeType, amount, profitShare, notes, entryPrice, duration, name, username, followers, winRate, wins, losses, tradeCount, minStartup });

    if (!assetId || !tradeType || !amount || !profitShare) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if asset exists
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      console.log('Asset not found:', assetId);
      return NextResponse.json({ error: 'Asset not found' }, { status: 400 });
    }

    // Use the entry price provided by the frontend (live price)
    const finalEntryPrice = entryPrice || 0;

    console.log('Creating trade with:', {
      traderId: currentUser.id,
      assetId,
      tradeType,
      amount: parseFloat(amount),
      entryPrice: finalEntryPrice,
      profitShare: parseFloat(profitShare),
      notes,
      duration: duration || 24,
      name,
      username,
      followers: followers ? parseInt(followers) : null,
      winRate: winRate ? parseFloat(winRate) : null,
      wins: wins ? parseInt(wins) : null,
      losses: losses ? parseInt(losses) : null,
      trades: tradeCount ? parseInt(tradeCount) : null,
      minStartup: minStartup ? parseFloat(minStartup) : null,
      isAdminPosted: currentUser.role === 'ADMIN',
    });

    const postedTrade = await prisma.postedTrade.create({
      data: {
        traderId: currentUser.id,
        assetId,
        tradeType,
        amount: parseFloat(amount),
        entryPrice: finalEntryPrice,
        profitShare: parseFloat(profitShare),
        notes,
        duration: duration || 24,
        name,
        username,
        followers: followers ? parseInt(followers) : null,
        winRate: winRate ? parseFloat(winRate) : null,
        wins: wins ? parseInt(wins) : null,
        losses: losses ? parseInt(losses) : null,
        trades: tradeCount ? parseInt(tradeCount) : null,
        minStartup: minStartup ? parseFloat(minStartup) : null,
        isAdminPosted: currentUser.role === 'ADMIN',
      },
    });

    return NextResponse.json(postedTrade);
  } catch (error) {
    console.error('Error posting trade:', error);
    return NextResponse.json(
      { error: 'Failed to post trade' },
      { status: 500 }
    );
  }
}