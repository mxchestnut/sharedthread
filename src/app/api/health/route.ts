// Simple test endpoint that doesn't use Prisma
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { 
      success: true, 
      message: 'API routes are working',
      timestamp: new Date().toISOString(),
      env: {
        nodeEnv: process.env.NODE_ENV,
        hasDatabase: !!process.env.DATABASE_URL,
        port: process.env.PORT
      }
    },
    { status: 200 }
  );
}