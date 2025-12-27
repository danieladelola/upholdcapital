import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './db';
import { User } from '../../types';
import { rolePermissions } from './permissions';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = '7d';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface Admin {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    firstname: user.firstname || '',
    lastname: user.lastname || '',
    initials: user.initials || '',
    usdBalance: user.usdBalance || 0,
    currency: user.currency || 'USD',
    phoneNumber: user.phoneNumber || '',
    country: user.country || '',
    photoURL: user.photoURL || '',
    displayName: user.displayName || '',
    verified: user.verified || false,
    wallets: user.wallets as any || [],
    assets: user.assets as any || [],
    role: user.role as any || 'user',
    password_hash: user.password_hash,
    created_at: user.created_at,
  };
}

export async function createUser(email: string, password: string, firstname: string, lastname: string): Promise<User> {
  const password_hash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      password_hash,
      firstname,
      lastname,
      initials: `${firstname[0]}${lastname[0]}`.toUpperCase(),
      displayName: `${firstname} ${lastname}`,
    },
  });
  return {
    id: user.id,
    email: user.email,
    firstname: user.firstname || '',
    lastname: user.lastname || '',
    initials: user.initials || '',
    usdBalance: user.usdBalance || 0,
    currency: user.currency || 'USD',
    phoneNumber: user.phoneNumber || '',
    country: user.country || '',
    photoURL: user.photoURL || '',
    displayName: user.displayName || '',
    verified: user.verified || false,
    wallets: user.wallets as any || [],
    assets: user.assets as any || [],
    role: user.role as any || 'user',
    password_hash: user.password_hash,
    created_at: user.created_at,
  };
}

export async function getUserById(id: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  if (!user) return null;
  return getUserByEmail(user.email);
}

export async function getAdminByEmail(email: string): Promise<Admin | null> {
  const admin = await prisma.admin.findUnique({
    where: { email },
  });
  if (!admin) return null;
  return {
    id: admin.id,
    email: admin.email,
    password_hash: admin.password_hash,
    created_at: admin.created_at,
  };
}

export async function getAdminById(id: string): Promise<Admin | null> {
  const admin = await prisma.admin.findUnique({
    where: { id },
  });
  if (!admin) return null;
  return {
    id: admin.id,
    email: admin.email,
    password_hash: admin.password_hash,
    created_at: admin.created_at,
  };
}

export async function createAdmin(email: string, password: string): Promise<Admin> {
  const password_hash = await hashPassword(password);
  const admin = await prisma.admin.create({
    data: {
      email,
      password_hash,
    },
  });
  return {
    id: admin.id,
    email: admin.email,
    password_hash: admin.password_hash,
    created_at: admin.created_at,
  };
}

export async function getUserFromRequest(request: Request): Promise<AuthUser | null> {
  const cookie = request.headers.get('cookie');
  if (!cookie) return null;
  const tokenMatch = cookie.match(/auth-token=([^;]+)/);
  if (!tokenMatch) return null;
  return verifyToken(tokenMatch[1]);
}

export async function hasPermission(
  userId: string,
  featureName: string
): Promise<boolean> {
  const user = await getUserById(userId);

  if (!user || !user.role) {
    return false;
  }

  const permissions = rolePermissions[user.role];

  if (!permissions) {
    return false;
  }

  return permissions.includes(featureName);
}
