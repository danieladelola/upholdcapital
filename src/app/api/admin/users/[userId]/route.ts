import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const updateUserSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  profileImage: z.string().optional(),
  role: z.enum(["USER", "TRADER", "ADMIN"]).optional(),
  status: z.enum(["active", "deactivated"]).optional(),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
});

export async function GET(req: NextRequest, context: { params: Promise<{ userId: string }> }) {
  try {
    const currentUser = await getUserFromRequest(req);
    if (!currentUser || currentUser.role !== 'admin') {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { userId } = await context.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        balance: true,
        role: true,
        verified: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
        status: true,
        phone: true,
        address: true,
        profileImage: true,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ userId: string }> }) {
  try {
    const currentUser = await getUserFromRequest(req);
    if (!currentUser || currentUser.role !== 'admin') {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { userId } = await context.params;
    const body = await req.json();
    const validatedData = updateUserSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Check if email is already taken by another user
    if (validatedData.data.email) {
      const existingUser = await prisma.user.findFirst({
        where: { email: validatedData.data.email, id: { not: userId } },
      });
      if (existingUser) {
        return NextResponse.json(
          { message: "Email already in use" },
          { status: 400 }
        );
      }
    }

    const updateData: any = { ...validatedData.data };

    // Hash password if provided
    if (validatedData.data.password) {
      updateData.passwordHash = await bcrypt.hash(validatedData.data.password, 12);
      delete updateData.password;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        balance: true,
        role: true,
        verified: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
        status: true,
        phone: true,
        address: true,
        profileImage: true,
      },
    });

    // Log the action
    await prisma.adminAuditLog.create({
      data: {
        adminId: currentUser.id,
        userId: userId,
        action: "UPDATE_USER",
        details: { updatedFields: Object.keys(updateData) },
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ userId: string }> }) {
  try {
    const currentUser = await getUserFromRequest(req);
    if (!currentUser || currentUser.role !== 'admin') {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { userId } = await context.params;

    // Prevent deleting self
    if (currentUser.id === userId) {
      return NextResponse.json(
        { message: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: userId },
    });

    // Log the action
    await prisma.adminAuditLog.create({
      data: {
        adminId: currentUser.id,
        userId: userId,
        action: "DELETE_USER",
        details: { deletedUser: { email: user.email, role: user.role } },
      },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}