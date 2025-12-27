import { NextRequest, NextResponse } from 'next/server';
import { getAdminByEmail, verifyPassword, generateToken } from '@/lib/auth';
import { z } from 'zod';
import { cookies } from 'next/headers';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const admin = await getAdminByEmail(email);
    if (!admin || !admin.password_hash) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, admin.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = generateToken({
      id: admin.id,
      email: admin.email,
      role: 'admin',
    });

    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Return a user-like object for admin
    const userWithoutPassword = {
      id: admin.id,
      email: admin.email,
      firstname: 'Admin',
      lastname: 'User',
      initials: 'AU',
      usdBalance: 0,
      currency: 'USD',
      phoneNumber: '',
      country: '',
      photoURL: '',
      displayName: 'Admin User',
      verified: true,
      wallets: [],
      assets: [],
      role: 'admin' as const,
      created_at: admin.created_at,
    };

    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}