/**
 * Semantic Search Service
 * Provides intelligent search beyond keyword matching using AI
 */

import Anthropic from '@anthropic-ai/sdk';
import { logError } from '@/lib/error-logger';


const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

export interface SearchQuery {
  query: string;
  type?: 'works' | 'discussions' | 'users' | 'communities' | 'all';
  limit?: number;
}

export interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  relevanceScore: number;
  type: 'work' | 'discussion' | 'user' | 'community';
  url: string;
  highlights?: string[]; // Relevant passages
  metadata?: {
    author?: string;
    tags?: string[];
    publishedAt?: string;
  };
}

export interface SemanticSearchResponse {
  results: SearchResult[];
  expandedQuery?: string; // Suggested better search terms
  relatedQueries?: string[]; // Related search suggestions
  totalResults: number;
}

/**
 * Understand user's search intent and expand query
 */
async function analyzeSearchIntent(query: string): Promise<{
  intent: string;
  expandedTerms: string[];
  relatedQueries: string[];
}> {
  if (!anthropic) {
    // Fallback: simple keyword expansion
    return {
      intent: 'keyword_search',
      expandedTerms: [query],
      relatedQueries: []
    };
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `Analyze this search query and provide:
1. The user's search intent (what are they trying to find?)
2. Expanded search terms (synonyms, related concepts)
3. Related queries they might be interested in

Search query: "${query}"

Respond in JSON format:
{
  "intent": "description of what user wants",
  "expandedTerms": ["term1", "term2", ...],
  "relatedQueries": ["query1", "query2", ...]
}`
      }]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      // Extract JSON from response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return {
          intent: analysis.intent || 'general_search',
          expandedTerms: analysis.expandedTerms || [query],
          relatedQueries: analysis.relatedQueries || []
        };
      }
    }
  } catch (error) {
    logError('Error analyzing search intent:', error);
  }

  // Fallback
  return {
    intent: 'keyword_search',
    expandedTerms: [query],
    relatedQueries: []
  };
}

/**
 * Extract relevant excerpts from content
 */
function extractRelevantExcerpts(
  content: string,
  searchTerms: string[],
  maxExcerpts: number = 3
): string[] {
  const excerpts: string[] = [];
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);

  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase();
    const matchCount = searchTerms.filter(term => 
      lowerSentence.includes(term.toLowerCase())
    ).length;

    if (matchCount > 0) {
      excerpts.push(sentence.trim());
      if (excerpts.length >= maxExcerpts) break;
    }
  }

  return excerpts;
}

/**
 * Calculate semantic relevance score
 */
function calculateRelevanceScore(
  content: string,
  title: string,
  searchTerms: string[],
  tags: string[] = []
): number {
  let score = 0;
  const contentLower = content.toLowerCase();
  const titleLower = title.toLowerCase();

  // Title matches are most valuable
  for (const term of searchTerms) {
    const termLower = term.toLowerCase();
    if (titleLower.includes(termLower)) {
      score += 0.4;
    }
    // Content matches
    const contentMatches = (contentLower.match(new RegExp(termLower, 'g')) || []).length;
    score += Math.min(contentMatches * 0.1, 0.3);
  }

  // Tag matches
  for (const tag of tags) {
    if (searchTerms.some(term => tag.toLowerCase().includes(term.toLowerCase()))) {
      score += 0.2;
    }
  }

  return Math.min(score, 1.0);
}

/**
 * Perform semantic search
 */
export async function performSemanticSearch(
  params: SearchQuery,
  searchableContent: Array<{
    id: string;
    title: string;
    content: string;
    type: 'work' | 'discussion' | 'user' | 'community';
    tags?: string[];
    author?: string;
    publishedAt?: Date;
  }>
): Promise<SemanticSearchResponse> {
  // Analyze query intent
  const analysis = await analyzeSearchIntent(params.query);

  // Search with expanded terms
  const allSearchTerms = [params.query, ...analysis.expandedTerms];

  // Score and rank results
  const scoredResults = searchableContent.map(item => {
    const score = calculateRelevanceScore(
      item.content,
      item.title,
      allSearchTerms,
      item.tags
    );

    const highlights = extractRelevantExcerpts(
      item.content,
      allSearchTerms,
      2
    );

    return {
      id: item.id,
      title: item.title,
      excerpt: highlights[0] || item.content.substring(0, 200) + '...',
      relevanceScore: score,
      type: item.type,
      url: getUrlForType(item.type, item.id),
      highlights,
      metadata: {
        author: item.author,
        tags: item.tags,
        publishedAt: item.publishedAt?.toISOString()
      }
    };
  });

  // Filter by relevance threshold and sort
  const filteredResults = scoredResults
    .filter(r => r.relevanceScore > 0.1)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, params.limit || 20);

  return {
    results: filteredResults,
    expandedQuery: analysis.expandedTerms.join(', '),
    relatedQueries: analysis.relatedQueries,
    totalResults: filteredResults.length
  };
}

function getUrlForType(type: string, id: string): string {
  switch (type) {
    case 'work':
      return `/works/${id}`;
    case 'discussion':
      return `/discussions/${id}`;
    case 'user':
      return `/users/${id}`;
    case 'community':
      return `/communities/${id}`;
    default:
      return `/${type}/${id}`;
  }
}

/**
 * Query expansion - suggest better search terms
 */
export async function suggestQueryExpansion(query: string): Promise<string[]> {
  const analysis = await analyzeSearchIntent(query);
  return analysis.expandedTerms;
}

/**
 * Related search suggestions
 */
export async function getRelatedSearches(query: string): Promise<string[]> {
  const analysis = await analyzeSearchIntent(query);
  return analysis.relatedQueries;
}
