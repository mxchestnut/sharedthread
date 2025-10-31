import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logError } from '@/lib/error-logger';


// Mock session for development - replace with actual auth
const getMockSession = () => ({ user: { id: 'user-1' } });

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = getMockSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: collectionId, itemId } = await params;

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