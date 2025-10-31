import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logError } from '@/lib/error-logger';


export async function GET() {
  try {
    // Check authentication and admin role
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Fetch dashboard statistics
    const [
      pendingProposals,
      totalUsers,
      totalProposals,
      totalCommunities,
      recentUsers,
      recentProposals
    ] = await Promise.all([
      // Pending proposals count
      prisma.communityProposal.count({
        where: { status: 'PENDING' }
      }),

      // Total users count
      prisma.users.count(),

      // Total proposals count
      prisma.communityProposal.count(),

      // Total communities count
      prisma.community.count(),

      // Recent users (last 7 days)
      prisma.users.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        select: {
          id: true,
          username: true,
          email: true,
          displayName: true,
          role: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),

      // Recent proposals (last 30 days)
      prisma.communityProposal.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        include: {
          proposer: {
            select: {
              id: true,
              username: true,
              displayName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    // Calculate some additional metrics
    const activeUsers = await prisma.users.count({
      where: {
        lastActiveAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    });

    const approvedProposals = await prisma.communityProposal.count({
      where: { status: 'APPROVED' }
    });

    const rejectedProposals = await prisma.communityProposal.count({
      where: { status: 'REJECTED' }
    });

    return NextResponse.json({
      stats: {
        pendingProposals,
        totalUsers,
        activeUsers,
        totalProposals,
        approvedProposals,
        rejectedProposals,
        totalCommunities
      },
      recentActivity: {
        users: recentUsers,
        proposals: recentProposals
      }
    });

  } catch (error) {
    logError('Staff dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}