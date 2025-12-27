import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';

// GET /api/user/assets - Get current user's assets
export async function GET(request: NextRequest) {
  try {
    // For now, get user ID from query param (should use session in production)
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const userAssets = await prisma.userAsset.findMany({
      where: {
        user_id: userId,
        balance: {
          gt: 0, // Only return assets with positive balance
        },
      },
      include: {
        asset: true,
      },
    });

    return NextResponse.json(userAssets);
  } catch (error) {
    console.error('Error fetching user assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user assets' },
      { status: 500 }
    );
  }
}