import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters long"),
});

export async function PATCH(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const validatedData = changePasswordSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Get current user with password hash
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true },
    });

    if (!currentUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      validatedData.data.currentPassword,
      currentUser.passwordHash
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { message: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(validatedData.data.newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedNewPassword },
    });

    return NextResponse.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}