import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logError } from '@/lib/error-logger';


export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const url = new URL(request.url);
    const statusFilter = url.searchParams.get('status');

    const appeals = await prisma.moderationAppeal.findMany({
      where: statusFilter ? { status: statusFilter as 'PENDING' | 'APPROVED' | 'REJECTED' } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        post: true,
        reply: true,
        user: {
          select: { id: true, username: true, displayName: true, avatarUrl: true }
        },
      },
    });

    return NextResponse.json({ appeals });
  } catch (error) {
    logError('Error listing appeals:', error);
    return NextResponse.json({ error: 'Failed to list appeals' }, { status: 500 });
  }
}
