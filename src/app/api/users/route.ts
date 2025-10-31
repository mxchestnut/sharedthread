import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logError } from '@/lib/error-logger';


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get('sort') || 'reputation';
    const search = searchParams.get('search') || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const currentUser = await getCurrentUser();

    // Build where clause for search
    const whereClause = search ? {
      OR: [
        { displayName: { contains: search, mode: 'insensitive' as const } },
        { username: { contains: search, mode: 'insensitive' as const } },
        { bio: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {};

    // Build order by clause
    let orderBy;
    switch (sort) {
      case 'works':
        orderBy = { works: { _count: 'desc' as const } };
        break;
      case 'followers':
        orderBy = { followers: { _count: 'desc' as const } };
        break;
      case 'recent':
        orderBy = { lastActiveAt: 'desc' as const };
        break;
      case 'reputation':
      default:
        orderBy = { reputationScore: 'desc' as const };
        break;
    }

    // Fetch users
    const users = await prisma.users.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        role: true,
        reputationScore: true,
        _count: {
          select: {
            works: {
              where: { status: 'PUBLISHED' }
            },
            followers: true,
            following: true,
          },
        },
      },
      orderBy,
      take: limit,
    });

    // Check follow status for current user
    let usersWithFollowStatus = users;
    if (currentUser) {
      const followedUserIds = await prisma.follow.findMany({
        where: {
          followerId: currentUser.id,
          followingId: { in: users.map(u => u.id) },
        },
        select: { followingId: true },
      });

      const followedSet = new Set(followedUserIds.map(f => f.followingId));

      usersWithFollowStatus = users.map(user => ({
        ...user,
        isFollowing: followedSet.has(user.id),
      }));
    }

    return NextResponse.json({
      users: usersWithFollowStatus,
      meta: {
        total: users.length,
        sort,
        search,
      },
    });
  } catch (error) {
    logError('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}