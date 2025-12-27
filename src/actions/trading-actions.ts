"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function executeTrade(
  userId: string,
  assetIdentifier: string, // Can be asset ID or symbol
  tradeType: "buy" | "sell",
  amount: number,
  priceUsd: number
) {
  try {
    // Find asset by ID or symbol
    let asset = await prisma.asset.findUnique({
      where: { id: assetIdentifier },
    })

    if (!asset) {
      asset = await prisma.asset.findUnique({
        where: { symbol: assetIdentifier },
      })
    }

    if (!asset) {
      throw new Error("Asset not found")
    }

    // Start a transaction
    await prisma.$transaction(async (tx) => {
      // Get or create user asset record
      let userAsset = await tx.userAsset.findUnique({
        where: {
          user_id_asset_id: {
            user_id: userId,
            asset_id: asset.id,
          },
        },
      })

      if (!userAsset) {
        userAsset = await tx.userAsset.create({
          data: {
            user_id: userId,
            asset_id: asset.id,
            balance: 0,
          },
        })
      }

      const totalValue = amount * priceUsd

      if (tradeType === "buy") {
        // Check if user has sufficient balance
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { usdBalance: true },
        })

        if (!user || (user.usdBalance || 0) < totalValue) {
          throw new Error("Insufficient funds")
        }

        // Update user balance
        await tx.user.update({
          where: { id: userId },
          data: {
            usdBalance: {
              decrement: totalValue,
            },
          },
        })

        // Update user asset balance
        await tx.userAsset.update({
          where: {
            user_id_asset_id: {
              user_id: userId,
              asset_id: asset.id,
            },
          },
          data: {
            balance: {
              increment: amount,
            },
          },
        })
      } else if (tradeType === "sell") {
        // Check if user has sufficient asset balance
        if (userAsset.balance < amount) {
          throw new Error("Insufficient asset balance")
        }

        // Update user balance
        await tx.user.update({
          where: { id: userId },
          data: {
            usdBalance: {
              increment: totalValue,
            },
          },
        })

        // Update user asset balance
        await tx.userAsset.update({
          where: {
            user_id_asset_id: {
              user_id: userId,
              asset_id: asset.id,
            },
          },
          data: {
            balance: {
              decrement: amount,
            },
          },
        })
      }

      // Create trade record
      await tx.trade.create({
        data: {
          user_id: userId,
          asset_id: asset.id,
          trade_type: tradeType,
          amount: amount,
          price_usd: priceUsd,
        },
      })
    })

    revalidatePath("/trading")
    revalidatePath("/assets")

    return { success: true }
  } catch (error) {
    console.error("Trade execution failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Trade failed",
    }
  }
}

export async function getUserAssets(userId: string) {
  try {
    const userAssets = await prisma.userAsset.findMany({
      where: { user_id: userId },
      include: {
        asset: true,
      },
    })

    return userAssets
  } catch (error) {
    console.error("Failed to get user assets:", error)
    return []
  }
}

export async function getUserTrades(userId: string) {
  try {
    const trades = await prisma.trade.findMany({
      where: { user_id: userId },
      include: {
        asset: true,
      },
      orderBy: {
        created_at: "desc",
      },
    })

    return trades
  } catch (error) {
    console.error("Failed to get user trades:", error)
    return []
  }
}