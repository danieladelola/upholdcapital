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
          userId_assetId: {
            userId: userId,
            assetId: asset.id,
          },
        },
      })

      if (!userAsset) {
        userAsset = await tx.userAsset.create({
          data: {
            userId: userId,
            assetId: asset.id,
            balance: 0,
          },
        })
      }

      const totalValue = amount * priceUsd

      if (tradeType === "buy") {
        // Check if user has sufficient balance
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { balance: true },
        })

        if (!user || (user.balance || 0) < totalValue) {
          throw new Error("Insufficient funds")
        }

        // Update user balance
        await tx.user.update({
          where: { id: userId },
          data: {
            balance: {
              decrement: totalValue,
            },
          },
        })

        // Update user asset balance
        await tx.userAsset.update({
          where: {
            userId_assetId: {
              userId: userId,
              assetId: asset.id,
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
            balance: {
              increment: totalValue,
            },
          },
        })

        // Update user asset balance
        await tx.userAsset.update({
          where: {
            userId_assetId: {
              userId: userId,
              assetId: asset.id,
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
          userId: userId,
          assetId: asset.id,
          tradeType: tradeType,
          amount: amount,
          priceUsd: priceUsd,
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
      where: { userId: userId },
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
      where: { userId: userId },
      include: {
        asset: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return trades
  } catch (error) {
    console.error("Failed to get user trades:", error)
    return []
  }
}