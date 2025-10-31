import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logError } from '@/lib/error-logger';


export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { slug } = await params;
    const { privacyLevel, isPrivate } = await request.json();

    // Validate privacy level
    if (!['PUBLIC', 'GUARDED', 'PRIVATE'].includes(privacyLevel)) {
      return NextResponse.json({ error: 'Invalid privacy level' }, { status: 400 });
    }

    // Get the community and check ownership
    const community = await prisma.community.findFirst({
      where: {
        slug: slug,
        isApproved: true
      },
      include: {
        members: {
          where: {
            userId: user.id,
            role: 'ADMIN'
          }
        }
      }
    });

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // Check if user is owner/admin or site admin
    const isOwner = community.ownerId === user.id;
    const isCommunityAdmin = community.members.length > 0;
    const isSiteAdmin = user.role === 'admin';
    
    if (!isOwner && !isCommunityAdmin && !isSiteAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get current privacy level from the dedicated column
    const currentPrivacyLevel = community.privacyLevel;
    
    // Validate transition rules
    const isValidTransition = validatePrivacyTransition(currentPrivacyLevel, privacyLevel);
    
    if (!isValidTransition) {
      return NextResponse.json({ 
        error: 'Invalid privacy transition. Private communities cannot be made public or guarded again.' 
      }, { status: 400 });
    }

    // Update the community privacy level using the dedicated column
    const updatedCommunity = await prisma.community.update({
      where: { id: community.id },
      data: { 
        privacyLevel: privacyLevel as 'PUBLIC' | 'GUARDED' | 'PRIVATE',
        // Also update the legacy isPrivate field for backward compatibility
        isPrivate: isPrivate !== undefined ? isPrivate : privacyLevel !== 'PUBLIC'
      }
    });

    return NextResponse.json({ 
      message: 'Privacy settings updated successfully',
      privacyLevel: updatedCommunity.privacyLevel,
      isPrivate: updatedCommunity.isPrivate
    });

  } catch (error) {
    logError('Error updating community privacy:', error);
    return NextResponse.json(
      { error: 'Failed to update privacy settings' },
      { status: 500 }
    );
  }
}

function validatePrivacyTransition(current: string, desired: string): boolean {
  // If no change, always valid
  if (current === desired) return true;
  
  switch (current) {
    case 'PUBLIC':
      // Public can go to guarded or private
      return ['GUARDED', 'PRIVATE'].includes(desired);
    case 'GUARDED':
      // Guarded can only go to private
      return desired === 'PRIVATE';
    case 'PRIVATE':
      // Private cannot change to anything else
      return false;
    default:
      return false;
  }
}