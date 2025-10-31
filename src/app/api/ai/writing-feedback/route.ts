import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { analyzeWriting } from '@/lib/ai/writing-assistant';
import { logError } from '@/lib/error-logger';


/**
 * POST /api/ai/writing-feedback
 * Analyzes draft writing for clarity, structure, and coherence
 * Returns AI comments/suggestions - NO automatic edits
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

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Analyze the writing
    const feedback = await analyzeWriting(content, title);

    return NextResponse.json({
      feedback,
      note: 'These are AI-generated suggestions. You decide what to implement.'
    });

  } catch (error) {
    logError('Writing feedback error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze writing' },
      { status: 500 }
    );
  }
}
