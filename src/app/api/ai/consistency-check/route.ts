import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { checkConsistency } from '@/lib/ai/writing-assistant';
import { logError } from '@/lib/error-logger';


/**
 * POST /api/ai/consistency-check
 * Checks for inconsistencies in terminology, tone, and arguments
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

    // Check for consistency issues
    const issues = await checkConsistency(content, title || 'Untitled');

    return NextResponse.json({
      issues,
      issueCount: issues.length
    });

  } catch (error) {
    logError('Consistency check error:', error);
    return NextResponse.json(
      { error: 'Failed to check consistency' },
      { status: 500 }
    );
  }
}
