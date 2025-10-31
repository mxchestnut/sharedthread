import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logError } from '@/lib/error-logger';


// Mock admin check - replace with actual auth
const checkAdminAuth = () => {
  // In real implementation, verify JWT and check user role
  return { isAdmin: true, userId: 'admin-1' };
};

export async function GET(request: NextRequest) {
  try {
    const auth = checkAdminAuth();
    if (!auth.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d';
    
    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (range) {
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default: // 7d
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Fetch growth data
    const [userGrowth, workGrowth, engagementData] = await Promise.all([
      // User growth over time
      prisma.users.findMany({
        where: {
          createdAt: { gte: startDate },
        },
        select: {
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
      
      // Work growth over time
      prisma.work.findMany({
        where: {
          createdAt: { gte: startDate },
          status: 'PUBLISHED',
        },
        select: {
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
      
      // Engagement data (comments + ratings)
      Promise.all([
        prisma.comment.findMany({
          where: {
            createdAt: { gte: startDate },
          },
          select: {
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        }),
        prisma.rating.findMany({
          where: {
            createdAt: { gte: startDate },
          },
          select: {
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        }),
      ]),
    ]);

    // Fetch top content
    const [topWorks, topAuthors] = await Promise.all([
      // Top works by view count and rating
      prisma.work.findMany({
        where: { status: 'PUBLISHED' },
        take: 10,
        orderBy: [
          { viewCount: 'desc' },
        ],
        select: {
          id: true,
          title: true,
          viewCount: true,
          author: {
            select: {
              displayName: true,
            },
          },
          ratings: {
            select: {
              value: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
      }),
      
      // Top authors by follower count and work count
      prisma.users.findMany({
        take: 10,
        orderBy: [
          { followers: { _count: 'desc' } },
        ],
        select: {
          id: true,
          displayName: true,
          _count: {
            select: {
              works: true,
              followers: true,
            },
          },
          works: {
            where: { status: 'PUBLISHED' },
            select: {
              ratings: {
                select: {
                  value: true,
                },
              },
            },
          },
        },
      }),
    ]);

    // Process data for charts
    const processGrowthData = (data: Array<{ createdAt: Date }>) => {
      const dailyData: { [key: string]: number } = {};
      
      data.forEach(item => {
        const date = item.createdAt.toISOString().split('T')[0];
        dailyData[date] = (dailyData[date] || 0) + 1;
      });
      
      return Object.entries(dailyData).map(([date, count]) => ({ date, count }));
    };

    // Process engagement data
    const [comments, ratings] = engagementData;
    const processEngagementData = () => {
      const dailyData: { [key: string]: { comments: number; ratings: number } } = {};
      
      comments.forEach(item => {
        const date = item.createdAt.toISOString().split('T')[0];
        if (!dailyData[date]) dailyData[date] = { comments: 0, ratings: 0 };
        dailyData[date].comments++;
      });
      
      ratings.forEach(item => {
        const date = item.createdAt.toISOString().split('T')[0];
        if (!dailyData[date]) dailyData[date] = { comments: 0, ratings: 0 };
        dailyData[date].ratings++;
      });
      
      return Object.entries(dailyData).map(([date, data]) => ({ date, ...data }));
    };

    // Calculate engagement metrics (mock data)
    const engagementMetrics = {
      dailyActive: Math.floor(Math.random() * 1000) + 500,
      weeklyActive: Math.floor(Math.random() * 5000) + 2000,
      monthlyActive: Math.floor(Math.random() * 15000) + 8000,
      avgSessionDuration: Math.floor(Math.random() * 60) + 15, // minutes
    };

    // Process top works
    const processedWorks = topWorks.map(work => ({
      id: work.id,
      title: work.title,
      author: work.author.displayName,
      views: work.viewCount,
      rating: work.ratings.length > 0 
        ? work.ratings.reduce((sum, r) => sum + r.value, 0) / work.ratings.length
        : 0,
      comments: work._count.comments,
    }));

    // Process top authors
    const processedAuthors = topAuthors.map(author => {
      const allRatings = author.works.flatMap(work => work.ratings.map(r => r.value));
      const avgRating = allRatings.length > 0 
        ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length
        : 0;

      return {
        id: author.id,
        name: author.displayName,
        works: author._count.works,
        followers: author._count.followers,
        avgRating,
      };
    });

    const analytics = {
      growth: {
        users: processGrowthData(userGrowth),
        works: processGrowthData(workGrowth),
        engagement: processEngagementData(),
      },
      topContent: {
        works: processedWorks,
        authors: processedAuthors,
      },
      engagement: engagementMetrics,
    };

    return NextResponse.json({ analytics });
  } catch (error) {
    logError('Error fetching admin analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}