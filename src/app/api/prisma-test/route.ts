import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Step 1: Test basic response
    console.log('Step 1: API route accessible');
    
    // Step 2: Test if we can import prisma
    console.log('Step 2: Attempting to import prisma...');
    const { prisma } = await import('@/lib/prisma');
    console.log('Step 3: Prisma imported successfully');
    
    // Step 3: Test if prisma object is defined
    console.log('Step 4: Checking prisma object:', !!prisma);
    console.log('Step 5: Checking prisma.users:', !!prisma?.users);
    
    // Step 4: Test database connection (no complex queries)
    console.log('Step 6: Testing basic connection...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Step 7: Connection test successful:', result);
    
    return NextResponse.json({
      success: true,
      checks: {
        imported: !!prisma,
        hasUsers: !!prisma?.users,
        connection: result
      }
    });
    
  } catch (error) {
    console.error('Prisma test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}