import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logError } from '@/lib/error-logger';


interface Params {
  username: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { username } = await params;
    const currentUser = await getCurrentUser();

    // Find the user by username first
    const targetUser = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        lastActiveAt: true,
        reputationScore: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Now get the user with counts
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        lastActiveAt: true,
        reputationScore: true,
        _count: {
          select: {
            works: {
              where: {
                OR: [
                  { status: 'PUBLISHED' },
                  // Show all works if it's the user's own profile or current user is admin
                  ...(currentUser && (currentUser.id === targetUser.id || currentUser.role === 'admin') 
                    ? [{}] 
                    : []
                  )
                ]
              }
            },
            followers: true,
            following: true,
            comments: true,
            ratings: true,
          },
        },
      },
    });



    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if current user is following this user
    let isFollowing = false;
    if (currentUser && currentUser.id !== user.id) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUser.id,
            followingId: user.id,
          },
        },
      });
      isFollowing = !!follow;
    }

    // Get user's published works (or all works if own profile/admin)
    const works = await prisma.work.findMany({
      where: {
        authorId: user.id,
        OR: [
          { status: 'PUBLISHED' },
          // Show all works if it's the user's own profile or current user is admin
          ...(currentUser && (currentUser.id === user.id || currentUser.role === 'admin') 
            ? [{}] 
            : []
          )
        ]
      },
      select: {
        id: true,
        title: true,
        excerpt: true,
        status: true,
        viewCount: true,
        rating: true,
        createdAt: true,
        publishedAt: true,
        tags: true,
        _count: {
          select: {
            comments: true,
            ratings: true,
          },
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
    });

    // Calculate average ratings for works
    const worksWithRatings = await Promise.all(
      works.map(async (work) => {
        if (work._count.ratings > 0) {
          const ratings = await prisma.rating.findMany({
            where: { workId: work.id },
            select: { value: true },
          });
          const avgRating = ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length;
          return { ...work, rating: avgRating };
        }
        return work;
      })
    );

    return NextResponse.json({
      user: {
        ...user,
        isFollowing,
      },
      works: worksWithRatings,
    });
  } catch (error) {
    logError('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}