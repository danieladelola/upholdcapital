import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, hasPermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const createUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  profileImage: z.string().optional(),
  role: z.enum(["USER", "TRADER", "ADMIN"]),
  status: z.enum(["active", "deactivated"]).optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  balance: z.number().optional(),
  // Trader fields
  followers: z.number().optional(),
  winRate: z.number().optional(),
  wins: z.number().optional(),
  losses: z.number().optional(),
  traderTrades: z.number().optional(),
  minStartup: z.number().optional(),
}).refine((data) => {
  if (data.role === "TRADER") {
    return data.followers !== undefined &&
           data.winRate !== undefined &&
           data.wins !== undefined &&
           data.losses !== undefined &&
           data.traderTrades !== undefined &&
           data.minStartup !== undefined;
  }
  return true;
}, {
  message: "All trader fields are required when role is TRADER",
  path: ["role"],
});

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(req);
    if (!currentUser) return new NextResponse("Unauthorized", { status: 401 });

    const isAdmin = currentUser.role === 'admin';
    if (!isAdmin) return new NextResponse("Forbidden", { status: 403 });

    const body = await req.json();
    const validatedData = createUserSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Check if email or username is already taken
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.data.email },
          { username: validatedData.data.username }
        ]
      },
    });
    if (existingUser) {
      return NextResponse.json(
        { message: existingUser.email === validatedData.data.email ? "Email already in use" : "Username already in use" },
        { status: 400 }
      );
    }

    const createData: any = {
      firstName: validatedData.data.firstName,
      lastName: validatedData.data.lastName,
      username: validatedData.data.username,
      email: validatedData.data.email,
      phone: validatedData.data.phone,
      address: validatedData.data.address,
      profileImage: validatedData.data.profileImage,
      role: validatedData.data.role,
      status: validatedData.data.status || "active",
      passwordHash: await bcrypt.hash(validatedData.data.password, 12),
      balance: validatedData.data.balance || 0,
    };

    // Add trader fields if role is TRADER
    if (validatedData.data.role === "TRADER") {
      createData.followers = validatedData.data.followers;
      createData.winRate = validatedData.data.winRate;
      createData.wins = validatedData.data.wins;
      createData.losses = validatedData.data.losses;
      createData.traderTrades = validatedData.data.traderTrades;
      createData.minStartup = validatedData.data.minStartup;
    }

    const newUser = await prisma.user.create({
      data: createData,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        balance: true,
        role: true,
        verified: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
        status: true,
        phone: true,
        address: true,
        profileImage: true,
        followers: true,
        winRate: true,
        wins: true,
        losses: true,
        traderTrades: true,
        minStartup: true,
      },
    });

    // Log the action
    await prisma.adminAuditLog.create({
      data: {
        adminId: currentUser.id,
        userId: newUser.id,
        action: "CREATE_USER",
        details: { createdUser: { email: newUser.email, role: newUser.role } },
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

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
        username: true,
        firstName: true,
        lastName: true,
        balance: true,
        role: true,
        verified: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
        status: true,
        phone: true,
        address: true,
        profileImage: true,
        followers: true,
        winRate: true,
        wins: true,
        losses: true,
        traderTrades: true,
        minStartup: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform to match frontend interface
    const transformedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      balance: user.balance,
      role: user.role,
      verified: user.verified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.lastLogin,
      status: user.status,
      phone: user.phone,
      address: user.address,
      profileImage: user.profileImage,
      followers: user.followers,
      winRate: user.winRate,
      wins: user.wins,
      losses: user.losses,
      traderTrades: user.traderTrades,
      minStartup: user.minStartup,
    }));

    return NextResponse.json(transformedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}