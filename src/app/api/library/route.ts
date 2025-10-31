import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logError } from '@/lib/error-logger';


export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'PUBLISHED';
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const sortBy = searchParams.get('sortBy') || 'recent';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause for filtering
    const where: Record<string, unknown> = {
      status: status as 'DRAFT' | 'BETA' | 'PUBLISHED' | 'ARCHIVED',
      // Only show public works or works visible to the current user
      OR: [
        { visibility: 'PUBLIC' },
        { authorId: user.id }, // User's own works
        // TODO: Add follower and community visibility checks
      ]
    };

    // Add search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Add tag filter
    if (tags.length > 0) {
      where.tags = {
        hasSome: tags
      };
    }

    // Build order by clause
    let orderBy: Record<string, unknown> | Array<Record<string, unknown>> = { createdAt: 'desc' }; // Default to recent
    
    switch (sortBy) {
      case 'popular':
        orderBy = [
          { viewCount: 'desc' },
          { createdAt: 'desc' }
        ];
        break;
      case 'rating':
        orderBy = [
          { rating: 'desc' },
          { createdAt: 'desc' }
        ];
        break;
      case 'comments':
        // Will need to order by comment count - using a workaround for now
        orderBy = { createdAt: 'desc' };
        break;
      case 'alphabetical':
        orderBy = { title: 'asc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Fetch works
    const works = await prisma.work.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true
          }
        },
        _count: {
          select: {
            comments: true,
            ratings: true,
            collections: true
          }
        }
      },
      orderBy,
      take: limit,
      skip: offset
    });

    // Get total count for pagination
    const totalCount = await prisma.work.count({ where });

    // Get popular tags for the filter interface
    const popularTags = await prisma.work.groupBy({
      by: ['tags'],
      where: {
        status: 'PUBLISHED',
        visibility: 'PUBLIC'
      },
      _count: {
        tags: true
      },
      orderBy: {
        _count: {
          tags: 'desc'
        }
      },
      take: 20
    });

    // Flatten and count tag occurrences
    const tagCounts: Record<string, number> = {};
    popularTags.forEach((group) => {
      group.tags.forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const topTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([tag, count]) => ({ tag, count }));

    return NextResponse.json({
      works,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      },
      filters: {
        popularTags: topTags,
        currentSearch: search,
        currentStatus: status,
        currentTags: tags,
        currentSortBy: sortBy
      }
    });

  } catch (error) {
    logError('Error fetching library works:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}