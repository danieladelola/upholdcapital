import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasPermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { db } from "@/lib/firebase";
import { User } from "types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: currentUserId } = auth();
    if (!currentUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const isAdmin = await hasPermission(currentUserId, PERMISSIONS.ADMIN_DASHBOARD);
    if (!isAdmin) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { userId } = params;
    const { role } = await req.json();

    if (!role || (role !== "trader" && role !== "user")) {
      return new NextResponse("Invalid role specified", { status: 400 });
    }

    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return new NextResponse("User not found", { status: 404 });
    }

    await userRef.update({ role });

    // Log the action
    await db.collection("audit_logs").add({
      adminId: currentUserId,
      userId,
      action: "update_role",
      role,
      timestamp: new Date(),
    });

    const updatedUser = (await userRef.get()).data() as User;

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user role:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
