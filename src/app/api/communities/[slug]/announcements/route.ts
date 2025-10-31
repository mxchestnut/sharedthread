import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logError } from '@/lib/error-logger';


interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  isImportant: boolean;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { slug } = await params;

    // Get the community and check access
    const community = await prisma.community.findFirst({
      where: {
        slug: slug,
        isApproved: true
      },
      include: {
        members: {
          where: {
            userId: user.id
          }
        }
      }
    });

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // Check if user has access (member of community or admin)
    const isMember = community.members.length > 0;
    const isAdmin = user.role === 'admin';
    
    if (community.isPrivate && !isMember && !isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get announcements from community settings
    const settings = (community.settings as Record<string, unknown>) || {};
    const announcements = (settings.announcements as Announcement[]) || [];

    // Sort by creation date (newest first) and importance
    const sortedAnnouncements = announcements.sort((a, b) => {
      // Important announcements first
      if (a.isImportant && !b.isImportant) return -1;
      if (!a.isImportant && b.isImportant) return 1;
      
      // Then by date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({ announcements: sortedAnnouncements });

  } catch (error) {
    logError('Error fetching announcements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { slug } = await params;
    const { title, content, isImportant } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Get the community and check admin access
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
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Create new announcement
    const newAnnouncement: Announcement = {
      id: `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      content,
      authorId: user.id,
      authorName: user.displayName,
      createdAt: new Date().toISOString(),
      isImportant: Boolean(isImportant)
    };

    // Get existing announcements and add the new one
    const settings = (community.settings as Record<string, unknown>) || {};
    const existingAnnouncements = (settings.announcements as Announcement[]) || [];
    const updatedAnnouncements = [newAnnouncement, ...existingAnnouncements];

    // Update community settings
    const newSettings = {
      ...settings,
      announcements: updatedAnnouncements
    };

    await prisma.community.update({
      where: { id: community.id },
      data: { settings: JSON.parse(JSON.stringify(newSettings)) }
    });

    return NextResponse.json({ 
      message: 'Announcement created successfully',
      announcement: newAnnouncement
    });

  } catch (error) {
    logError('Error creating announcement:', error);
    return NextResponse.json(
      { error: 'Failed to create announcement' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { slug } = await params;
    const url = new URL(request.url);
    const announcementId = url.searchParams.get('id');

    if (!announcementId) {
      return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 });
    }

    // Get the community and check admin access
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
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Remove announcement from settings
    const settings = (community.settings as Record<string, unknown>) || {};
    const existingAnnouncements = (settings.announcements as Announcement[]) || [];
    const filteredAnnouncements = existingAnnouncements.filter(ann => ann.id !== announcementId);

    const newSettings = {
      ...settings,
      announcements: filteredAnnouncements
    };

    await prisma.community.update({
      where: { id: community.id },
      data: { settings: JSON.parse(JSON.stringify(newSettings)) }
    });

    return NextResponse.json({ 
      message: 'Announcement deleted successfully'
    });

  } catch (error) {
    logError('Error deleting announcement:', error);
    return NextResponse.json(
      { error: 'Failed to delete announcement' },
      { status: 500 }
    );
  }
}