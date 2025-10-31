/**
 * Related Collections API - Find collections related to a work or user's interests
 * 
 * POST /api/ai/related-collections
 * Body: { workId?: string, userId?: string, limit?: number }
 * 
 * Returns collections that would interest the user based on:
 * - Works in the collection matching user's reading history
 * - Collection creator's other popular collections
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
    const userId = body.userId || user.id;

    let contextTags: string[] = [];

    // 1. Get context from work if provided
    if (workId) {
      const work = await prisma.work.findUnique({
        where: { id: workId },
        select: { tags: true },
      });
      if (work) {
        contextTags = work.tags;
      }
    }

    // 2. If no work provided, use user's reading preferences
    if (contextTags.length === 0) {
      const userRatings = await prisma.rating.findMany({
        where: {
          userId,
          value: { gte: 4 },
        },
        include: {
          work: { select: { tags: true } },
        },
        take: 20,
        orderBy: { createdAt: 'desc' },
      });

      // Extract top tags
      const tagCounts = new Map<string, number>();
      userRatings.forEach((rating) => {
        rating.work.tags.forEach((tag) => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
      });

      contextTags = Array.from(tagCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([tag]) => tag);
    }

    if (contextTags.length === 0) {
      return NextResponse.json({ relatedCollections: [] });
    }

    // 3. Find collections with works that match these tags
    const collections = await prisma.collection.findMany({
      where: {
        isPublic: true,
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        items: {
          include: {
            work: {
              select: { tags: true },
            },
          },
          take: 20, // Sample works from collection
        },
      },
      take: 50, // Get candidates
    });

    // 4. Score each collection
    const scored = collections.map((collection) => {
      // Count tag matches across works in collection
      let tagMatchCount = 0;
      const allCollectionTags = new Set<string>();

      collection.items.forEach((item) => {
        item.work.tags.forEach((tag: string) => {
          allCollectionTags.add(tag);
          if (contextTags.includes(tag)) {
            tagMatchCount++;
          }
        });
      });

      const score = tagMatchCount / Math.max(collection.items.length, 1);

      return {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        ownerName: collection.owner.displayName || collection.owner.username,
        workCount: collection.items.length,
        matchingTags: Array.from(allCollectionTags).filter((tag) =>
          contextTags.includes(tag)
        ),
        score,
      };
    });

    // 5. Filter and sort
    const filtered = scored.filter((c) => c.score > 0);
    filtered.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      relatedCollections: filtered.slice(0, limit),
      context: { tags: contextTags },
    });
  } catch (error) {
    logError('Related collections error:', error);
    return NextResponse.json(
      { error: 'Failed to find related collections' },
      { status: 500 }
    );
  }
}
