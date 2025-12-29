import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";

export async function PATCH(req: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(req);
    if (!currentUser || currentUser.role !== 'admin') {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { action, userIds } = await req.json();

    if (!action || !userIds || !Array.isArray(userIds)) {
      return NextResponse.json(
        { message: "Missing action or userIds" },
        { status: 400 }
      );
    }

    let updateData: any = {};
    let logAction = "";
    let logDetails: any = { userIds };

    switch (action) {
      case "activate":
        updateData.status = "active";
        logAction = "BULK_ACTIVATE_USERS";
        break;
      case "deactivate":
        updateData.status = "deactivated";
        logAction = "BULK_DEACTIVATE_USERS";
        break;
      case "reset_passwords":
        // Generate a default password for each user
        const defaultPassword = "TempPass123!";
        const hashedPassword = await bcrypt.hash(defaultPassword, 12);
        updateData.passwordHash = hashedPassword;
        logAction = "BULK_RESET_PASSWORDS";
        logDetails.defaultPassword = defaultPassword;
        break;
      default:
        return NextResponse.json(
          { message: "Invalid action" },
          { status: 400 }
        );
    }

    // Update users
    const result = await prisma.user.updateMany({
      where: {
        id: { in: userIds },
        // Prevent updating self if deactivating
        ...(action === "deactivate" && { id: { not: currentUser.id } }),
      },
      data: updateData,
    });

    // Log the action
    await prisma.adminAuditLog.create({
      data: {
        adminId: currentUser.id,
        userId: currentUser.id, // Use admin's ID as reference
        action: logAction,
        details: logDetails,
      },
    });

    return NextResponse.json({
      message: `Successfully updated ${result.count} users`,
      count: result.count
    });
  } catch (error) {
    console.error("Error performing bulk action:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}