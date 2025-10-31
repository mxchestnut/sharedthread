import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCurrentUserMiddleware } from '@/lib/auth-middleware';
import { checkTailscaleAccess } from '@/lib/tailscale';
import { logError } from '@/lib/error-logger';


// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/auth/signin',
  '/auth/signup',
  '/auth/verify',
  '/auth/error',
  '/api/auth',
  '/api/debug'
];

// Admin-only routes (requires admin role + Tailscale VPN)
const adminRoutes = [
  '/staff',
  '/api/staff'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API auth routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/static/') ||
    publicRoutes.some(route => pathname.startsWith(route))
  ) {
    return NextResponse.next();
  }

  try {
    // Get current user
    const user = await getCurrentUserMiddleware(request);

    // Redirect to login if not authenticated
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check for admin routes - requires Tailscale VPN + admin role
    if (adminRoutes.some(route => pathname.startsWith(route))) {
      // First, check Tailscale VPN access
      const tailscaleCheck = checkTailscaleAccess(request);
      
      if (!tailscaleCheck.allowed) {
        console.warn(`Tailscale access denied for ${pathname}:`, {
          ip: tailscaleCheck.ip,
          reason: tailscaleCheck.reason,
          user: user.email,
        });
        
        return NextResponse.json(
          { 
            error: 'Access Denied',
            message: 'Staff pages require VPN access. Please connect to Tailscale.',
            details: process.env.NODE_ENV === 'development' ? tailscaleCheck.reason : undefined,
          },
          { status: 403 }
        );
      }

      // Then, check admin role
      if (user.role !== 'admin') {
        console.warn(`Admin role required for ${pathname}:`, {
          user: user.email,
          role: user.role,
          ip: tailscaleCheck.ip,
        });
        
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        );
      }

      // Log successful admin access
      console.log(`Admin access granted to ${pathname}:`, {
        user: user.email,
        ip: tailscaleCheck.ip,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.next();

  } catch (error) {
    logError('Middleware error:', error);
    
    // Redirect to login on auth errors
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};