import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logError } from '@/lib/error-logger';


export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Verify admin access
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { userId } = params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch user's works (limit to 10 most recent)
    const works = await prisma.work.findMany({
      where: { authorId: userId },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Fetch user's comments (limit to 10 most recent)
    const comments = await prisma.comment.findMany({
      where: { userId },
      select: {
        id: true,
        content: true,
        createdAt: true,
        work: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Fetch user's ratings (limit to 10 most recent)
    const ratings = await prisma.rating.findMany({
      where: { userId },
      select: {
        id: true,
        score: true,
        createdAt: true,
        work: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Fetch user's community memberships
    const communities = await prisma.communityMember.findMany({
      where: { userId },
      select: {
        role: true,
        joinedAt: true,
        community: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    // Format the response
    return NextResponse.json({
      works: works.map((work: typeof works[0]) => ({
        id: work.id,
        title: work.title,
        status: work.status,
        createdAt: work.createdAt.toISOString(),
      })),
      comments: comments.map((comment: typeof comments[0]) => ({
        id: comment.id,
        content: comment.content,
        workTitle: comment.work.title,
        createdAt: comment.createdAt.toISOString(),
      })),
      ratings: ratings.map((rating: typeof ratings[0]) => ({
        id: rating.id,
        score: rating.score,
        workTitle: rating.work.title,
        createdAt: rating.createdAt.toISOString(),
      })),
      communities: communities.map((membership: typeof communities[0]) => ({
        id: membership.community.id,
        name: membership.community.name,
        role: membership.role,
        joinedAt: membership.joinedAt.toISOString(),
      })),
    });
  } catch (error) {
    logError('Activity fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user activity' },
      { status: 500 }
    );
  }
}
