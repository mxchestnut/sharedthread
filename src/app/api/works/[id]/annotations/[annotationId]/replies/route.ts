import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logError } from '@/lib/error-logger';
import { createNotification } from '@/lib/notifications';


interface Params {
  id: string;
  annotationId: string;
}

// POST - Add a reply to an annotation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { annotationId } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { content } = await request.json();

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Reply content is required' },
        { status: 400 }
      );
    }

    // Check if annotation exists and get work info
    const annotation = await prisma.annotation.findUnique({
      where: { id: annotationId },
      include: {
        work: {
          select: {
            id: true,
            status: true,
            authorId: true,
            acceptingFeedback: true,
          },
        },
      },
    });

    if (!annotation) {
      return NextResponse.json(
        { error: 'Annotation not found' },
        { status: 404 }
      );
    }

    // Check if work is still accepting feedback or user has permissions
    const work = annotation.work;
    if (!work) {
      return NextResponse.json(
        { error: 'Work not found' },
        { status: 404 }
      );
    }

    if (work.status !== 'BETA' || !work.acceptingFeedback) {
      if (work.authorId !== user.id && user.role !== 'admin') {
        return NextResponse.json(
          { error: 'This work is no longer accepting annotation replies' },
          { status: 403 }
        );
      }
    }

    // Create the reply
    const reply = await prisma.annotationReply.create({
      data: {
        annotationId,
        userId: user.id,
        content: content.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    });

    // Notify the annotation author (if not replying to own annotation)
    if (annotation.userId !== user.id) {
      await createNotification({
        userId: annotation.userId,
        actorId: user.id,
        type: 'COMMENT',
        message: `${user.displayName || user.username} replied to your annotation`,
        link: `/works/${work.id}#annotation-${annotationId}`,
        metadata: { workId: work.id, annotationId, replyId: reply.id },
      });
    }

    // Also notify the work author if they're not involved yet
    if (work.authorId !== user.id && work.authorId !== annotation.userId) {
      await createNotification({
        userId: work.authorId,
        actorId: user.id,
        type: 'COMMENT',
        message: `${user.displayName || user.username} replied to an annotation on your work`,
        link: `/works/${work.id}#annotation-${annotationId}`,
        metadata: { workId: work.id, annotationId, replyId: reply.id },
      });
    }

    return NextResponse.json({
      reply,
      message: 'Reply added successfully',
    });
  } catch (error) {
    logError('Error creating annotation reply:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}