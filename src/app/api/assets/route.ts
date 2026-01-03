import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/assets - Get all assets
export async function GET() {
  try {
    const assets = await prisma.asset.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform to match frontend interface
    const transformedAssets = assets.map(asset => ({
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      priceUsd: asset.priceUsd,
      logoUrl: asset.logoUrl,
      createdAt: asset.createdAt,
    }));

    return NextResponse.json(transformedAssets);
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
      { status: 500 }
    );
  }
}