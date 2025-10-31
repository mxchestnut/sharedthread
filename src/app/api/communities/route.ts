import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logError } from '@/lib/error-logger';


export async function GET() {
  try {
    // Verify authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch approved communities with member counts
    const communities = await prisma.community.findMany({
      where: {
        isApproved: true
      },
      include: {
        _count: {
          select: {
            members: true
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    });

    // Format the response
    const formattedCommunities = communities.map(community => ({
      id: community.id,
      name: community.name,
      slug: community.slug,
      description: community.description,
      memberCount: community._count.members,
      createdAt: community.createdAt
    }));

    return NextResponse.json(formattedCommunities);
  } catch (error) {
    logError('Error fetching communities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch communities' },
      { status: 500 }
    );
  }
}