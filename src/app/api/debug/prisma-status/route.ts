import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function GET() {
  try {
    // Test 1: Check if prisma import works
    console.log('Testing Prisma import...');
    const { prisma } = await import('@/lib/prisma');
    console.log('Prisma imported successfully:', !!prisma);
    
    // Test 2: Check if prisma object has expected methods
    console.log('Prisma has user property:', !!prisma.users);
    console.log('Prisma user has findUnique:', !!prisma.users?.findUnique);
    
    // Test 3: Try a simple connection test
    console.log('Testing database connection...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Raw query result:', result);
    
    // Test 4: Try findUnique on users table
    console.log('Testing findUnique...');
    const userCount = await prisma.users.count();
    console.log('User count:', userCount);
    
    return NextResponse.json({
      success: true,
      tests: {
        prismaImported: !!prisma,
        hasUserProperty: !!prisma.users,
        hasFindUnique: !!prisma.users?.findUnique,
        connectionTest: result,
        userCount
      }
    });
    
  } catch (error) {
    console.error('Prisma debug error:', error);
    
    Sentry.captureException(error, {
      tags: {
        route: '/api/debug/prisma-status',
        errorType: 'prisma-debugging'
      }
    });
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}