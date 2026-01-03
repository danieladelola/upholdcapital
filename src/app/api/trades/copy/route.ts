import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { PriceService } from '@/lib/price-service';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.role === 'ADMIN') {
      return NextResponse.json({ error: 'Admins cannot copy trades' }, { status: 403 });
    }

    const { postedTradeId, amount } = await request.json();

    if (!postedTradeId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const postedTrade = await prisma.postedTrade.findUnique({
      where: { id: postedTradeId },
      include: { asset: true },
    });

    if (!postedTrade) {
      return NextResponse.json({ error: 'Posted trade not found' }, { status: 404 });
    }

    // Check if trade is active
    if (postedTrade.status !== 'open') {
      return NextResponse.json({ error: 'Trade is closed' }, { status: 400 });
    }

    const createdAt = new Date(postedTrade.createdAt);
    const expiryTime = new Date(createdAt.getTime() + postedTrade.duration * 60 * 60 * 1000);
    if (expiryTime <= new Date()) {
      return NextResponse.json({ error: 'Trade has expired' }, { status: 400 });
    }

    if (!postedTrade.asset) {
      return NextResponse.json({ error: 'Trade asset not found' }, { status: 404 });
    }

    // Calculate P/L using live price
    const coinGeckoId = PriceService.mapSymbolToCoinGeckoId(postedTrade.asset.symbol);
    let currentPrice = postedTrade.asset.priceUsd; // fallback
    
    try {
      const livePrice = await PriceService.fetchPrice(coinGeckoId);
      if (livePrice > 0) {
        currentPrice = livePrice;
      }
    } catch (error) {
      console.error('Failed to fetch live price for P/L calculation:', error);
    }

    const entryPrice = postedTrade.entryPrice;
    if (!entryPrice || !postedTrade.tradeType || !postedTrade.profitShare) {
      return NextResponse.json({ error: 'Trade details incomplete' }, { status: 400 });
    }

    const isWin = postedTrade.tradeType === 'buy' ? currentPrice > entryPrice : currentPrice < entryPrice;
    const profitAmount = (postedTrade.profitShare / 100) * parseFloat(amount);

    // Update user balance
    const adjustment = isWin ? profitAmount : -profitAmount;
    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        balance: {
          increment: adjustment,
        },
      },
    });

    // Create copy trade record
    const copyTrade = await prisma.copiedTrade.create({
      data: {
        userId: currentUser.id,
        traderId: postedTrade.userId,
        // tradeId: if applicable, but for posted trades, maybe not
      },
    });

    return NextResponse.json({ copyTrade, adjustment });
  } catch (error) {
    console.error('Error copying trade:', error);
    return NextResponse.json(
      { error: 'Failed to copy trade' },
      { status: 500 }
    );
  }
}