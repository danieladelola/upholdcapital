import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// PUT /api/admin/assets/[id] - Update an asset
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { symbol, name, price_usd, priceUsd, logo_url, logoUrl } = body;

    // Handle both snake_case and camelCase
    const finalPrice = priceUsd || price_usd;
    const finalLogoUrl = logoUrl || logo_url;

    if (!symbol || !name || finalPrice === undefined || finalPrice === null) {
      return NextResponse.json(
        { error: 'Missing required fields: symbol, name, and price_usd' },
        { status: 400 }
      );
    }

    const asset = await prisma.asset.update({
      where: {
        id: id,
      },
      data: {
        symbol: symbol.toUpperCase(),
        name,
        priceUsd: parseFloat(finalPrice),
        logoUrl: finalLogoUrl || null,
      },
    });

    return NextResponse.json(asset);
  } catch (error) {
    console.error('Error updating asset:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update asset' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/assets/[id] - Delete an asset
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const asset = await prisma.asset.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ success: true, message: 'Asset deleted successfully', asset });
  } catch (error) {
    console.error('Error deleting asset:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete asset' },
      { status: 500 }
    );
  }
}