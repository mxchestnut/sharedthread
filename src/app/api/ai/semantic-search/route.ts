import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { performSemanticSearch } from '@/lib/ai/semantic-search';
import { logError } from '@/lib/error-logger';


export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { query, type = 'all', limit = 20 } = await request.json();

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Gather searchable content based on type
    const searchableContent: Array<{
      id: string;
      title: string;
      content: string;
      type: 'work' | 'discussion' | 'user' | 'community';
      tags?: string[];
      author?: string;
      publishedAt?: Date;
    }> = [];

    // Search works
    if (type === 'all' || type === 'work') {
      const works = await prisma.work.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { visibility: 'PUBLIC' },
            { authorId: user.id }
          ]
        },
        select: {
          id: true,
          title: true,
          content: true,
          excerpt: true,
          tags: true,
          publishedAt: true,
          author: {
            select: {
              displayName: true
            }
          }
        },
        take: 100 // Limit for performance
      });

      for (const work of works) {
        let contentText = work.excerpt || '';
        
        // Extract text from rich content
        if (work.content && typeof work.content === 'object') {
          const extractText = (node: unknown): string => {
            if (!node) return '';
            if (typeof node === 'string') return node;
            if (Array.isArray(node)) return node.map(extractText).join(' ');
            if (typeof node === 'object' && node !== null) {
              const obj = node as Record<string, unknown>;
              if ('text' in obj && typeof obj.text === 'string') return obj.text;
              if ('content' in obj) return extractText(obj.content);
            }
            return '';
          };
          contentText = extractText(work.content);
        }

        searchableContent.push({
          id: work.id,
          title: work.title,
          content: contentText,
          type: 'work',
          tags: work.tags,
          author: work.author.displayName,
          publishedAt: work.publishedAt || undefined
        });
      }
    }

    // Search discussions
    if (type === 'all' || type === 'discussion') {
      const discussions = await prisma.discussionPost.findMany({
        where: {
          community: {
            // Public or user is member
            OR: [
              { privacyLevel: 'PUBLIC' },
              { members: { some: { userId: user.id } } }
            ]
          }
        },
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          author: {
            select: {
              displayName: true
            }
          },
          community: {
            select: {
              slug: true
            }
          }
        },
        take: 100
      });

      for (const discussion of discussions) {
        searchableContent.push({
          id: discussion.id,
          title: discussion.title,
          content: discussion.content,
          type: 'discussion',
          author: discussion.author.displayName,
          publishedAt: discussion.createdAt
        });
      }
    }

    // Search users
    if (type === 'all' || type === 'user') {
      const users = await prisma.users.findMany({
        where: {
          isApproved: true,
          NOT: { id: user.id }
        },
        select: {
          id: true,
          username: true,
          displayName: true,
          bio: true
        },
        take: 50
      });

      for (const searchUser of users) {
        searchableContent.push({
          id: searchUser.username,
          title: searchUser.displayName,
          content: searchUser.bio || '',
          type: 'user'
        });
      }
    }

    // Search communities
    if (type === 'all' || type === 'community') {
      const communities = await prisma.community.findMany({
        where: {
          OR: [
            { privacyLevel: 'PUBLIC' },
            { members: { some: { userId: user.id } } }
          ]
        },
        select: {
          id: true,
          slug: true,
          name: true,
          description: true
        },
        take: 50
      });

      for (const community of communities) {
        searchableContent.push({
          id: community.slug,
          title: community.name,
          content: community.description || '',
          type: 'community'
        });
      }
    }

    // Perform semantic search
    const libResponse = await performSemanticSearch(
      { query, type, limit },
      searchableContent
    );

    // Heuristic intent compatible with SearchPage
    const q = query.toLowerCase();
    let category: 'work' | 'discussion' | 'user' | 'community' | 'general' = 'general';
    let confidence = 0.4;
    if (/(user|author|writer|@)/.test(q)) { category = 'user'; confidence = 0.65; }
    else if (/(community|group|club|guild)/.test(q)) { category = 'community'; confidence = 0.65; }
    else if (/(discussion|thread|question|reply|debate|topic)/.test(q)) { category = 'discussion'; confidence = 0.65; }
    else if (/(work|article|essay|piece|chapter|publish)/.test(q)) { category = 'work'; confidence = 0.65; }

    const interpretation = category === 'general'
      ? `Search for relevant content across works, discussions, users, and communities matching "${query}"`
      : `Search for ${category}s related to "${query}"`;

    const apiResponse = {
      results: libResponse.results,
      intent: { category, confidence, interpretation },
      totalCount: libResponse.totalResults ?? libResponse.results.length,
    };

    return NextResponse.json(apiResponse);

  } catch (error) {
    logError('Semantic search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
