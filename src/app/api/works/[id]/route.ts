import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logError } from '@/lib/error-logger';


interface Params {
  id: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    // Find the work
    const work = await prisma.work.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true
          }
        },
        community: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                displayName: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true
              }
            }
          }
        },
        _count: {
          select: {
            comments: true,
            ratings: true
          }
        }
      }
    });

    if (!work) {
      return NextResponse.json(
        { error: 'Work not found' },
        { status: 404 }
      );
    }

    // Check permissions for non-published works
    if (work.status !== 'PUBLISHED') {
      if (!user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      
      // Only author or staff can view non-published works
      if (work.authorId !== user.id && user.role !== 'admin') {
        return NextResponse.json(
          { error: 'You do not have permission to view this work' },
          { status: 403 }
        );
      }
    }

    // Increment view count if not author (and user exists)
    if (user && work.authorId !== user.id) {
      await prisma.work.update({
        where: { id },
        data: {
          viewCount: {
            increment: 1
          }
        }
      });
    }

    // Calculate average rating
    const avgRating = work.ratings.length > 0 
      ? work.ratings.reduce((sum, rating) => sum + rating.value, 0) / work.ratings.length
      : null;

    return NextResponse.json({ 
      work: {
        ...work,
        rating: avgRating,
      }
    });

  } catch (error) {
    logError('Error fetching work:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}