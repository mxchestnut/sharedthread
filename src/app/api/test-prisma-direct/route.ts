import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test direct Prisma Client import
    const { PrismaClient } = await import('@prisma/client')
    
    // Test initialization
    const prisma = new PrismaClient()
    
    // Test basic operation (without actually running it)
    const testResult = {
      success: true,
      message: "Prisma Client import and initialization successful",
      hasPrismaClient: !!PrismaClient,
      hasUsers: !!prisma.users,
      prismaClientType: typeof PrismaClient,
      nodeEnv: process.env.NODE_ENV
    }
    
    return NextResponse.json(testResult)
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Prisma Client import failed",
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}