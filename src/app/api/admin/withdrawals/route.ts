import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(req);
    if (!currentUser || currentUser.role !== 'admin') {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const withdrawals = await prisma.withdrawal.findMany({
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform user fields to match frontend
    const transformedWithdrawals = withdrawals.map(withdrawal => ({
      ...withdrawal,
      user: {
        ...withdrawal.user,
        firstname: withdrawal.user.firstName,
        lastname: withdrawal.user.lastName,
      },
    }));

    return NextResponse.json(transformedWithdrawals);
  } catch (error) {
    console.error("Error fetching withdrawals:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}