import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie, getSessionCookie, deleteSession } from '@/lib/auth';
import { logError } from '@/lib/error-logger';


export async function POST(request: NextRequest) {
  try {
    const sessionId = await getSessionCookie();
    
    if (sessionId) {
      await deleteSession(sessionId);
    }
    
    await clearSessionCookie();

    return NextResponse.json({ success: true });
  } catch (error) {
    logError('Logout error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}