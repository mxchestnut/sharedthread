import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logError } from '@/lib/error-logger';


export async function GET() {
  try {
    // Verify user is admin
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    // Fetch all users (excluding passwords)
    const users = await prisma.users.findMany({
      select: {
        id: true,
        username: true,
        displayName: true,
        email: true,
        phoneNumber: true,
        role: true,
        status: true,
        isApproved: true,
        emailVerified: true,
        onWaitlist: true,
        waitlistReason: true,
        birthday: true,
        pronouns: true,
        newsletterSubscribed: true,
        smsOptIn: true,
        createdAt: true,
        lastActiveAt: true,
        isOver18: true,
        // Explicitly exclude password
        // password is NOT in this select, so it won't be returned
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    logError('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
