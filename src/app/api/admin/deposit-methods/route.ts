import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const methods = await prisma.depositMethod.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(methods);
  } catch (error) {
    console.error("Error fetching deposit methods:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(req);
    if (!currentUser || currentUser.role !== 'admin') {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { name, description, cryptoType, network, networkName, address, enabled } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const method = await prisma.depositMethod.create({
      data: {
        name,
        description,
        cryptoType,
        network,
        networkName,
        address,
        enabled: enabled !== undefined ? enabled : true,
      },
    });

    return NextResponse.json(method);
  } catch (error) {
    console.error("Error creating deposit method:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}