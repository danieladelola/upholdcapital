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
    const normalizedSymbol = assetIdentifier.toUpperCase();
    console.log(`[executeTrade] Starting trade for asset: ${assetIdentifier} (normalized: ${normalizedSymbol})`);
    
    // Find asset by ID or symbol
    let asset = await prisma.asset.findUnique({
      where: { id: assetIdentifier },
    })

    if (!asset) {
      console.log(`[executeTrade] Asset not found by ID, trying by symbol: ${normalizedSymbol}`);
      asset = await prisma.asset.findUnique({
        where: { symbol: normalizedSymbol },
      })
    }

    // If asset doesn't exist, create it with the provided price
    if (!asset) {
      console.log(`[executeTrade] Asset ${normalizedSymbol} not found in database. Creating new asset...`);
      try {
        asset = await prisma.asset.create({
          data: {
            symbol: normalizedSymbol,
            name: normalizedSymbol,
            priceUsd: priceUsd || 0,
            logoUrl: `/asseticons/${normalizedSymbol}.svg`,
          },
        })
        console.log(`[executeTrade] Asset ${normalizedSymbol} created successfully with ID: ${asset.id}`);
      } catch (createError) {
        console.error(`[executeTrade] Error creating asset ${normalizedSymbol}:`, createError);
        // Try to fetch it again in case of race condition (unique constraint error)
        try {
          asset = await prisma.asset.findUnique({
            where: { symbol: normalizedSymbol },
          })
          if (asset) {
            console.log(`[executeTrade] Asset ${normalizedSymbol} found after retry with ID: ${asset.id}`);
          } else {
            console.error(`[executeTrade] Asset ${normalizedSymbol} still not found after retry`);
            throw new Error(`Failed to create or find asset: ${normalizedSymbol}. Error: ${createError instanceof Error ? createError.message : String(createError)}`);
          }
        } catch (retryError) {
          console.error(`[executeTrade] Retry fetch failed for asset ${normalizedSymbol}:`, retryError);
          throw new Error(`Failed to create or find asset: ${normalizedSymbol}`);
        }
      }
    } else {
      console.log(`[executeTrade] Asset found: ${asset.symbol} (ID: ${asset.id})`);
    }

    // Start a transaction
    if (!asset || !asset.id) {
      throw new Error(`Asset object is invalid: ${JSON.stringify(asset)}`);
    }
    
    console.log(`[executeTrade] Proceeding with asset: ${asset.symbol} (ID: ${asset.id})`);

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
    const errorMessage = error instanceof Error ? error.message : "Trade failed";
    console.error("Trade execution failed:", errorMessage);
    console.error("Full error:", error);
    return {
      success: false,
      error: errorMessage,
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