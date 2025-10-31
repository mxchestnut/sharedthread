/**
 * Onboarding Path API
 * 
 * GET /api/onboarding/path?goal=writer
 * 
 * Generates personalized onboarding tutorial based on user goals
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { generateOnboardingPath } from '@/lib/ai/contextual-help';
import { logError } from '@/lib/error-logger';


export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const goal = searchParams.get('goal') as 'reader' | 'writer' | 'community-leader' | 'explorer';

    if (!goal || !['reader', 'writer', 'community-leader', 'explorer'].includes(goal)) {
      return NextResponse.json(
        { error: 'Invalid goal. Must be: reader, writer, community-leader, or explorer' },
        { status: 400 }
      );
    }

    const path = await generateOnboardingPath(user.id, goal);

    // Calculate progress
    const completedSteps = path.steps.filter((s) => s.completed).length;
    const progress = (completedSteps / path.steps.length) * 100;

    return NextResponse.json({
      path,
      progress: Math.round(progress),
      completedSteps,
      totalSteps: path.steps.length,
    });
  } catch (error) {
    logError('Onboarding path error:', error);
    return NextResponse.json(
      { error: 'Failed to generate onboarding path' },
      { status: 500 }
    );
  }
}
