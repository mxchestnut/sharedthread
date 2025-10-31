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
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'ALL';
    const limit = 20;
    const offset = (page - 1) * limit;

    // Build where clause
    const where: {
      OR?: Array<{
        username?: { contains: string; mode: 'insensitive' };
        displayName?: { contains: string; mode: 'insensitive' };
        email?: { contains: string; mode: 'insensitive' };
      }>;
    } = {};
    
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Note: status filter would be implemented when user status field is added to schema

    // Fetch users with counts
    const [users, totalCount] = await Promise.all([
      prisma.users.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          displayName: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              works: true,
              comments: true,
              followers: true,
              following: true,
            },
          },
        },
      }),
      prisma.users.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // Add mock status and lastLoginAt for display
    const enhancedUsers = users.map(user => ({
      ...user,
      status: 'ACTIVE', // Mock status - implement when user status field is added
      lastLoginAt: user.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      users: enhancedUsers,
      totalPages,
      currentPage: page,
      totalCount,
    });
  } catch (error) {
    logError('Error fetching admin users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}