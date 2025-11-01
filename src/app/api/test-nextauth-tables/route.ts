import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test if NextAuth tables exist by checking the schema
    const tableNames = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name IN ('accounts', 'sessions', 'users', 'verification_tokens')
      ORDER BY table_name
    ` as Array<{ table_name: string }>
    
    // Test specific NextAuth operations
    const userCount = await prisma.users.count()
    const accountCount = await prisma.accounts.count()
    
    return NextResponse.json({
      success: true,
      message: "NextAuth table check",
      tables: tableNames.map(t => t.table_name),
      userCount,
      accountCount,
      hasUsersTable: !!prisma.users,
      hasAccountsTable: !!prisma.accounts,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "NextAuth table check failed",
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}