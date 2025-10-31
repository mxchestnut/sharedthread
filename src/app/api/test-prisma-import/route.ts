// Test if just importing Prisma breaks the route
import { NextResponse } from 'next/server';
// This line should break the route if Prisma import fails
import { prisma } from '@/lib/prisma';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Route with Prisma import works',
    prismaImported: !!prisma
  });
}