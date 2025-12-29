
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const { assetId } = await params
  try {
    const body = await request.json()
    const {
      stakingEnabled,
      stakeMin,
      stakeMax,
      stakeRoi,
      stakeCycleDays,
    } = body

    const updatedAsset = await prisma.asset.update({
      where: { id: assetId },
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
    console.error(`Error updating staking options for asset ${assetId}:`, error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
