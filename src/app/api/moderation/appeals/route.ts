import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logError } from '@/lib/error-logger';


export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { targetType, targetId, reason, message } = await request.json();
    if (!targetType || !targetId || !reason) {
      return NextResponse.json({ error: 'targetType, targetId, and reason are required' }, { status: 400 });
    }

    if (targetType !== 'POST' && targetType !== 'REPLY') {
      return NextResponse.json({ error: 'Invalid targetType' }, { status: 400 });
    }

    // Verify target exists and update its moderationStatus
    if (targetType === 'POST') {
      const post = await prisma.discussionPost.findUnique({ where: { id: targetId } });
      if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      await prisma.discussionPost.update({
        where: { id: targetId },
        data: { moderationStatus: 'UNDER_APPEAL' },
      });
    } else {
      const reply = await prisma.discussionReply.findUnique({ where: { id: targetId } });
      if (!reply) return NextResponse.json({ error: 'Reply not found' }, { status: 404 });
      await prisma.discussionReply.update({
        where: { id: targetId },
        data: { moderationStatus: 'UNDER_APPEAL' },
      });
    }

    const appeal = await prisma.moderationAppeal.create({
      data: {
        targetType,
        postId: targetType === 'POST' ? targetId : null,
        replyId: targetType === 'REPLY' ? targetId : null,
        userId: user.id,
        reason,
        message: message || null,
        status: 'PENDING',
      },
    });

    return NextResponse.json(appeal, { status: 201 });
  } catch (error) {
    logError('Error creating appeal:', error);
    return NextResponse.json({ error: 'Failed to create appeal' }, { status: 500 });
  }
}
