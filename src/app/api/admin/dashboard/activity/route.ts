import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logError } from '@/lib/error-logger';


// Mock admin check - replace with actual auth
const checkAdminAuth = () => {
  // In real implementation, verify JWT and check user role
  return { isAdmin: true, userId: 'admin-1' };
};

export async function GET() {
  try {
    const auth = checkAdminAuth();
    if (!auth.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch recent activities from various sources
    const [recentUsers, recentWorks, recentComments] = await Promise.all([
      // Recent users (last 10)
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          displayName: true,
          createdAt: true,
        },
      }),
      
      // Recent published works (last 10)
      prisma.work.findMany({
        where: { status: 'PUBLISHED' },
        take: 5,
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true,
          title: true,
          publishedAt: true,
          author: {
            select: {
              username: true,
              displayName: true,
            },
          },
        },
      }),
      
      // Recent comments (last 10)
      prisma.comment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          createdAt: true,
          author: {
            select: {
              username: true,
              displayName: true,
            },
          },
          work: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
    ]);

    // Combine and format activities
    const activities = [
      // User registrations
      ...recentUsers.map(user => ({
        id: `user-${user.id}`,
        type: 'user_joined' as const,
        description: `New user ${user.displayName} joined the platform`,
        timestamp: user.createdAt.toISOString(),
        user: {
          username: user.username,
          displayName: user.displayName,
        },
      })),
      
      // Work publications
      ...recentWorks.map(work => ({
        id: `work-${work.id}`,
        type: 'work_published' as const,
        description: `${work.author.displayName} published "${work.title}"`,
        timestamp: work.publishedAt?.toISOString() || new Date().toISOString(),
        user: work.author,
        work: {
          id: work.id,
          title: work.title,
        },
      })),
      
      // Comments
      ...recentComments.map(comment => ({
        id: `comment-${comment.id}`,
        type: 'comment_added' as const,
        description: `${comment.author.displayName} commented on "${comment.work.title}"`,
        timestamp: comment.createdAt.toISOString(),
        user: comment.author,
        work: comment.work,
      })),
    ];

    // Sort by timestamp (most recent first) and take top 20
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const recentActivity = activities.slice(0, 20);

    return NextResponse.json({ activity: recentActivity });
  } catch (error) {
    logError('Error fetching admin dashboard activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}