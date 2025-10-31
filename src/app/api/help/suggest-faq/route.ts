/**
 * FAQ Suggestion API
 * 
 * POST /api/help/suggest-faq
 * 
 * Suggests relevant FAQ articles based on user query
 * NO automated AI chat - only FAQ links and "Contact Us" option
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { suggestFAQ, HelpContext } from '@/lib/ai/contextual-help';
import { logError } from '@/lib/error-logger';


export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { query, currentPage } = body;

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'query is required' },
        { status: 400 }
      );
    }

    // Get context if available
    const context: HelpContext | undefined = currentPage
      ? {
          userId: user.id,
          currentPage,
          userRole: user.role,
        }
      : undefined;

    const suggestions = await suggestFAQ(query, context);

    // If no good matches, suggest contact form
    const hasGoodMatch = suggestions.some((s) => s.relevanceScore > 0.6);

    return NextResponse.json({
      faqs: suggestions,
      showContactForm: !hasGoodMatch,
      message: hasGoodMatch
        ? 'Here are some articles that might help:'
        : 'We couldn\'t find a perfect match. Check these articles or contact support:',
    });
  } catch (error) {
    logError('FAQ suggestion error:', error);
    return NextResponse.json(
      { error: 'Failed to suggest FAQs' },
      { status: 500 }
    );
  }
}
