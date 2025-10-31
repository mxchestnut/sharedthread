import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { suggestQueryExpansion, getRelatedSearches } from '@/lib/ai/semantic-search';
import { logError } from '@/lib/error-logger';


/**
 * GET /api/ai/search-suggestions?query=...
 * Provides search query improvements and related searches
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Get expanded query suggestions and related searches
    const [expandedTerms, relatedQueries] = await Promise.all([
      suggestQueryExpansion(query),
      getRelatedSearches(query)
    ]);

    return NextResponse.json({
      originalQuery: query,
      expandedTerms: expandedTerms.filter(term => term.toLowerCase() !== query.toLowerCase()),
      relatedQueries: relatedQueries,
      suggestions: {
        didYouMean: expandedTerms[0] !== query ? expandedTerms[0] : null,
        alsoTry: relatedQueries.slice(0, 3)
      }
    });

  } catch (error) {
    logError('Search suggestions error:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}
