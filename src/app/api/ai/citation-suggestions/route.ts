import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { suggestCitations } from '@/lib/ai/writing-assistant';
import { logError } from '@/lib/error-logger';


/**
 * POST /api/ai/citation-suggestions
 * Recommends relevant sources/works to cite
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { content, workId } = await request.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Get relevant existing works from Shared Thread library
    const existingWorks = await prisma.work.findMany({
      where: {
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        NOT: workId ? { id: workId } : undefined
      },
      select: {
        id: true,
        title: true,
        excerpt: true,
        tags: true
      },
      take: 50 // Limit for performance
    });

    // Get citation suggestions
    const suggestions = await suggestCitations(
      content,
      existingWorks.map(w => ({
        id: w.id,
        title: w.title,
        excerpt: w.excerpt || '',
        tags: w.tags
      }))
    );

    return NextResponse.json({
      suggestions,
      count: suggestions.length,
      note: 'Verify all citations before using them in your work.'
    });

  } catch (error) {
    logError('Citation suggestions error:', error);
    return NextResponse.json(
      { error: 'Failed to generate citation suggestions' },
      { status: 500 }
    );
  }
}
