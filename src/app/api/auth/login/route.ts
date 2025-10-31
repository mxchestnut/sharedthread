import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, createSession } from '@/lib/auth';
import { rateLimit, getClientIP, resetRateLimit } from '@/lib/rate-limit';
import type { LoginCredentials, AuthResponse } from '@/types/auth';
import { logInfo, logError } from '@/lib/error-logger';


export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 attempts per 15 minutes per IP
    const clientIP = getClientIP(request);
    const rateLimitResult = rateLimit(clientIP, 5, 15 * 60 * 1000);

    if (!rateLimitResult.success) {
      const resetDate = new Date(rateLimitResult.reset);
      return NextResponse.json<AuthResponse>({
        success: false,
        error: `Too many login attempts. Please try again after ${resetDate.toLocaleTimeString()}.`
      }, {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateLimitResult.reset - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(rateLimitResult.limit),
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          'X-RateLimit-Reset': String(rateLimitResult.reset),
        }
      });
    }

    const body: LoginCredentials = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 });
    }

    const user = await authenticateUser(email, password);
    if (!user) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 });
    }

    // Successful login - reset rate limit for this IP
    resetRateLimit(clientIP);

    // Check if user has TOTP enabled
    if (user.totpSecret) {
      // Create temporary session for TOTP verification
      const sessionId = await createSession(user.id);

      logInfo('Login - created session for TOTP:', sessionId);

      return NextResponse.json<AuthResponse>({
        success: true,
        requiresTOTP: true,
        sessionId,
      });
    }

    // No TOTP required, create full session
    const sessionId = await createSession(user.id);

    // Create JWT token for session
    const { createJWT } = await import('@/lib/auth');
    const token = await createJWT({ sessionId });

    // Create response and set cookie
    const response = NextResponse.json<AuthResponse>({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        role: user.role,
      }
    });

    // Set the session cookie
    response.cookies.set('shared-thread-session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/',
    });

    return response;

  } catch (error) {
    logError('Login error:', error);
    return NextResponse.json<AuthResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}