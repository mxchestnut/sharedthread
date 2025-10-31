import { NextResponse } from 'next/server';

// Debug endpoint disabled in production for security
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({
      error: 'Debug endpoints are disabled in production'
    }, { status: 403 });
  }
  
  return NextResponse.json({
    error: 'Debug endpoint - use only in development',
    message: 'This endpoint is disabled for security. Use /api/auth/me instead.'
  }, { status: 403 });
}