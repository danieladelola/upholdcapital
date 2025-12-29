"use server";

import { prisma } from "@/lib/db";
import { z } from "zod";

export async function getUsers({ page = 1, limit = 10, search = "", role }: { page?: number; limit?: number; search?: string; role?: string }) {
  const skip = (page - 1) * limit;
  const where: any = {};
  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
    ];
  }
  if (role) {
    where.role = role;
  }

  const users = await prisma.user.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  const total = await prisma.user.count({ where });

  return { success: true, users, totalPages: Math.ceil(total / limit), currentPage: page };
}

const updateUserByAdminSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  profileImage: z.string().optional(),
  balance: z.number().optional(),
  role: z.enum(["USER", "TRADER", "ADMIN"]).optional(),
});

export async function updateUserAsAdmin(adminId: string, userId: string, data: unknown) {
  const validatedData = updateUserByAdminSchema.safeParse(data);

  if (!validatedData.success) {
    return {
      success: false,
      error: validatedData.error.flatten().fieldErrors,
    };
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: validatedData.data,
    });

    // Log audit
    await prisma.adminAuditLog.create({
      data: {
        adminId,
        userId,
        action: "UPDATE_USER",
        details: validatedData.data,
      },
    });

    return { success: true, user: updatedUser };
  } catch (error) {
    return { success: false, error: "Failed to update user." };
  }
}

export async function updateUserBalance(adminId: string, userId: string, data: { amount: number }) {
  const { amount } = data;
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, error: "User not found" };

    const newBalance = (user.balance || 0) + amount;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { balance: newBalance },
    });

    // Log audit
    await prisma.adminAuditLog.create({
      data: {
        adminId,
        userId,
        action: "UPDATE_BALANCE",
        details: { amountChange: amount, newBalance },
      },
    });

    return { success: true, user: updatedUser };
  } catch (error) {
    return { success: false, error: "Failed to update balance." };
  }
}

export async function updateUserRole(adminId: string, userId: string, newRole: "USER" | "TRADER" | "ADMIN") {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    // Log audit
    await prisma.adminAuditLog.create({
      data: {
        adminId,
        userId,
        action: "CHANGE_ROLE",
        details: { newRole },
      },
    });

    return { success: true, user: updatedUser };
  } catch (error) {
    return { success: false, error: "Failed to change role." };
  }
}