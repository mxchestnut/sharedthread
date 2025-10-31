import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { checkPlagiarism, checkAIContent } from '@/lib/content-check';
import { logError } from '@/lib/error-logger';


export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { slug } = params;
    const url = new URL(request.url);
    const categoryId = url.searchParams.get('categoryId');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // First, get the community and check access
    const community = await prisma.community.findFirst({
      where: {
        slug: slug,
        isApproved: true
      },
      include: {
        members: {
          where: {
            userId: user.id
          }
        }
      }
    });

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // Check if user has access (member of community or admin)
    const isMember = community.members.length > 0;
    const isAdmin = user.role === 'admin';
    
    if (community.isPrivate && !isMember && !isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // For now, return mock discussions since we don't have database tables yet
    // TODO: Replace with actual database queries once migration is complete
    const mockDiscussions = [
      {
        id: '1',
        title: 'Welcome to the community!',
        slug: 'welcome-to-the-community',
        content: 'This is our first discussion post. Feel free to introduce yourself and share what brought you to this community...',
        author: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl
        },
        category: {
          id: '1',
          name: 'General',
          slug: 'general',
          color: '#6366f1',
          icon: 'MessageSquare'
        },
        isPinned: true,
        isLocked: false,
        viewCount: 42,
        upvotes: 5,
        downvotes: 0,
        replyCount: 3,
        voteCount: 5,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    // Filter by category if specified
    let filteredDiscussions = mockDiscussions;
    if (categoryId) {
      filteredDiscussions = mockDiscussions.filter(d => d.category.id === categoryId);
    }

    // Apply pagination
    const totalCount = filteredDiscussions.length;
    const paginatedDiscussions = filteredDiscussions.slice(offset, offset + limit);

    return NextResponse.json({
      discussions: paginatedDiscussions,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    logError('Error fetching discussions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discussions' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { slug } = params;
    const body = await request.json();
    const { title, content, categoryId, citations } = body;

    if (!title || !content || !categoryId) {
      return NextResponse.json(
        { error: 'Title, content, and category are required' },
        { status: 400 }
      );
    }

    // Get the community and check access
    const community = await prisma.community.findFirst({
      where: {
        slug: slug,
        isApproved: true
      },
      include: {
        members: {
          where: {
            userId: user.id
          }
        }
      }
    });

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // Check if user can post (member or admin)
    const isMember = community.members.length > 0;
    const isAdmin = user.role === 'admin';
    
    if (!isMember && !isAdmin) {
      return NextResponse.json({ error: 'Must be a community member to post' }, { status: 403 });
    }

    // Check for plagiarism and AI-generated content
    const plagiarismCheck = await checkPlagiarism(content);
    const aiCheck = await checkAIContent(content);

    // If plagiarized or AI-generated, require citations
    if (plagiarismCheck.isPlagiarized || (aiCheck.isAI && aiCheck.score > 0.7)) {
      if (!citations || citations.length === 0) {
        return NextResponse.json({
          error: 'This content appears to be plagiarized or AI-generated. Please cite your sources.',
          details: {
            plagiarism: plagiarismCheck,
            aiContent: aiCheck,
          },
          requiresCitations: true,
        }, { status: 400 });
      }
    }

    // Extract topics from content using AI (for categorization)
    let topics: string[] = [];
    try {
      const topicsPrompt = `Extract 3-5 key topic tags from this discussion post. Return ONLY a JSON object with a "topics" array of strings.\n\nPost: ${content.substring(0, 500)}`;
      const topicsResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY || '',
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 256,
          messages: [{ role: 'user', content: topicsPrompt }],
        }),
      });
      if (topicsResponse.ok) {
        const topicsData = await topicsResponse.json();
        const content = topicsData.content?.[0];
        const text = content?.type === 'text' ? content.text : '';
        const parsed = JSON.parse(text || '{}');
        topics = parsed.topics || [];
      }
    } catch (error) {
      logError('Error extracting topics:', error);
      // Continue without topics if extraction fails (topics field not yet in schema)
    }    // Create the discussion post
    const discussionPost = await prisma.discussionPost.create({
      data: {
        title,
        content,
        authorId: user.id,
        communityId: community.id,
        categoryId,
        topics,
        citations: citations || undefined,
        hasPlagiarismFlag: plagiarismCheck.isPlagiarized,
        hasAIFlag: aiCheck.isAI && aiCheck.score > 0.7,
        aiScore: aiCheck.score || 0,
        plagiarismScore: plagiarismCheck.score || 0,
        moderationStatus: (plagiarismCheck.isPlagiarized || (aiCheck.isAI && aiCheck.score > 0.7)) ? 'FLAGGED' : 'CLEAN',
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        category: true,
      },
    });

  return NextResponse.json(discussionPost, { status: 201 });

  } catch (error) {
    logError('Error creating discussion:', error);
    return NextResponse.json(
      { error: 'Failed to create discussion' },
      { status: 500 }
    );
  }
}