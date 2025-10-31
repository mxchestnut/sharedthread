/**
 * Similar Works API - Find works similar to a given work
 * 
 * POST /api/ai/similar-works
 * Body: { workId: string, limit?: number }
 * 
 * Returns works with matching tags, sorted by similarity score
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logError } from '@/lib/error-logger';


export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { workId, limit = 10 } = body;

    if (!workId) {
      return NextResponse.json({ error: 'workId is required' }, { status: 400 });
    }

    // 1. Get the source work
    const sourceWork = await prisma.work.findUnique({
      where: { id: workId },
      select: {
        id: true,
        title: true,
        tags: true,
        rating: true,
        authorId: true,
      },
    });

    if (!sourceWork) {
      return NextResponse.json({ error: 'Work not found' }, { status: 404 });
    }

    // 2. Find similar works based on shared tags
    const similarWorks = await prisma.work.findMany({
      where: {
        id: { not: workId },
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        tags: { hasSome: sourceWork.tags }, // At least one shared tag
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
      take: 50, // Get candidates for scoring
    });

    // 3. Score by similarity
    const scored = similarWorks.map((work) => {
      const sharedTags = work.tags.filter((tag) => sourceWork.tags.includes(tag));
      const tagOverlapRatio = sharedTags.length / Math.max(work.tags.length, sourceWork.tags.length);

      const avgRating =
        work.ratings.length > 0
          ? work.ratings.reduce((sum, r) => sum + r.value, 0) / work.ratings.length
          : 3;

      // Quality bonus for highly rated works
      const qualityBonus = avgRating >= 4 ? 0.2 : 0;

      const score = tagOverlapRatio + qualityBonus;

      const reasons: string[] = [];
      if (sharedTags.length > 0) {
        reasons.push(`Shares: ${sharedTags.slice(0, 3).join(', ')}`);
      }
      if (avgRating >= 4) {
        reasons.push('Highly rated');
      }

      return {
        id: work.id,
        title: work.title,
        excerpt: work.excerpt,
        authorId: work.author.id,
        authorName: work.author.displayName || work.author.username,
        tags: work.tags,
        sharedTags,
        avgRating: Math.round(avgRating * 10) / 10,
        viewCount: work.viewCount,
        score,
        reasons,
      };
    });

    // 4. Sort by score and return top results
    scored.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      similarWorks: scored.slice(0, limit),
      sourceWork: {
        id: sourceWork.id,
        title: sourceWork.title,
        tags: sourceWork.tags,
      },
    });
  } catch (error) {
    logError('Similar works error:', error);
    return NextResponse.json(
      { error: 'Failed to find similar works' },
      { status: 500 }
    );
  }
}
