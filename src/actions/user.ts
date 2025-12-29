"use server";

import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const updateUserProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export async function updateUserProfile(userId: string, data: unknown) {
  const validatedData = updateUserProfileSchema.safeParse(data);

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
    return { success: true, user: updatedUser };
  } catch (error) {
    return { success: false, error: "Failed to update user profile." };
  }
}

const updateUserProfileImageSchema = z.object({
  profileImage: z.string().url("Invalid URL"),
});

export async function updateUserProfileImage(userId: string, data: unknown) {
  const validatedData = updateUserProfileImageSchema.safeParse(data);

  if (!validatedData.success) {
    return {
      success: false,
      error: validatedData.error.flatten().fieldErrors,
    };
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        profileImage: validatedData.data.profileImage,
      },
    });
    return { success: true, user: updatedUser };
  } catch (error) {
    return { success: false, error: "Failed to update user profile image." };
  }
}
