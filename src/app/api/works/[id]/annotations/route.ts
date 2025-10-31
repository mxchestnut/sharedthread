import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logError } from '@/lib/error-logger';
import { createNotification } from '@/lib/notifications';


interface Params {
  id: string;
}

// GET - Fetch all annotations for a work
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id: workId } = await params;
    const user = await getCurrentUser();

    // Check if work exists
    const work = await prisma.work.findUnique({
      where: { id: workId },
      select: {
        id: true,
        status: true,
        authorId: true,
        acceptingFeedback: true,
      },
    });

    if (!work) {
      return NextResponse.json(
        { error: 'Work not found' },
        { status: 404 }
      );
    }

    // Check permissions - only BETA works with acceptingFeedback or work author can view annotations
    if (work.status !== 'BETA' || !work.acceptingFeedback) {
      if (!user || (work.authorId !== user.id && user.role !== 'admin')) {
        return NextResponse.json(
          { error: 'Annotations not available for this work' },
          { status: 403 }
        );
      }
    }

    // Fetch annotations
    const annotations = await prisma.annotation.findMany({
      where: { workId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: [
        { paragraphIndex: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    return NextResponse.json({ annotations });
  } catch (error) {
    logError('Error fetching annotations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new annotation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id: workId } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { paragraphIndex, startOffset, endOffset, content, type } = await request.json();

    // Validate input
    if (typeof paragraphIndex !== 'number' || paragraphIndex < 0) {
      return NextResponse.json(
        { error: 'Invalid paragraph index' },
        { status: 400 }
      );
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Annotation content is required' },
        { status: 400 }
      );
    }

    if (startOffset !== null && typeof startOffset !== 'number') {
      return NextResponse.json(
        { error: 'Invalid start offset' },
        { status: 400 }
      );
    }

    if (endOffset !== null && typeof endOffset !== 'number') {
      return NextResponse.json(
        { error: 'Invalid end offset' },
        { status: 400 }
      );
    }

    const validTypes = ['FEEDBACK', 'SUGGESTION', 'QUESTION', 'PRAISE'];
    if (type && !validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid annotation type' },
        { status: 400 }
      );
    }

    // Check if work exists and is accepting feedback
    const work = await prisma.work.findUnique({
      where: { id: workId },
      select: {
        id: true,
        status: true,
        authorId: true,
        acceptingFeedback: true,
      },
    });

    if (!work) {
      return NextResponse.json(
        { error: 'Work not found' },
        { status: 404 }
      );
    }

    // Only allow annotations on BETA works that are accepting feedback
    if (work.status !== 'BETA' || !work.acceptingFeedback) {
      return NextResponse.json(
        { error: 'This work is not currently accepting annotations' },
        { status: 403 }
      );
    }

    // Create the annotation
    const annotation = await prisma.annotation.create({
      data: {
        workId,
        userId: user.id,
        paragraphIndex,
        startOffset: startOffset || null,
        endOffset: endOffset || null,
        content: content.trim(),
        type: type || 'FEEDBACK',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
              },
            },
          },
        },
      },
    });

    // Notify the work author about the new annotation (if not self-annotating)
    if (work.authorId !== user.id) {
      const typeLabel = type ? type.toLowerCase() : 'feedback';
      await createNotification({
        userId: work.authorId,
        actorId: user.id,
        type: 'COMMENT',
        message: `${user.displayName || user.username} left ${typeLabel} on your Beta work`,
        link: `/works/${workId}#annotation-${annotation.id}`,
        metadata: { workId, annotationId: annotation.id, type: annotation.type },
      });
    }

    return NextResponse.json({
      annotation,
      message: 'Annotation created successfully',
    });
  } catch (error) {
    logError('Error creating annotation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}