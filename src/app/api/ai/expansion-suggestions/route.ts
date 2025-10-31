import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { suggestExpansions } from '@/lib/ai/writing-assistant';
import { logError } from '@/lib/error-logger';


/**
 * POST /api/ai/expansion-suggestions
 * Suggests angles for expanding brief sections
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

    const { content, title } = await request.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Get expansion suggestions
    const prompts = await suggestExpansions(content, title || 'Untitled');

    return NextResponse.json({
      expansionPrompts: prompts,
      count: prompts.length
    });

  } catch (error) {
    logError('Expansion suggestions error:', error);
    return NextResponse.json(
      { error: 'Failed to generate expansion suggestions' },
      { status: 500 }
    );
  }
}
