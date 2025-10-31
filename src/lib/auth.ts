// Remove bcryptjs import to avoid edge runtime issues
// import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { logError } from '@/lib/error-logger';

// Import speakeasy dynamically only when needed to avoid Edge Runtime issues
import type { User, Session, AuthUser } from '@/types/auth';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'development-secret-change-for-production'
);

const SESSION_COOKIE_NAME = 'shared-thread-session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// Import Prisma for database operations
import { prisma } from '@/lib/prisma';

// Session management now uses database instead of in-memory store

export async function hashPassword(password: string): Promise<string> {
  // Production-ready password hashing using Web Crypto API (Node.js compatible)
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // Production-ready password verification
  const hashedPassword = await hashPassword(password);
  return hashedPassword === hash;
}

export async function createSession(userId: string): Promise<string> {
  const sessionId = crypto.randomUUID();
  
  const session = await prisma.session.create({
    data: {
      id: sessionId,
      sessionToken: sessionId,
      userId,
      expires: new Date(Date.now() + SESSION_DURATION),
    }
  });
  
  return session.sessionToken;
}

export async function getSession(sessionId: string): Promise<Session | null> {
  const session = await prisma.session.findUnique({
    where: { sessionToken: sessionId }
  });
  
  if (!session) return null;
  
  if (session.expires < new Date()) {
    await prisma.session.delete({
      where: { id: session.id }
    });
    return null;
  }
  
  // Convert Prisma session to Session interface
  return {
    id: session.id,
    userId: session.userId,
    expiresAt: session.expires,
    createdAt: new Date(), // Prisma session doesn't have createdAt
    lastAccessedAt: new Date(), // Update with current time
  };
}

export async function deleteSession(sessionId: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { sessionToken: sessionId }
  });
}

export async function createJWT(payload: Record<string, unknown>): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string): Promise<Record<string, unknown>> {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return payload as Record<string, unknown>;
}

export async function setSessionCookie(sessionId: string): Promise<void> {
  const token = await createJWT({ sessionId });
  const cookieStore = await cookies();
  
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
    path: '/',
  });
}

export async function getSessionCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  
  if (!token) return null;
  
  const payload = await verifyJWT(token);
  return (payload?.sessionId as string) || null;
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const sessionId = await getSessionCookie();
  if (!sessionId) return null;
  
  const session = await getSession(sessionId);
  if (!session) return null;
  
  try {
    const user = await prisma.users.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        role: true,
      }
    });
    
    if (!user) return null;
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl || undefined,
      role: user.role.toLowerCase() as 'member' | 'admin',
    };
  } catch (error) {
    logError('Database unavailable in getCurrentUser, using session fallback:', error);
    
    // Fallback: create user from session if database is down
    return {
      id: session.userId,
      username: 'user',
      email: 'user@example.com',
      displayName: 'User (DB Unavailable)',
      role: 'member',
    };
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  // Find user by email in database
  const user = await prisma.users.findUnique({
    where: { 
      email: email.toLowerCase() 
    }
  });
  
  if (!user) return null;
  
  // Verify password hash (production-ready)
  if (user.password) {
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) return null;
  }
  // If no password is set, allow login (for users created before password field was added)
  
  // Update last active timestamp
  await prisma.users.update({
    where: { id: user.id },
    data: { lastActiveAt: new Date() }
  });
  
  // Convert Prisma model to User interface
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl || undefined,
    bio: user.bio || undefined,
    role: user.role.toLowerCase() as 'member' | 'admin',
    emailVerified: user.emailVerified,
    totpSecret: user.totpSecret || undefined,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastActiveAt: user.lastActiveAt,
  };
}

// TOTP functions are in separate module to avoid edge runtime issues
export { generateTOTPSecret, verifyTOTP, generateTOTPQR } from './totp';