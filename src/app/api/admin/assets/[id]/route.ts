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
    const { symbol, name, priceUsd, logoUrl } = body;

    const asset = await prisma.asset.update({
      where: {
        id: id,
      },
      data: {
        symbol,
        name,
        priceUsd,
        logoUrl,
      },
    });

    return NextResponse.json(asset);
  } catch (error) {
    console.error('Error updating asset:', error);
    return NextResponse.json(
      { error: 'Failed to update asset' },
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
    await prisma.asset.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('Error deleting asset:', error);
    return NextResponse.json(
      { error: 'Failed to delete asset' },
      { status: 500 }
    );
  }
}