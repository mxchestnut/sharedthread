'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  Sparkles, 
  FileText, 
  MessageSquare, 
  Users, 
  Folder,
  TrendingUp,
  Filter,
  X,
  Loader2
} from 'lucide-react';
import { logError } from '@/lib/error-logger';

interface SearchResult {
  id: string;
  type: 'work' | 'discussion' | 'user' | 'community';
  title: string;
  excerpt: string;
  relevanceScore: number;
  metadata?: {
    author?: string;
    tags?: string[];
    publishedAt?: string;
    memberCount?: number;
  };
}

interface SearchResponse {
  results: SearchResult[];
  intent: {
    category: 'work' | 'discussion' | 'user' | 'community' | 'general';
    confidence: number;
    interpretation: string;
  };
  totalCount: number;
}

interface QuerySuggestion {
  suggestion: string;
  reason: string;
  confidence: number;
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [intent, setIntent] = useState<SearchResponse['intent'] | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [suggestions, setSuggestions] = useState<QuerySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'work' | 'discussion' | 'user' | 'community'>('all');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined);

  // Perform search
  const performSearch = useCallback(async (searchQuery: string, filter: string = 'all') => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIntent(null);
      setTotalCount(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/ai/semantic-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: searchQuery,
          type: filter === 'all' ? undefined : filter
        }),
      });

      if (!res.ok) throw new Error('Search failed');
      
      const data: SearchResponse = await res.json();
      setResults(data.results);
      setIntent(data.intent);
      setTotalCount(data.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch query suggestions
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(`/api/ai/search-suggestions?query=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) return;
      
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      logError('Failed to fetch suggestions:', err);
      setSuggestions([]);
    }
  }, []);

  // Handle query change with debouncing
  const handleQueryChange = (value: string) => {
    setQuery(value);
    setShowSuggestions(true);

    // Debounce suggestions (300ms)
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  // Handle search submission
  const handleSearch = (searchQuery: string = query) => {
    setShowSuggestions(false);
    performSearch(searchQuery, activeFilter);
    
    // Update URL
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (activeFilter !== 'all') params.set('filter', activeFilter);
    router.push(`/search?${params.toString()}`, { scroll: false });
  };

  // Handle filter change
  const handleFilterChange = (filter: typeof activeFilter) => {
    setActiveFilter(filter);
    if (query) {
      performSearch(query, filter);
    }
  };

  // Initial search on page load
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery, activeFilter);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Get icon for result type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'work':
        return <FileText className="w-5 h-5" />;
      case 'discussion':
        return <MessageSquare className="w-5 h-5" />;
      case 'user':
        return <Users className="w-5 h-5" />;
      case 'community':
        return <Folder className="w-5 h-5" />;
      default:
        return <Search className="w-5 h-5" />;
    }
  };

  // Get link for result
  const getResultLink = (result: SearchResult) => {
    switch (result.type) {
      case 'work':
        return `/works/${result.id}`;
      case 'discussion':
        return `/discussions/${result.id}`;
      case 'user':
        return `/users/${result.id}`;
      case 'community':
        return `/communities/${result.id}`;
      default:
        return '#';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-serif text-primary mb-6">Search Shared Thread</h1>
          
          {/* Search Bar */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-support" />
              <input
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search works, discussions, people, communities..."
                className="w-full pl-12 pr-24 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-primary"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery('');
                    setResults([]);
                    setIntent(null);
                    setSuggestions([]);
                  }}
                  className="absolute right-16 top-1/2 -translate-y-1/2 p-1 text-support hover:text-primary"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => handleSearch()}
                disabled={!query.trim() || loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Search
              </button>
            </div>

            {/* Query Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuery(suggestion.suggestion);
                      handleSearch(suggestion.suggestion);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-accent/5 border-b border-border last:border-0 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-primary font-medium">{suggestion.suggestion}</p>
                        <p className="text-sm text-support">{suggestion.reason}</p>
                      </div>
                      <span className="text-xs text-accent">
                        {Math.round(suggestion.confidence * 100)}%
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mt-4">
            <Filter className="w-4 h-4 text-support" />
            <span className="text-sm text-support">Filter by:</span>
            {(['all', 'work', 'discussion', 'user', 'community'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => handleFilterChange(filter)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  activeFilter === filter
                    ? 'bg-accent text-white'
                    : 'bg-surface text-support hover:bg-accent/10 hover:text-accent'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                {filter === 'all' && 's'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Intent Display */}
        {intent && (
          <div className="mb-6 p-4 bg-accent/5 border border-accent/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-primary">
                  <span className="font-medium">AI interpretation:</span> {intent.interpretation}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                    {intent.category}
                  </span>
                  <span className="text-xs text-support">
                    {Math.round(intent.confidence * 100)}% confidence
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-accent mx-auto mb-3 animate-spin" />
            <p className="text-support">Searching...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-900">{error}</p>
          </div>
        )}

        {/* Results Count */}
        {!loading && results.length > 0 && (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-support">
              Found <span className="font-medium text-primary">{totalCount}</span> result{totalCount !== 1 ? 's' : ''}
            </p>
            {results.length < totalCount && (
              <p className="text-xs text-support">
                Showing top {results.length}
              </p>
            )}
          </div>
        )}

        {/* Results List */}
        {!loading && results.length > 0 && (
          <div className="space-y-4">
            {results.map((result) => (
              <Link
                key={result.id}
                href={getResultLink(result)}
                className="block bg-white border border-border rounded-lg p-5 hover:border-accent transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="text-accent mt-1">
                    {getTypeIcon(result.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-lg font-medium text-primary hover:text-accent line-clamp-2">
                        {result.title}
                      </h3>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <TrendingUp className="w-3 h-3 text-accent" />
                        <span className="text-xs text-accent font-medium">
                          {Math.round(result.relevanceScore * 100)}%
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-support line-clamp-2 mb-3">
                      {result.excerpt}
                    </p>

                    {/* Metadata */}
                    <div className="flex items-center gap-3 text-xs text-support">
                      <span className="px-2 py-0.5 rounded-full bg-surface">
                        {result.type}
                      </span>
                      {result.metadata?.author && (
                        <span>by {result.metadata.author}</span>
                      )}
                      {result.metadata?.tags && result.metadata.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          {result.metadata.tags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {result.metadata?.publishedAt && (
                        <span>{new Date(result.metadata.publishedAt).toLocaleDateString()}</span>
                      )}
                      {result.metadata?.memberCount && (
                        <span>{result.metadata.memberCount} members</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && query && results.length === 0 && !error && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-support mx-auto mb-3" />
            <p className="text-primary font-medium mb-1">No results found</p>
            <p className="text-support text-sm">
              Try different keywords or check your spelling
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !query && (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 text-accent mx-auto mb-3" />
            <p className="text-primary font-medium mb-1">AI-Powered Semantic Search</p>
            <p className="text-support text-sm">
              Search understands context and intent, not just keywords
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
