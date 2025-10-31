/**
 * Discovery Feed API - Personalized work recommendations
 * 
 * GET /api/recommendations/works?limit=20&excludeAuthor=xyz
 * 
 * Returns personalized work recommendations based on:
 * - User's reading history (ratings, comments)
 * - Tag preferences
 * - Engagement patterns
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logError } from '@/lib/error-logger';


export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const excludeAuthors = searchParams.get('excludeAuthor')?.split(',') || [];

    // 1. Get user's reading history - what tags do they like?
    const userRatings = await prisma.rating.findMany({
      where: {
        userId: user.id,
        value: { gte: 4 }, // Only consider highly rated works
      },
      include: {
        work: {
          select: { tags: true },
        },
      },
      take: 50,
      orderBy: { createdAt: 'desc' },
    });

    // Extract preferred tags
    const tagCounts = new Map<string, number>();
    userRatings.forEach((rating) => {
      rating.work.tags.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    const preferredTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);

    // 2. Find works with matching tags that user hasn't rated
    const ratedWorkIds = userRatings.map((r) => r.workId);

    const candidates = await prisma.work.findMany({
      where: {
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        id: { notIn: ratedWorkIds },
        authorId: {
          notIn: [user.id, ...excludeAuthors],
        },
        ...(preferredTags.length > 0 && {
          tags: { hasSome: preferredTags },
        }),
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        ratings: {
          select: { value: true },
        },
      },
      take: 100, // Get candidates for scoring
    });

    // 3. Score each candidate
    const scored = candidates.map((work) => {
      const avgRating =
        work.ratings.length > 0
          ? work.ratings.reduce((sum, r) => sum + r.value, 0) / work.ratings.length
          : 3;

      const tagOverlap = work.tags.filter((tag) => preferredTags.includes(tag)).length;
      const tagScore = tagOverlap / Math.max(work.tags.length, preferredTags.length);

      // Weighted score
      const score =
        tagScore * 0.5 + // Tag relevance
        (avgRating / 5) * 0.3 + // Quality
        Math.min(work.viewCount / 1000, 0.2); // Popularity (capped at 0.2)

      const reasons: string[] = [];
      if (tagOverlap > 0) {
        const sharedTags = work.tags.filter((t) => preferredTags.includes(t));
        reasons.push(`Matches your interests: ${sharedTags.slice(0, 3).join(', ')}`);
      }
      if (avgRating >= 4) {
        reasons.push('Highly rated by readers');
      }
      if (work.viewCount > 100) {
        reasons.push('Popular in the community');
      }

      return {
        id: work.id,
        title: work.title,
        excerpt: work.excerpt,
        authorId: work.author.id,
        authorName: work.author.displayName || work.author.username,
        tags: work.tags,
        viewCount: work.viewCount,
        avgRating: Math.round(avgRating * 10) / 10,
        createdAt: work.createdAt,
        score,
        reasons,
      };
    });

    // 4. Sort by score and return top results
    scored.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      works: scored.slice(0, limit),
      userPreferences: {
        topTags: preferredTags,
        totalRatings: userRatings.length,
      },
    });
  } catch (error) {
    logError('Discovery feed error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
