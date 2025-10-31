import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logError } from '@/lib/error-logger';


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username || username.length < 3) {
      return NextResponse.json({ available: false, error: 'Username must be at least 3 characters' });
    }

    // Check if username exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    return NextResponse.json({ 
      available: !existingUser,
      username 
    });
  } catch (error) {
    logError('Error checking username:', error);
    return NextResponse.json(
      { available: false, error: 'Failed to check username availability' },
      { status: 500 }
    );
  }
}
