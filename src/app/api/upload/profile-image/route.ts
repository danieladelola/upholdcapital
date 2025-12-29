import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;
    const userId: string = data.get("userId") as string;

    if (!file || !userId) {
      return NextResponse.json({ error: "Missing file or userId" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const filename = `${userId}-${Date.now()}-${file.name}`;
    const filepath = path.join(process.cwd(), "public", "uploads", filename);

    // Ensure uploads directory exists
    await mkdir(path.dirname(filepath), { recursive: true });

    // Write file
    await writeFile(filepath, buffer);

    // Update user profileImage
    const imageUrl = `/uploads/${filename}`;
    await prisma.user.update({
      where: { id: userId },
      data: { profileImage: imageUrl },
    });

    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}