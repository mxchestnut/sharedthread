import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { checkPlagiarism, checkAIContent } from '@/lib/content-check';
import { checkWorkSpam } from '@/lib/ai/spam-detector';
import { logError } from '@/lib/error-logger';


// Schema for creating a new work
const createWorkSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.any(), // Rich content JSON structure
  excerpt: z.string().optional(),
  status: z.enum(['DRAFT', 'BETA', 'PUBLISHED']).optional(),
  visibility: z.enum(['PRIVATE', 'FOLLOWERS', 'COMMUNITY', 'PUBLIC']).optional(),
  acceptingFeedback: z.boolean().optional(),
  betaEndDate: z.string().optional(), // ISO date string
  tags: z.array(z.string()).optional(),
  publishedToCommunities: z.array(z.string()).optional(),
  publishedToPublic: z.boolean().optional(),
  publishedToFollowers: z.boolean().optional()
});

const updateWorkSchema = createWorkSchema.partial();

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
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build filter conditions
    const where: { authorId: string; status?: 'DRAFT' | 'BETA' | 'PUBLISHED' | 'ARCHIVED' } = { authorId: user.id };
    if (status && status !== 'ALL') {
      where.status = status as 'DRAFT' | 'BETA' | 'PUBLISHED' | 'ARCHIVED';
    }

    // Fetch user's works
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
        community: {
          select: {
            id: true,
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
      orderBy: { updatedAt: 'desc' },
      take: limit,
      skip: offset
    });

    // Get total count for pagination
    const totalCount = await prisma.work.count({ where });

    return NextResponse.json({
      works,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    logError('Error fetching works:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createWorkSchema.parse(body);

    // Handle beta end date
    const betaEndDate = validatedData.betaEndDate 
      ? new Date(validatedData.betaEndDate) 
      : null;


    // If publishing to Beta or Community, check for plagiarism and AI content
    const isPublishing =
      validatedData.status === 'BETA' ||
      validatedData.status === 'PUBLISHED' ||
      validatedData.visibility === 'COMMUNITY' ||
      validatedData.visibility === 'PUBLIC';

    if (isPublishing) {
      // Flatten content to plain text for checking
      let plainText = '';
      if (typeof validatedData.content === 'string') {
        plainText = validatedData.content;
      } else if (validatedData.content && typeof validatedData.content === 'object') {
        // Try to extract text from Tiptap/ProseMirror doc structure
        function extractText(node: unknown): string {
          if (!node) return '';
          if (typeof node === 'string') return node;
          if (Array.isArray(node)) return node.map(extractText).join(' ');
          if (typeof node === 'object' && node !== null) {
            if ('text' in node && typeof node.text === 'string') return node.text;
            if ('content' in node) return extractText(node.content);
          }
          return '';
        }
        plainText = extractText(validatedData.content);
      }

      // Run checks including spam detection
      const [plagiarism, aiContent, spamCheck] = await Promise.all([
        checkPlagiarism(plainText),
        checkAIContent(plainText),
        checkWorkSpam(
          validatedData.title,
          plainText,
          validatedData.tags || [],
          user.id
        )
      ]);

      if (spamCheck.shouldBlock) {
        return NextResponse.json({
          error: 'This content has been flagged as potential spam.',
          reasons: spamCheck.reasons,
          confidence: spamCheck.confidence
        }, { status: 400 });
      }

      if (plagiarism.isPlagiarized) {
        return NextResponse.json({
          error: 'Plagiarism detected. Please ensure your article is original.',
          details: plagiarism.details || undefined,
          score: plagiarism.score
        }, { status: 400 });
      }
      if (aiContent.isAI) {
        return NextResponse.json({
          error: 'AI-generated writing detected. Please use AI for ideas, not for writing the main content.',
          details: aiContent.details || undefined,
          score: aiContent.score
        }, { status: 400 });
      }
    }

    // Create the work
    const work = await prisma.work.create({
      data: {
        title: validatedData.title,
        content: validatedData.content || { type: 'doc', content: [] }, // Default empty content
        excerpt: validatedData.excerpt,
        authorId: user.id,
        status: validatedData.status || 'DRAFT',
        visibility: validatedData.visibility || 'PRIVATE',
        acceptingFeedback: validatedData.acceptingFeedback || false,
        betaEndDate,
        tags: validatedData.tags || [],
        publishedToCommunities: validatedData.publishedToCommunities || [],
        publishedToPublic: validatedData.publishedToPublic || false,
        publishedToFollowers: validatedData.publishedToFollowers || false,
        publishedAt: validatedData.status === 'PUBLISHED' ? new Date() : null
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      work,
      message: 'Work created successfully'
    }, { status: 201 });

  } catch (error) {
    logError('Error creating work:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { workId, ...updateData } = body;

    if (!workId) {
      return NextResponse.json(
        { error: 'Work ID is required' },
        { status: 400 }
      );
    }

    const validatedData = updateWorkSchema.parse(updateData);

    // Check if work exists and user owns it
    const existingWork = await prisma.work.findUnique({
      where: { id: workId }
    });

    if (!existingWork) {
      return NextResponse.json(
        { error: 'Work not found' },
        { status: 404 }
      );
    }

    if (existingWork.authorId !== user.id) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    // Handle beta end date
    const betaEndDate = validatedData.betaEndDate 
      ? new Date(validatedData.betaEndDate) 
      : undefined;

    // Update the work
    const updatedWork = await prisma.work.update({
      where: { id: workId },
      data: {
        ...(validatedData.title && { title: validatedData.title }),
        ...(validatedData.content && { content: validatedData.content }),
        ...(validatedData.excerpt !== undefined && { excerpt: validatedData.excerpt }),
        ...(validatedData.status && { status: validatedData.status }),
        ...(validatedData.visibility && { visibility: validatedData.visibility }),
        ...(validatedData.acceptingFeedback !== undefined && { acceptingFeedback: validatedData.acceptingFeedback }),
        ...(betaEndDate && { betaEndDate }),
        ...(validatedData.tags && { tags: validatedData.tags }),
        ...(validatedData.publishedToCommunities && { publishedToCommunities: validatedData.publishedToCommunities }),
        ...(validatedData.publishedToPublic !== undefined && { publishedToPublic: validatedData.publishedToPublic }),
        ...(validatedData.publishedToFollowers !== undefined && { publishedToFollowers: validatedData.publishedToFollowers }),
        // Set published date if transitioning to published
        ...(validatedData.status === 'PUBLISHED' && !existingWork.publishedAt && { publishedAt: new Date() })
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      work: updatedWork,
      message: 'Work updated successfully'
    });

  } catch (error) {
    logError('Error updating work:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const workId = searchParams.get('id');

    if (!workId) {
      return NextResponse.json(
        { error: 'Work ID is required' },
        { status: 400 }
      );
    }

    // Check if work exists and user owns it
    const work = await prisma.work.findUnique({
      where: { id: workId }
    });

    if (!work) {
      return NextResponse.json(
        { error: 'Work not found' },
        { status: 404 }
      );
    }

    if (work.authorId !== user.id) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    // Delete the work
    await prisma.work.delete({
      where: { id: workId }
    });

    return NextResponse.json({
      success: true,
      message: 'Work deleted successfully'
    });

  } catch (error) {
    logError('Error deleting work:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}