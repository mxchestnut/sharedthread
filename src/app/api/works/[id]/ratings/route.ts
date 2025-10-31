import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logError } from '@/lib/error-logger';
import { createNotification } from '@/lib/notifications';


interface Params {
  id: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id: workId } = await params;
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { value, review } = await request.json();

    // Validate rating value
    if (typeof value !== 'number' || value < 1 || value > 5 || !Number.isInteger(value)) {
      return NextResponse.json(
        { error: 'Rating must be an integer between 1 and 5' },
        { status: 400 }
      );
    }

    // Validate review if provided
    if (review && (typeof review !== 'string' || review.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Review must be a non-empty string if provided' },
        { status: 400 }
      );
    }

    // Verify the work exists and is published
    const work = await prisma.work.findUnique({
      where: { id: workId },
      select: {
        id: true,
        status: true,
        authorId: true,
      },
    });

    if (!work) {
      return NextResponse.json(
        { error: 'Work not found' },
        { status: 404 }
      );
    }

    // Only allow ratings on published works
    if (work.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Cannot rate unpublished works' },
        { status: 403 }
      );
    }

    // Prevent authors from rating their own work
    if (work.authorId === user.id) {
      return NextResponse.json(
        { error: 'Cannot rate your own work' },
        { status: 403 }
      );
    }

    // Check if user has already rated this work
    const existingRating = await prisma.rating.findUnique({
      where: {
        workId_userId: {
          workId,
          userId: user.id,
        },
      },
    });

    let rating;

    if (existingRating) {
      // Update existing rating
      rating = await prisma.rating.update({
        where: { id: existingRating.id },
        data: {
          value,
          review: review?.trim() || null,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
            },
          },
        },
      });
    } else {
      // Create new rating
      rating = await prisma.rating.create({
        data: {
          value,
          review: review?.trim() || null,
          userId: user.id,
          workId,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
            },
          },
        },
      });

      // Notify the work author about the new rating
      await createNotification({
        userId: work.authorId,
        actorId: user.id,
        type: 'LIKE',
        message: `${user.displayName || user.username} rated your work ${value} stars${review ? ' and left a review' : ''}`,
        link: `/works/${workId}`,
        metadata: { workId, ratingId: rating.id, value },
      });
    }

    return NextResponse.json({ 
      rating,
      message: existingRating ? 'Rating updated successfully' : 'Rating submitted successfully'
    });

  } catch (error) {
    logError('Error creating/updating rating:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}