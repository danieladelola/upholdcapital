import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';

// GET /api/admin/assets - Get all assets
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
      price_usd: asset.priceUsd,
      logo_url: asset.logoUrl,
      created_at: asset.createdAt,
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

// POST /api/admin/assets - Create a new asset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, name, price_usd, logo_url } = body;

    const asset = await prisma.asset.create({
      data: {
        symbol,
        name,
        priceUsd,
        logoUrl,
      },
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    console.error('Error creating asset:', error);
    return NextResponse.json(
      { error: 'Failed to create asset' },
      { status: 500 }
    );
  }
}