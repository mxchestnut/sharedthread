import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test if Prisma Client is initialized
    console.log('Testing Prisma Client...');
    console.log('prisma object:', typeof prisma);
    console.log('prisma.users:', typeof prisma.users);
    
    // Try to count users
    const userCount = await prisma.users.count();
    
    return NextResponse.json({
      success: true,
      prismaInitialized: true,
      userCount,
      prismaType: typeof prisma,
      userType: typeof prisma.users,
    });
  } catch (error) {
    console.error('Prisma debug error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      prismaType: typeof prisma,
      userType: typeof (prisma as any).user,
    }, { status: 500 });
  }
}
