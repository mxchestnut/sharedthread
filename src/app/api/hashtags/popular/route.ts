import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { logError } from '@/lib/error-logger';


const prisma = new PrismaClient();

// GET /api/hashtags/popular - Get site-wide popular hashtags from public works
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Fetch published works that are public or published to public communities
    const works = await prisma.work.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { publishedToPublic: true },
          { 
            community: {
              isPrivate: false,
              isApproved: true
            }
          }
        ]
      },
      select: {
        tags: true
      }
    });

    // Count tag frequency
    const tagCounts: Record<string, number> = {};
    works.forEach(work => {
      work.tags?.forEach(tag => {
        if (tag && tag.length > 0) {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
      });
    });

    // Convert to array and sort by count, take top results
    const popularTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return NextResponse.json({
      hashtags: popularTags,
      totalWorks: works.length
    });

  } catch (error) {
    logError('Error fetching popular hashtags:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}