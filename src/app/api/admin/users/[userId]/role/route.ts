import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, hasPermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/db";

// PATCH: update user role
export async function PATCH(req: NextRequest, context: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await context.params;

    const currentUser = await getUserFromRequest(req);
    if (!currentUser) return new NextResponse("Unauthorized", { status: 401 });

    const isAdmin = await hasPermission(currentUser.id, PERMISSIONS.ADMIN_DASHBOARD);
    if (!isAdmin) return new NextResponse("Forbidden", { status: 403 });

    const { role } = await req.json();
    if (!role || (role !== "trader" && role !== "user"))
      return new NextResponse("Invalid role specified", { status: 400 });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    // TODO: log the action if needed

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user role:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
