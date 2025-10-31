import { NextRequest, NextResponse } from 'next/server';
import { getSession, verifyTOTP, setSessionCookie } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { TOTPVerification, AuthResponse } from '@/types/auth';
import { logInfo, logError } from '@/lib/error-logger';


export async function POST(request: NextRequest) {
  try {
    const body: TOTPVerification = await request.json();
    const { sessionId, totpCode } = body;

    if (!sessionId || !totpCode) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: 'Session ID and TOTP code are required'
      }, { status: 400 });
    }

    logInfo('TOTP verification - sessionId:', sessionId);
    const session = await getSession(sessionId);
    logInfo('TOTP verification - session found:', !!session);
    
    if (!session) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: 'Invalid or expired session'
      }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        totpSecret: true,
      }
    });

    if (!user) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: 'User not found'
      }, { status: 401 });
    }

    const isValidTOTP = verifyTOTP(user.totpSecret || '', totpCode);
    if (!isValidTOTP) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: 'Invalid TOTP code'
      }, { status: 401 });
    }

    // TOTP verified, use the existing session
    await setSessionCookie(sessionId);

    return NextResponse.json<AuthResponse>({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl || undefined,
        role: user.role.toLowerCase() as 'member' | 'admin',
      }
    });

  } catch (error) {
    logError('TOTP verification error:', error);
    return NextResponse.json<AuthResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}