// Debug endpoint to check Sentry and Prisma
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function GET() {
  try {
    // Test Sentry
    console.log('Testing Sentry capture...');
    Sentry.captureMessage('Debug endpoint accessed - Sentry is working');
    
    // Test Prisma import
    console.log('Testing Prisma import...');
    const { prisma } = await import('@/lib/prisma');
    console.log('Prisma imported successfully');
    
    // Test database connection
    console.log('Testing database connection...');
    const userCount = await prisma.user.count();
    console.log(`Database connection successful. User count: ${userCount}`);
    
    return NextResponse.json({
      success: true,
      message: 'All systems working',
      checks: {
        sentry: 'OK',
        prisma: 'OK',
        database: 'OK',
        userCount
      }
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    
    // Capture error with Sentry
    Sentry.captureException(error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}