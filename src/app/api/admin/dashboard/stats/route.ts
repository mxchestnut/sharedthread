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

    // Get date ranges for calculations
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Fetch user stats
    const [totalUsers, newUsersThisWeek, activeUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: weekAgo,
          },
        },
      }),
      // Use recent activity as proxy for active users
      prisma.user.count({
        where: {
          updatedAt: {
            gte: weekAgo,
          },
        },
      }),
    ]);

    // Fetch work stats
    const [totalWorks, publishedWorks, betaWorks, draftWorks] = await Promise.all([
      prisma.work.count(),
      prisma.work.count({
        where: { status: 'PUBLISHED' },
      }),
      prisma.work.count({
        where: { status: 'BETA' },
      }),
      prisma.work.count({
        where: { status: 'DRAFT' },
      }),
    ]);

    // Fetch activity stats
    const [totalComments, totalRatings, totalFollows, totalCollections] = await Promise.all([
      prisma.comment.count(),
      prisma.rating.count(),
      prisma.follow.count(),
      prisma.collection.count(),
    ]);

    // Fetch moderation stats (mock data - in real implementation use actual report model)
    const [pendingReports, resolvedToday] = await Promise.all([
      // Mock pending reports
      Promise.resolve(Math.floor(Math.random() * 10)),
      // Mock resolved reports
      Promise.resolve(Math.floor(Math.random() * 5)),
    ]);

    const stats = {
      users: {
        total: totalUsers,
        newThisWeek: newUsersThisWeek,
        active: activeUsers,
      },
      works: {
        total: totalWorks,
        published: publishedWorks,
        beta: betaWorks,
        drafts: draftWorks,
      },
      activity: {
        comments: totalComments,
        ratings: totalRatings,
        follows: totalFollows,
        collections: totalCollections,
      },
      moderation: {
        pendingReports,
        resolvedToday,
      },
    };

    return NextResponse.json({ stats });
  } catch (error) {
    logError('Error fetching admin dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}