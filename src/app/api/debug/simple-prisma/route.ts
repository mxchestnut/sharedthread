import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Debug: Starting Prisma import test...');
    
    // Test if we can import Prisma at all
    const { PrismaClient } = await import('@prisma/client');
    console.log('Debug: PrismaClient imported successfully');
    
    // Test if we can create an instance
    const prisma = new PrismaClient();
    console.log('Debug: PrismaClient instance created');
    
    // Test if prisma has expected properties
    console.log('Debug: prisma.users exists:', !!prisma.users);
    console.log('Debug: prisma.users.findUnique exists:', !!prisma.users?.findUnique);
    
    // Test database connection
    await prisma.$connect();
    console.log('Debug: Database connected successfully');
    
    // Test a simple query
    const userCount = await prisma.users.count();
    console.log('Debug: User count query successful:', userCount);
    
    await prisma.$disconnect();
    console.log('Debug: Database disconnected');
    
    return NextResponse.json({
      success: true,
      tests: {
        import: 'success',
        instance: 'success', 
        methods: !!prisma.users?.findUnique,
        connection: 'success',
        userCount
      }
    });
    
  } catch (error) {
    console.error('Debug: Prisma test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}