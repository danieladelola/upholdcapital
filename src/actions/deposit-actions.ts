"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createDeposit(
  userId: string,
  amount: number,
  method: string,
  proofImage?: string
) {
  try {
    const deposit = await prisma.deposit.create({
      data: {
        userId,
        amount,
        method,
        proofImage,
        status: "pending",
      },
    });
    revalidatePath("/admin");
    return deposit;
  } catch (error) {
    console.error("Error creating deposit:", error);
    throw new Error("Failed to create deposit");
  }
}

export async function approveDeposit(depositId: string) {
  try {
    const deposit = await prisma.deposit.findUnique({
      where: { id: depositId },
    });
    if (!deposit) {
      throw new Error("Deposit not found");
    }
    if (deposit.status !== "pending") {
      throw new Error("Deposit is not pending");
    }

    // Update deposit status
    await prisma.deposit.update({
      where: { id: depositId },
      data: { status: "approved" },
    });

    // Update user's usdBalance
    await prisma.user.update({
      where: { id: deposit.userId },
      data: {
        balance: {
          increment: deposit.amount,
        },
      },
    });

    revalidatePath("/admin");
    revalidatePath("/dashboard"); // Assuming user sees in dashboard
    return { success: true };
  } catch (error) {
    console.error("Error approving deposit:", error);
    throw error;
  }
}

export async function declineDeposit(depositId: string) {
  try {
    const deposit = await prisma.deposit.findUnique({
      where: { id: depositId },
    });
    if (!deposit) {
      throw new Error("Deposit not found");
    }
    if (deposit.status !== "pending") {
      throw new Error("Deposit is not pending");
    }

    // Update deposit status
    await prisma.deposit.update({
      where: { id: depositId },
      data: { status: "declined" },
    });

    revalidatePath("/admin");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error declining deposit:", error);
    throw error;
  }
}
