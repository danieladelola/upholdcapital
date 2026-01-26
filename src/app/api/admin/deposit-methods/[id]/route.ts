import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getUserFromRequest(req);
    if (!currentUser || currentUser.role !== 'admin') {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { id } = await params;
    const { name, description, cryptoType, network, networkName, address, enabled } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const method = await prisma.depositMethod.update({
      where: { id },
      data: {
        name,
        description,
        cryptoType,
        network,
        networkName,
        address,
        enabled,
      },
    });

    return NextResponse.json(method);
  } catch (error) {
    console.error("Error updating deposit method:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getUserFromRequest(req);
    if (!currentUser || currentUser.role !== 'admin') {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { id } = await params;

    await prisma.depositMethod.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting deposit method:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
