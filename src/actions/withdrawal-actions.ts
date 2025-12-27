"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createWithdrawal(userId: string, amountUsd: number) {
  try {
    // Check user balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { usdBalance: true },
    });
    if (!user || (user.usdBalance || 0) < amountUsd) {
      throw new Error("Insufficient balance");
    }

    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId,
        amountUsd,
        status: "pending",
      },
    });
    revalidatePath("/dashboard");
    return withdrawal;
  } catch (error) {
    console.error("Error creating withdrawal:", error);
    throw new Error("Failed to create withdrawal");
  }
}

export async function approveWithdrawal(withdrawalId: string) {
  try {
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
    });
    if (!withdrawal) {
      throw new Error("Withdrawal not found");
    }
    if (withdrawal.status !== "pending") {
      throw new Error("Withdrawal is not pending");
    }

    // Check balance again
    const user = await prisma.user.findUnique({
      where: { id: withdrawal.userId },
      select: { usdBalance: true },
    });
    if (!user || (user.usdBalance || 0) < withdrawal.amountUsd) {
      throw new Error("Insufficient balance");
    }

    // Update withdrawal status
    await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: { status: "approved" },
    });

    // Deduct from user's usdBalance
    await prisma.user.update({
      where: { id: withdrawal.userId },
      data: {
        usdBalance: {
          decrement: withdrawal.amountUsd,
        },
      },
    });

    revalidatePath("/admin");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error approving withdrawal:", error);
    throw error;
  }
}

export async function declineWithdrawal(withdrawalId: string) {
  try {
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
    });
    if (!withdrawal) {
      throw new Error("Withdrawal not found");
    }
    if (withdrawal.status !== "pending") {
      throw new Error("Withdrawal is not pending");
    }

    // Update withdrawal status
    await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: { status: "declined" },
    });

    revalidatePath("/admin");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error declining withdrawal:", error);
    throw error;
  }
}