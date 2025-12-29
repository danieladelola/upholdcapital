import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(req);
    if (!currentUser || currentUser.role !== 'admin') {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const deposits = await prisma.deposit.findMany({
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
    const transformedDeposits = deposits.map(deposit => ({
      ...deposit,
      user: {
        ...deposit.user,
        firstname: deposit.user.firstName,
        lastname: deposit.user.lastName,
      },
    }));

    return NextResponse.json(transformedDeposits);
  } catch (error) {
    console.error("Error fetching deposits:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}