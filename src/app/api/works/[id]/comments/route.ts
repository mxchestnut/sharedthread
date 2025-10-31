import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logError } from '@/lib/error-logger';
import { createNotification } from '@/lib/notifications';


interface Params {
  id: string;
}

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

    const { content, parentId } = await request.json();

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    // Verify the work exists and is accessible
    const work = await prisma.work.findUnique({
      where: { id: workId },
      select: {
        id: true,
        status: true,
        authorId: true,
      },
    });

    if (!work) {
      return NextResponse.json(
        { error: 'Work not found' },
        { status: 404 }
      );
    }

    // Only allow comments on published works (or by author/admin on any work)
    if (work.status !== 'PUBLISHED' && work.authorId !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Cannot comment on unpublished works' },
        { status: 403 }
      );
    }

    // If parentId is provided, verify the parent comment exists and belongs to this work
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { workId: true },
      });

      if (!parentComment || parentComment.workId !== workId) {
        return NextResponse.json(
          { error: 'Invalid parent comment' },
          { status: 400 }
        );
      }
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        authorId: user.id,
        workId,
        parentId: parentId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    });

    // Notify the work author (if not commenting on own work)
    if (work.authorId !== user.id) {
      await createNotification({
        userId: work.authorId,
        actorId: user.id,
        type: 'COMMENT',
        message: `${user.displayName || user.username} commented on your work`,
        link: `/works/${workId}#comment-${comment.id}`,
        metadata: { workId, commentId: comment.id },
      });
    }

    // If replying to a comment, notify the parent comment author
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { authorId: true },
      });
      
      if (parentComment && parentComment.authorId !== user.id && parentComment.authorId !== work.authorId) {
        await createNotification({
          userId: parentComment.authorId,
          actorId: user.id,
          type: 'COMMENT',
          message: `${user.displayName || user.username} replied to your comment`,
          link: `/works/${workId}#comment-${comment.id}`,
          metadata: { workId, commentId: comment.id, parentId },
        });
      }
    }

    return NextResponse.json({ 
      comment,
      message: 'Comment posted successfully' 
    });

  } catch (error) {
    logError('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}