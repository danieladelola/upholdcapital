import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById, getAdminById } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  let user;
  if (decoded.role === 'admin') {
    const admin = await getAdminById(decoded.id);
    if (!admin) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    // Return admin as user-like object
    user = {
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
  } else {
    user = await getUserById(decoded.id);
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    const { password_hash, ...userWithoutPassword } = user;
    user = userWithoutPassword;
  }

  return NextResponse.json({ user });
}