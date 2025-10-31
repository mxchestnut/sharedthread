import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logError } from '@/lib/error-logger';


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;

    // Fetch community with member count and user's membership status
    const community = await prisma.community.findUnique({
      where: {
        slug: slug,
        isApproved: true
      },
      include: {
        _count: {
          select: {
            members: true,
            works: true
          }
        },
        members: {
          where: {
            userId: user.id
          },
          select: {
            id: true,
            role: true,
            joinedAt: true
          }
        },
        owner: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatarUrl: true
          }
        }
      }
    });

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // Format the response
    const formattedCommunity = {
      id: community.id,
      name: community.name,
      slug: community.slug,
      description: community.description,
      isPrivate: community.isPrivate,
      privacyLevel: community.privacyLevel,
      memberCount: community._count.members,
      workCount: community._count.works,
      createdAt: community.createdAt,
      owner: community.owner,
      userMembership: community.members[0] || null,
      isMember: community.members.length > 0,
      isOwner: community.ownerId === user.id
    };

    return NextResponse.json(formattedCommunity);
  } catch (error) {
    logError('Error fetching community:', error);
    return NextResponse.json(
      { error: 'Failed to fetch community' },
      { status: 500 }
    );
  }
}