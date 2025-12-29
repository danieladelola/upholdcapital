import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/admin/trades - Get all trades
export async function GET() {
  try {
    const trades = await prisma.trade.findMany({
      include: {
        asset: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform to match frontend interface
    const transformedTrades = trades.map(trade => ({
      id: trade.id,
      user_id: trade.userId,
      asset_id: trade.assetId,
      trade_type: trade.tradeType,
      amount: trade.amount,
      price_usd: trade.priceUsd,
      created_at: trade.createdAt,
      asset: trade.asset ? {
        id: trade.asset.id,
        symbol: trade.asset.symbol,
        name: trade.asset.name,
        price_usd: trade.asset.priceUsd,
        logo_url: trade.asset.logoUrl,
        created_at: trade.asset.createdAt,
      } : undefined,
      user: trade.user ? {
        id: trade.user.id,
        email: trade.user.email,
        firstname: trade.user.firstName,
        lastname: trade.user.lastName,
      } : undefined,
    }));

    return NextResponse.json(transformedTrades);
  } catch (error) {
    console.error('Error fetching trades:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trades' },
      { status: 500 }
    );
  }
}