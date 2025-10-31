/**
 * Contextual Help API
 * 
 * POST /api/ai/contextual-help
 * 
 * Provides AI-powered help suggestions based on user context
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getContextualHelp, HelpContext } from '@/lib/ai/contextual-help';
import { logError } from '@/lib/error-logger';


export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      currentPage,
      action,
      timeOnPage,
      previousPages,
    } = body;

    if (!currentPage) {
      return NextResponse.json(
        { error: 'currentPage is required' },
        { status: 400 }
      );
    }

    // Get user's createdAt date
    const userRecord = await prisma.users.findUnique({
      where: { id: user.id },
      select: { createdAt: true },
    });

    // Calculate account age
    const accountAge = userRecord
      ? Math.floor((Date.now() - userRecord.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      : 999; // Old account if we can't determine

    const context: HelpContext = {
      userId: user.id,
      currentPage,
      action,
      timeOnPage,
      previousPages,
      userRole: user.role,
      accountAge,
    };

    const suggestions = await getContextualHelp(context);

    return NextResponse.json({
      suggestions,
      context: {
        accountAge,
        isNewUser: accountAge < 7,
      },
    });
  } catch (error) {
    logError('Contextual help error:', error);
    return NextResponse.json(
      { error: 'Failed to get contextual help' },
      { status: 500 }
    );
  }
}
