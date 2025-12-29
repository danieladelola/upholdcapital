import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, context: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await context.params;

    const currentUser = await getUserFromRequest(req);
    if (!currentUser || currentUser.role !== 'admin') {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { amount } = await req.json();
    if (typeof amount !== 'number') {
      return new NextResponse("Invalid amount", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const newBalance = (user.balance || 0) + amount;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { balance: newBalance },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user balance:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}