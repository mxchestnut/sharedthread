import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkCollectionSpam } from '@/lib/ai/spam-detector';
import { logError } from '@/lib/error-logger';


// GET - Fetch user's collections
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const collections = await prisma.collection.findMany({
      where: { ownerId: user.id },
      include: {
        _count: {
          select: {
            items: true,
          },
        },
        items: {
          take: 5, // Preview items
          include: {
            work: {
              select: {
                id: true,
                title: true,
                excerpt: true,
                author: {
                  select: {
                    displayName: true,
                    username: true,
                  },
                },
              },
            },
          },
          orderBy: {
            addedAt: 'desc',
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({ collections });
  } catch (error) {
    logError('Error fetching collections:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new collection
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { name, description, isPublic } = await request.json();

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Collection name is required' },
        { status: 400 }
      );
    }

    if (name.trim().length > 100) {
      return NextResponse.json(
        { error: 'Collection name must be 100 characters or less' },
        { status: 400 }
      );
    }

    if (description && description.length > 500) {
      return NextResponse.json(
        { error: 'Description must be 500 characters or less' },
        { status: 400 }
      );
    }

    // Check if user already has a collection with this name
    const existingCollection = await prisma.collection.findFirst({
      where: {
        ownerId: user.id,
        name: name.trim(),
      },
    });

    if (existingCollection) {
      return NextResponse.json(
        { error: 'You already have a collection with this name' },
        { status: 400 }
      );
    }

    // Check for spam
    const spamCheck = await checkCollectionSpam(
      name.trim(),
      description?.trim() || '',
      user.id
    );

    if (spamCheck.shouldBlock) {
      return NextResponse.json({
        error: 'This collection has been flagged as potential spam.',
        reasons: spamCheck.reasons
      }, { status: 400 });
    }

    // Create the collection
    const collection = await prisma.collection.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        isPublic: !!isPublic,
        ownerId: user.id,
      },
      include: {
        _count: {
          select: {
            items: true,
          },
        },
        items: {
          include: {
            work: {
              select: {
                id: true,
                title: true,
                excerpt: true,
                author: {
                  select: {
                    displayName: true,
                    username: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      collection,
      message: 'Collection created successfully',
    });
  } catch (error) {
    logError('Error creating collection:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}