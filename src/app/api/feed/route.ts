import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { logError } from '@/lib/error-logger';


const prisma = new PrismaClient();

// GET /api/feed - Get personalized feed for the current user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    const limit = parseInt(searchParams.get('limit') || '20');

    // For now, we'll use a mock user ID since authentication is simplified
    // TODO: Replace with actual user authentication
    const mockUserId = 'demo-user-id';

    let feedItems: Array<{
      id: string;
      type: string;
      createdAt: Date | string;
      work?: {
        id: string;
        title: string;
        excerpt: string | null;
        author: { id: string; username: string; displayName: string };
        community: { name: string; slug: string } | null;
        tags: string[];
        viewCount: number;
        _count: { comments: number; ratings: number };
      };
    }> = [];

    // Get user's followed users and joined communities
    const userFollows = await prisma.follow.findMany({
      where: { followerId: mockUserId },
      select: { followingId: true }
    });

    const userCommunities = await prisma.communityMember.findMany({
      where: { userId: mockUserId },
      select: { communityId: true }
    });

    const followedUserIds = userFollows.map(f => f.followingId);
    const joinedCommunityIds = userCommunities.map(m => m.communityId);

    // If user has no follows or communities, return sample public content
    if (followedUserIds.length === 0 && joinedCommunityIds.length === 0) {
      // Get recent public works as sample content
      const sampleWorks = await prisma.work.findMany({
        where: {
          status: 'PUBLISHED',
          publishedToPublic: true
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              displayName: true
            }
          },
          community: {
            select: {
              name: true,
              slug: true
            }
          },
          _count: {
            select: {
              comments: true,
              ratings: true
            }
          }
        },
        orderBy: { publishedAt: 'desc' },
        take: Math.min(limit, 10)
      });

      feedItems = sampleWorks.map(work => ({
        id: `work-${work.id}`,
        type: 'work',
        createdAt: work.publishedAt || work.createdAt,
        work: {
          id: work.id,
          title: work.title,
          excerpt: work.excerpt,
          author: work.author,
          community: work.community,
          tags: work.tags,
          viewCount: work.viewCount,
          _count: work._count
        }
      }));
    } else {
      // Get works from followed users and communities (if filter allows)
      if (filter === 'all' || filter === 'works') {
        const works = await prisma.work.findMany({
          where: {
            status: 'PUBLISHED',
            OR: [
              // Works by followed users
              ...(followedUserIds.length > 0 ? [{ authorId: { in: followedUserIds } }] : []),
              // Works published to joined communities
              ...(joinedCommunityIds.length > 0 ? [{ 
                OR: [
                  { communityId: { in: joinedCommunityIds } },
                  { publishedToCommunities: { hasSome: joinedCommunityIds } }
                ]
              }] : [])
            ]
          },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                displayName: true
              }
            },
            community: {
              select: {
                name: true,
                slug: true
              }
            },
            _count: {
              select: {
                comments: true,
                ratings: true
              }
            }
          },
          orderBy: { publishedAt: 'desc' },
          take: limit
        });

        feedItems.push(...works.map(work => ({
          id: `work-${work.id}`,
          type: 'work',
          createdAt: work.publishedAt || work.createdAt,
          work: {
            id: work.id,
            title: work.title,
            excerpt: work.excerpt,
            author: work.author,
            community: work.community,
            tags: work.tags,
            viewCount: work.viewCount,
            _count: work._count
          }
        })));
      }

      // TODO: Add discussions, follows, and community joins when those tables are available
      // For now, we'll focus on works since that's what we have seeded
    }

    // Sort by creation date and limit results
    feedItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    feedItems = feedItems.slice(0, limit);

    return NextResponse.json({
      items: feedItems,
      hasMore: feedItems.length === limit
    });

  } catch (error) {
    logError('Error fetching feed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}