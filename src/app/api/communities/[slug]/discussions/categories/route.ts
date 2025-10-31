import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logError } from '@/lib/error-logger';


export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { slug } = params;

    // First, get the community and check access
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

    // For now, return default categories since we don't have the database tables yet
    // TODO: Replace with actual database query once migration is complete
    const categories = [
      {
        id: '1',
        name: 'General',
        description: 'General discussions about the community',
        slug: 'general',
        color: '#6366f1',
        icon: 'MessageSquare',
        position: 0,
        postCount: 0
      },
      {
        id: '2', 
        name: 'Questions',
        description: 'Ask questions and get help from the community',
        slug: 'questions',
        color: '#f59e0b',
        icon: 'HelpCircle',
        position: 1,
        postCount: 0
      },
      {
        id: '3',
        name: 'Off topic',
        description: 'Discussions that don\'t fit into other categories',
        slug: 'off-topic', 
        color: '#10b981',
        icon: 'MessageSquare',
        position: 2,
        postCount: 0
      }
    ];

    return NextResponse.json({ categories });

  } catch (error) {
    logError('Error fetching discussion categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { slug } = params;
    const body = await request.json();
    const { name, description, color, icon } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Get the community and check permissions
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

    // Check if user can manage categories (community owner/moderator or admin)
    const userMembership = community.members[0];
    const canManageCategories = 
      user.role === 'admin' ||
      community.ownerId === user.id ||
      (userMembership && ['MODERATOR', 'ADMIN'].includes(userMembership.role));
    
    if (!canManageCategories) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // For now, return a mock response since we don't have database tables
    // TODO: Replace with actual database creation once migration is complete
    const categorySlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const newCategory = {
      id: Date.now().toString(),
      name,
      description: description || '',
      slug: categorySlug,
      color: color || '#6366f1',
      icon: icon || 'MessageSquare',
      position: 999,
      communityId: community.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(newCategory, { status: 201 });

  } catch (error) {
    logError('Error creating discussion category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}