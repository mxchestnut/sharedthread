import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { listNotifications } from '@/lib/notifications';
import { logError } from '@/lib/error-logger';

// GET /api/notifications?filter=all|unread|mentions|interactions&take=50&skip=0
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = (searchParams.get('filter') as 'all' | 'unread' | 'mentions' | 'interactions') || 'all';
    const take = Math.min(Number(searchParams.get('take') || 50), 100);
    const skip = Number(searchParams.get('skip') || 0);

    const data = await listNotifications({ userId: user.id, filter, take, skip });
    return NextResponse.json(data);
  } catch (error) {
    logError('Notifications GET error', error, { apiRoute: '/api/notifications' });
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}
