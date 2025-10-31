import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { checkProfileSpam } from '@/lib/ai/spam-detector';
import { logError } from '@/lib/error-logger';


export async function POST(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const displayName = formData.get('displayName') as string;
    const bio = formData.get('bio') as string;
    const avatarFile = formData.get('avatar') as File | null;

    // Validate display name
    if (!displayName || displayName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Display name is required' },
        { status: 400 }
      );
    }

    if (displayName.length > 100) {
      return NextResponse.json(
        { error: 'Display name must be less than 100 characters' },
        { status: 400 }
      );
    }

    // Validate bio
    if (bio && bio.length > 500) {
      return NextResponse.json(
        { error: 'Bio must be less than 500 characters' },
        { status: 400 }
      );
    }

    // Check for spam in profile updates
    const spamCheck = await checkProfileSpam(
      displayName.trim(),
      bio?.trim() || '',
      user.id
    );

    if (spamCheck.shouldBlock) {
      return NextResponse.json({
        error: 'Profile update flagged as potential spam.',
        reasons: spamCheck.reasons
      }, { status: 400 });
    }

    // TODO: Handle avatar upload with cloud storage (Azure Blob Storage)
    // For now, we'll skip file uploads in production and just update text fields
    if (avatarFile && avatarFile.size > 0) {
      // Validate file size (5MB max)
      if (avatarFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Image must be less than 5MB' },
          { status: 400 }
        );
      }

      // Validate file type
      if (!avatarFile.type.startsWith('image/')) {
        return NextResponse.json(
          { error: 'File must be an image' },
          { status: 400 }
        );
      }

      // TODO: Implement Azure Blob Storage upload
      // For now, return an error message
      return NextResponse.json(
        { error: 'Photo uploads are temporarily disabled. We\'re working on cloud storage integration.' },
        { status: 400 }
      );
    }

    // Update user in database (only display name and bio for now)
    const updatedUser = await prisma.users.update({
      where: { id: user.id },
      data: {
        displayName: displayName.trim(),
        bio: bio.trim() || null,
      },
      include: {
        _count: {
          select: {
            works: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    // Return updated user data (excluding sensitive fields)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, totpSecret, ...safeUser } = updatedUser;

    return NextResponse.json(safeUser);
  } catch (error) {
    logError('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
