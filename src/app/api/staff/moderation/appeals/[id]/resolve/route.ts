import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logError } from '@/lib/error-logger';


export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = params;
    const { decision, staffNotes } = await request.json();
    if (!decision || !['APPROVED', 'REJECTED'].includes(decision)) {
      return NextResponse.json({ error: 'decision must be APPROVED or REJECTED' }, { status: 400 });
    }

    const appeal = await prisma.moderationAppeal.findUnique({ where: { id } });
    if (!appeal) return NextResponse.json({ error: 'Appeal not found' }, { status: 404 });

    // Update the target moderation status based on decision
    if (appeal.targetType === 'POST' && appeal.postId) {
      if (decision === 'APPROVED') {
        await prisma.discussionPost.update({
          where: { id: appeal.postId },
          data: { moderationStatus: 'OVERRIDDEN', moderationNotes: staffNotes || null },
        });
      } else {
        await prisma.discussionPost.update({
          where: { id: appeal.postId },
          data: { moderationStatus: 'FLAGGED', moderationNotes: staffNotes || null },
        });
      }
    }
    if (appeal.targetType === 'REPLY' && appeal.replyId) {
      if (decision === 'APPROVED') {
        await prisma.discussionReply.update({
          where: { id: appeal.replyId },
          data: { moderationStatus: 'OVERRIDDEN', moderationNotes: staffNotes || null },
        });
      } else {
        await prisma.discussionReply.update({
          where: { id: appeal.replyId },
          data: { moderationStatus: 'FLAGGED', moderationNotes: staffNotes || null },
        });
      }
    }

    const updated = await prisma.moderationAppeal.update({
      where: { id },
      data: {
        status: decision,
        staffUserId: user.id,
        staffNotes: staffNotes || null,
      },
    });

    return NextResponse.json({ appeal: updated });
  } catch (error) {
    logError('Error resolving appeal:', error);
    return NextResponse.json({ error: 'Failed to resolve appeal' }, { status: 500 });
  }
}
