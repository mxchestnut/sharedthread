import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { logError } from '@/lib/error-logger';


const prisma = new PrismaClient();

// GET /api/communities/[slug]/works - Get works published to this community
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'latest'; // latest, popular, discussed
    const category = searchParams.get('category'); // Optional category filter
    const offset = (page - 1) * limit;

    // First, get the community
    const community = await prisma.community.findUnique({
      where: { slug: params.slug },
      select: { id: true }
    });

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // Build the where clause for works
    const whereClause = {
      OR: [
        // Works published directly to this community
        { communityId: community.id },
        // Works that include this community in publishedToCommunities array
        { publishedToCommunities: { has: community.id } }
      ],
      status: 'PUBLISHED' as const, // Only show published works
      ...(category && { tags: { has: category } })
    };

    // Build orderBy clause based on sortBy parameter
    let orderBy;
    switch (sortBy) {
      case 'popular':
        orderBy = [{ rating: 'desc' as const }, { viewCount: 'desc' as const }, { publishedAt: 'desc' as const }];
        break;
      case 'discussed':
        orderBy = [{ comments: { _count: 'desc' as const } }, { publishedAt: 'desc' as const }];
        break;
      case 'latest':
      default:
        orderBy = [{ publishedAt: 'desc' as const }];
        break;
    }

    // Fetch works with pagination
    const works = await prisma.work.findMany({
      where: whereClause,
      orderBy,
      skip: offset,
      take: limit,
      select: {
        id: true,
        title: true,
        excerpt: true,
        authorId: true,
        status: true,
        publishedAt: true,
        viewCount: true,
        rating: true,
        tags: true,
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true
          }
        },
        _count: {
          select: {
            comments: true,
            ratings: true
          }
        }
      }
    });

    // Get total count for pagination
    const totalCount = await prisma.work.count({
      where: whereClause
    });

    // Get available categories (tags) from works in this community
    const categoryAggregation = await prisma.work.findMany({
      where: {
        OR: [
          { communityId: community.id },
          { publishedToCommunities: { has: community.id } }
        ],
        status: 'PUBLISHED'
      },
      select: {
        tags: true
      }
    });

    // Extract unique categories
    const categories = Array.from(
      new Set(
        categoryAggregation
          .flatMap(work => work.tags)
          .filter(tag => tag && tag.length > 0)
      )
    ).sort();

    return NextResponse.json({
      works,
      categories,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    logError('Error fetching community works:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}