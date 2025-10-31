import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logError } from '@/lib/error-logger';
import { createNotification } from '@/lib/notifications';


interface Params {
  username: string;
}

// POST - Follow a user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { username } = await params;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Find the user to follow
    const userToFollow = await prisma.users.findUnique({
      where: { username },
      select: { id: true, username: true, displayName: true },
    });

    if (!userToFollow) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Can't follow yourself
    if (userToFollow.id === currentUser.id) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      );
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: userToFollow.id,
        },
      },
    });

    if (existingFollow) {
      return NextResponse.json(
        { error: 'Already following this user' },
        { status: 400 }
      );
    }

    // Create follow relationship
    await prisma.follow.create({
      data: {
        followerId: currentUser.id,
        followingId: userToFollow.id,
      },
    });

    // Notify the user they have a new follower
    await createNotification({
      userId: userToFollow.id,
      actorId: currentUser.id,
      type: 'FOLLOW',
      message: `${currentUser.displayName || currentUser.username} started following you`,
      link: `/users/${currentUser.username}`,
    });

    return NextResponse.json({
      message: `Now following ${userToFollow.displayName}`,
    });
  } catch (error) {
    logError('Error following user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Unfollow a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { username } = await params;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Find the user to unfollow
    const userToUnfollow = await prisma.users.findUnique({
      where: { username },
      select: { id: true, username: true, displayName: true },
    });

    if (!userToUnfollow) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Find and delete follow relationship
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: userToUnfollow.id,
        },
      },
    });

    if (!follow) {
      return NextResponse.json(
        { error: 'Not following this user' },
        { status: 400 }
      );
    }

    await prisma.follow.delete({
      where: { id: follow.id },
    });

    return NextResponse.json({
      message: `Unfollowed ${userToUnfollow.displayName}`,
    });
  } catch (error) {
    logError('Error unfollowing user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}