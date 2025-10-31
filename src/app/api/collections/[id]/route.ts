import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logError } from '@/lib/error-logger';


// Mock session for development - replace with actual auth
const getMockSession = () => ({ user: { id: 'user-1' } });

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getMockSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: collectionId } = await params;
    
    // Fetch collection with items
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        items: {
          orderBy: { addedAt: 'desc' },
          include: {
            work: {
              include: {
                author: {
                  select: {
                    id: true,
                    username: true,
                    displayName: true,
                  },
                },
                _count: {
                  select: {
                    comments: true,
                    ratings: true,
                  },
                },
                ratings: {
                  select: {
                    value: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
    });

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // Check permissions
    const isOwner = collection.owner.id === session.user.id;
    if (!collection.isPublic && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Calculate average rating for each work
    const enhancedItems = collection.items.map((item) => ({
      ...item,
      work: {
        ...item.work,
        rating: item.work.ratings.length > 0 
          ? item.work.ratings.reduce((sum: number, r) => sum + r.value, 0) / item.work.ratings.length
          : undefined,
        ratings: undefined, // Remove ratings array from response
      },
    }));

    const enhancedCollection = {
      ...collection,
      items: enhancedItems,
      isOwner,
    };

    return NextResponse.json({ collection: enhancedCollection });
  } catch (error) {
    logError('Error fetching collection:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getMockSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: collectionId } = await params;
    const { name, description, isPublic } = await request.json();

    // Validate input
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Collection name is required' }, { status: 400 });
    }

    // Check if collection exists and user owns it
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      select: { ownerId: true },
    });

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    if (collection.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check for duplicate name (excluding current collection)
    const existingCollection = await prisma.collection.findFirst({
      where: {
        ownerId: session.user.id,
        name: name.trim(),
        id: { not: collectionId },
      },
    });

    if (existingCollection) {
      return NextResponse.json({ error: 'You already have a collection with this name' }, { status: 400 });
    }

    // Update collection
    const updatedCollection = await prisma.collection.update({
      where: { id: collectionId },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        isPublic: Boolean(isPublic),
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
    });

    return NextResponse.json({ collection: updatedCollection });
  } catch (error) {
    logError('Error updating collection:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getMockSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: collectionId } = await params;

    // Check if collection exists and user owns it
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      select: { ownerId: true },
    });

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    if (collection.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete collection (items will be deleted due to CASCADE)
    await prisma.collection.delete({
      where: { id: collectionId },
    });

    return NextResponse.json({ message: 'Collection deleted successfully' });
  } catch (error) {
    logError('Error deleting collection:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}