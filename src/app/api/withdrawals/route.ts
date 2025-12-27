import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(req);
    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const withdrawals = await prisma.withdrawal.findMany({
      where: {
        userId: currentUser.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(withdrawals);
  } catch (error) {
    console.error("Error fetching withdrawals:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}