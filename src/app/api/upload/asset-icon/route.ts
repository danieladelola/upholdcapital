import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const UPLOAD_DIR = join(process.cwd(), 'public', 'asseticons');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const symbol = formData.get('symbol') as string;

    // Validation
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!symbol) {
      return NextResponse.json(
        { error: 'No symbol provided' },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.name.toLowerCase().endsWith('.svg') && file.type !== 'image/svg+xml') {
      return NextResponse.json(
        { error: 'Only SVG files are allowed' },
        { status: 400 }
      );
    }

    // Check file size (max 500KB for SVG)
    const MAX_FILE_SIZE = 500 * 1024; // 500KB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size must be less than 500KB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // Save file with symbol as filename
    const filename = `${symbol.toUpperCase()}.svg`;
    const filepath = join(UPLOAD_DIR, filename);

    await writeFile(filepath, buffer);

    // Return the public URL
    const logoUrl = `/asseticons/${filename}`;

    return NextResponse.json({
      success: true,
      filename,
      logoUrl,
      message: `Asset icon for ${symbol} uploaded successfully`
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload file' },
      { status: 500 }
    );
  }
}
