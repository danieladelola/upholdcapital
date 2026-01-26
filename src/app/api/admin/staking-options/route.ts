
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
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      id,
      stakingEnabled,
      stakeMin,
      stakeMax,
      stakeRoi,
      stakeCycleDays,
    } = body

    if (!id) {
      return NextResponse.json({ error: 'Asset ID is required' }, { status: 400 })
    }

    const updatedAsset = await prisma.asset.update({
      where: { id },
      data: {
        stakingEnabled,
        stakeMin,
        stakeMax,
        stakeRoi,
        stakeCycleDays,
      },
    })

    return NextResponse.json(updatedAsset)
  } catch (error) {
    console.error('Error creating staking option:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}