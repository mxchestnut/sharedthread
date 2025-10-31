'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, TrendingUp, Eye } from 'lucide-react';

interface Work {
  id: string;
  title: string;
  excerpt: string;
  tags: string[];
  viewCount: number;
  author: {
    username: string;
    displayName: string;
  };
  _count: {
    ratings: number;
  };
  avgRating?: number;
}

interface RecommendationReason {
  type: 'tag_match' | 'quality' | 'trending';
  value: string;
}

interface RecommendedWork extends Work {
  score: number;
  reasons: RecommendationReason[];
}

interface UserPreferences {
  topTags: string[];
  totalRatings: number;
}

interface DiscoveryResponse {
  works: RecommendedWork[];
  userPreferences: UserPreferences;
}

export default function DiscoveryFeedPage() {
  const [recommendations, setRecommendations] = useState<RecommendedWork[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setLoading(true);
        const res = await fetch(`/api/recommendations/works?limit=${limit}`);
        
        if (!res.ok) {
          throw new Error('Failed to load recommendations');
        }

        const data: DiscoveryResponse = await res.json();
        setRecommendations(data.works);
        setUserPreferences(data.userPreferences);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [limit]);

  const loadMore = () => {
    setLimit(prev => prev + 10);
  };

  if (loading && recommendations.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="w-6 h-6 text-accent" />
          <h1 className="text-2xl font-bold text-primary">Discover Works</h1>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg border border-border p-6 animate-pulse">
              <div className="h-6 bg-surface rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-surface rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-surface rounded w-full mb-2"></div>
              <div className="h-4 bg-surface rounded w-5/6"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-6 h-6 text-accent" />
          <h1 className="text-2xl font-bold text-primary">Discover Works</h1>
        </div>
        <p className="text-support">
          Personalized recommendations based on your reading history
        </p>
      </div>

      {/* User Preferences Summary */}
      {userPreferences && userPreferences.topTags.length > 0 && (
        <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 mb-6">
          <p className="text-sm text-support mb-2">
            Based on {userPreferences.totalRatings} work{userPreferences.totalRatings !== 1 ? 's' : ''} you&apos;ve rated
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-support">Your interests:</span>
            {userPreferences.topTags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length === 0 ? (
        <div className="bg-white rounded-lg border border-border p-12 text-center">
          <Sparkles className="w-12 h-12 text-support mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-primary mb-2">
            Start Building Your Discovery Feed
          </h2>
          <p className="text-support mb-6">
            Rate some works to get personalized recommendations!
          </p>
          <Link
            href="/library"
            className="inline-block px-6 py-3 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
          >
            Browse Library
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {recommendations.map(work => (
            <article
              key={work.id}
              className="bg-white rounded-lg border border-border p-6 hover:border-accent/50 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <Link
                    href={`/works/${work.id}`}
                    className="text-xl font-semibold text-primary hover:text-accent transition-colors"
                  >
                    {work.title}
                  </Link>
                  <p className="text-sm text-support mt-1">
                    by{' '}
                    <Link
                      href={`/profile/${work.author.username}`}
                      className="hover:text-accent transition-colors"
                    >
                      {work.author.displayName}
                    </Link>
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-accent">
                    {Math.round(work.score * 100)}% match
                  </div>
                </div>
              </div>

              {/* Excerpt */}
              <p className="text-secondary mb-4 line-clamp-3">
                {work.excerpt}
              </p>

              {/* Tags */}
              {work.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {work.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-surface text-secondary rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Why Recommended */}
              <div className="flex flex-wrap gap-3 text-sm">
                {work.reasons.map((reason, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-support">
                    {reason.type === 'tag_match' && (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Matches: {reason.value}</span>
                      </>
                    )}
                    {reason.type === 'quality' && (
                      <>
                        <TrendingUp className="w-4 h-4" />
                        <span>{reason.value}</span>
                      </>
                    )}
                    {reason.type === 'trending' && (
                      <>
                        <Eye className="w-4 h-4" />
                        <span>{reason.value} views</span>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="flex gap-4 mt-4 pt-4 border-t border-border text-sm text-support">
                <span>{work._count.ratings} rating{work._count.ratings !== 1 ? 's' : ''}</span>
                {work.avgRating && (
                  <span>★ {work.avgRating.toFixed(1)}</span>
                )}
                <span>{work.viewCount.toLocaleString()} views</span>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Load More */}
      {recommendations.length > 0 && recommendations.length >= limit && (
        <div className="mt-8 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-3 bg-white border border-border text-secondary rounded-md hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}
