import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logError } from '@/lib/error-logger';


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    const { action } = await request.json();

    // Find the community
    const community = await prisma.community.findUnique({
      where: {
        slug: slug,
        isApproved: true
      }
    });

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    if (action === 'join') {
      // Check if already a member
      const existingMembership = await prisma.communityMember.findUnique({
        where: {
          userId_communityId: {
            userId: user.id,
            communityId: community.id
          }
        }
      });

      if (existingMembership) {
        return NextResponse.json({ error: 'Already a member' }, { status: 400 });
      }

      // Create membership
      const membership = await prisma.communityMember.create({
        data: {
          userId: user.id,
          communityId: community.id,
          role: 'MEMBER'
        }
      });

      return NextResponse.json({ 
        success: true, 
        membership: {
          id: membership.id,
          role: membership.role,
          joinedAt: membership.joinedAt
        }
      });

    } else if (action === 'leave') {
      // Cannot leave if you're the owner
      if (community.ownerId === user.id) {
        return NextResponse.json({ 
          error: 'Community owners cannot leave their own community' 
        }, { status: 400 });
      }

      // Delete membership
      await prisma.communityMember.deleteMany({
        where: {
          userId: user.id,
          communityId: community.id
        }
      });

      return NextResponse.json({ success: true });

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    logError('Error managing membership:', error);
    return NextResponse.json(
      { error: 'Failed to manage membership' },
      { status: 500 }
    );
  }
}