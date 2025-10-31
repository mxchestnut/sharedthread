// Edge Runtime compatible auth utilities for middleware
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { AuthUser } from '@/types/auth';
import { logError } from '@/lib/error-logger';


const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'development-secret-change-for-production'
);

const SESSION_COOKIE_NAME = 'shared-thread-session';

// Mock users for middleware checks (edge runtime compatible)
const middlewareUsers = [
  {
    id: '1',
    username: 'demo',
    email: 'demo@sharedthread.co',
    role: 'member',
  },
  {
    id: '2',
    username: 'admin',
    email: 'admin@sharedthread.co',
    role: 'admin',
  },
];

export async function getCurrentUserMiddleware(request?: Request): Promise<AuthUser | null> {
  try {
    let sessionToken: string | null = null;
    
    if (request) {
      // Get cookie from request headers in middleware
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = decodeURIComponent(value || '');
          return acc;
        }, {} as Record<string, string>);
        sessionToken = cookies[SESSION_COOKIE_NAME];
      }
    } else {
      // Fallback to cookies() for non-middleware usage
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
      sessionToken = sessionCookie?.value || null;
    }
    
    if (!sessionToken) {
      return null;
    }

    const { payload } = await jwtVerify(sessionToken, JWT_SECRET);
    const userId = payload.sub;
    
    if (!userId) {
      return null;
    }

    // Find user in mock data
    const user = middlewareUsers.find(u => u.id === userId);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.username, // Use username as display name in middleware
      role: user.role as 'admin' | 'member',
    };
  } catch (error) {
    logError('Error verifying session:', error);
    return null;
  }
}