import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { markNotificationsRead } from '@/lib/notifications';
import { logError } from '@/lib/error-logger';

// POST /api/notifications/mark-read
// Body: { ids?: string[], all?: boolean }
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { ids, all } = await request.json();
    const count = await markNotificationsRead({ userId: user.id, ids, all });
    return NextResponse.json({ updated: count });
  } catch (error) {
    logError('Notifications mark-read error', error, { apiRoute: '/api/notifications/mark-read' });
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
