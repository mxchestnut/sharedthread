import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { logError } from '@/lib/error-logger';


export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user data from database using email from session
    const fullUser = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        phoneNumber: true,
        birthday: true,
        pronouns: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            works: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!fullUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Normalize role to lowercase for consistency with AuthUser type
    const normalizedUser = {
      ...fullUser,
      role: fullUser.role.toLowerCase() as 'member' | 'admin',
    };

    return NextResponse.json(normalizedUser);
  } catch (error) {
    logError('Get current user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}