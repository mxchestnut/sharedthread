/**
 * Similar Communities API - Find communities related to a community or user's interests
 * 
 * POST /api/ai/similar-communities
 * Body: { communityId?: string, userId?: string, limit?: number }
 * 
 * Returns communities that match user interests based on:
 * - Works published in those communities
 * - User's reading history and preferences
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
    const { communityId, limit = 10 } = body;
    const userId = body.userId || user.id;

    let contextTags: string[] = [];

    // 1. Get context from community if provided
    if (communityId) {
      const communityWorks = await prisma.work.findMany({
        where: {
          communityId,
          status: 'PUBLISHED',
        },
        select: { tags: true },
        take: 50,
      });

      const tagCounts = new Map<string, number>();
      communityWorks.forEach((work) => {
        work.tags.forEach((tag) => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
      });

      contextTags = Array.from(tagCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([tag]) => tag);
    }

    // 2. If no community provided, use user's reading preferences
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
      return NextResponse.json({ similarCommunities: [] });
    }

    // 3. Find public communities
    const communities = await prisma.community.findMany({
      where: {
        isApproved: true,
        isPrivate: false,
        ...(communityId && { id: { not: communityId } }),
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        _count: {
          select: { members: true },
        },
        works: {
          where: { status: 'PUBLISHED' },
          select: { tags: true },
          take: 50,
        },
      },
      take: 50,
    });

    // 4. Score each community
    const scored = communities.map((community) => {
      const tagCounts = new Map<string, number>();

      community.works.forEach((work) => {
        work.tags.forEach((tag) => {
          if (contextTags.includes(tag)) {
            tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
          }
        });
      });

      const matchCount = Array.from(tagCounts.values()).reduce((sum, count) => sum + count, 0);
      const score = matchCount / Math.max(community.works.length, 1);

      const matchingTags = Array.from(tagCounts.keys());

      return {
        id: community.id,
        name: community.name,
        description: community.description,
        slug: community.slug,
        memberCount: community._count.members,
        ownerName: community.owner.displayName || community.owner.username,
        workCount: community.works.length,
        matchingTags,
        score,
      };
    });

    // 5. Filter and sort
    const filtered = scored.filter((c) => c.score > 0);
    filtered.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      similarCommunities: filtered.slice(0, limit),
      context: { tags: contextTags },
    });
  } catch (error) {
    logError('Similar communities error:', error);
    return NextResponse.json(
      { error: 'Failed to find similar communities' },
      { status: 500 }
    );
  }
}
