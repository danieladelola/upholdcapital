
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const assets = await prisma.asset.findMany({
      orderBy: {
        symbol: 'asc',
      },
    })
    return NextResponse.json(assets)
  } catch (error) {
    console.error('Error fetching staking options:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
