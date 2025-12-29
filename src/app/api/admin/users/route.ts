import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, hasPermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(req);
    if (!currentUser) return new NextResponse("Unauthorized", { status: 401 });

    const isAdmin = currentUser.role === 'admin';
    if (!isAdmin) return new NextResponse("Forbidden", { status: 403 });

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        balance: true,
        role: true,
        verified: true,
        createdAt: true,
      },
    });

    // Transform to match frontend interface
    const transformedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      firstname: user.firstName,
      lastname: user.lastName,
      usdBalance: user.balance,
      role: user.role,
      verified: user.verified,
      created_at: user.createdAt,
    }));

    return NextResponse.json(transformedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}