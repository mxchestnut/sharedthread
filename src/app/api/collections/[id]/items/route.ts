import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logError } from '@/lib/error-logger';


// Mock session for development - replace with actual auth
const getMockSession = () => ({ user: { id: 'user-1' } });

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const session = getMockSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: collectionId, itemId } = params;

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

    // Check if item exists in this collection
    const item = await prisma.collectionItem.findFirst({
      where: {
        id: itemId,
        collectionId: collectionId,
      },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found in collection' }, { status: 404 });
    }

    // Delete the item from the collection
    await prisma.collectionItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ message: 'Item removed from collection successfully' });
  } catch (error) {
    logError('Error removing item from collection:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getMockSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const collectionId = params.id;
    const { workId } = await request.json();

    if (!workId) {
      return NextResponse.json({ error: 'Work ID is required' }, { status: 400 });
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

    // Check if work exists
    const work = await prisma.work.findUnique({
      where: { id: workId },
      select: { id: true, status: true },
    });

    if (!work) {
      return NextResponse.json({ error: 'Work not found' }, { status: 404 });
    }

    // Only allow published works in collections (or beta works)
    if (work.status === 'DRAFT') {
      return NextResponse.json({ error: 'Cannot add draft works to collections' }, { status: 400 });
    }

    // Check if work is already in collection
    const existingItem = await prisma.collectionItem.findFirst({
      where: {
        collectionId: collectionId,
        workId: workId,
      },
    });

    if (existingItem) {
      return NextResponse.json({ error: 'Work is already in this collection' }, { status: 400 });
    }

    // Add work to collection
    const newItem = await prisma.collectionItem.create({
      data: {
        collectionId: collectionId,
        workId: workId,
      },
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
          },
        },
      },
    });

    return NextResponse.json({ item: newItem });
  } catch (error) {
    logError('Error adding item to collection:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}