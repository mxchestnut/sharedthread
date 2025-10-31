import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logError } from '@/lib/error-logger';


async function checkStaffPermissions(user: { role?: string } | null): Promise<boolean> {
  return user?.role?.toUpperCase() === 'ADMIN';
}

export async function GET() {
  try {
    // Check authentication and staff permissions
    const user = await getCurrentUser();
    if (!user || !await checkStaffPermissions(user)) {
      return NextResponse.json(
        { error: 'Staff access required' },
        { status: 403 }
      );
    }

    // Fetch all communities with owner and member count
    const communities = await prisma.community.findMany({
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: [
        { isApproved: 'asc' }, // Pending first
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ communities });
  } catch (error) {
    logError('Error fetching communities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
