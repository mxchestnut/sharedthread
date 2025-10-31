'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, TrendingUp, Lock, Globe, Loader2 } from 'lucide-react';

interface SimilarCommunity {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  memberCount: number;
  privacy: 'PUBLIC' | 'PRIVATE';
  sharedTags: string[];
  similarityScore: number;
}

interface SimilarCommunitiesResponse {
  similarCommunities: SimilarCommunity[];
  context: {
    tags: string[];
  };
}

interface SimilarCommunitiesWidgetProps {
  communityId?: string;
  userId?: string;
  limit?: number;
}

export function SimilarCommunitiesWidget({ 
  communityId, 
  userId, 
  limit = 5 
}: SimilarCommunitiesWidgetProps) {
  const [communities, setCommunities] = useState<SimilarCommunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSimilarCommunities();
  }, [communityId, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSimilarCommunities = async () => {
    if (!communityId && !userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/ai/similar-communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ communityId, userId, limit }),
      });

      if (!res.ok) throw new Error('Failed to fetch communities');
      
      const data: SimilarCommunitiesResponse = await res.json();
      setCommunities(data.similarCommunities);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load communities');
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  };

  // Don't render if no context provided
  if (!communityId && !userId) {
    return null;
  }

  // Don't render if loading
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-accent" />
          <h3 className="font-serif text-lg text-primary">Similar Communities</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-accent animate-spin" />
        </div>
      </div>
    );
  }

  // Don't render if error or no communities
  if (error || communities.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-accent" />
        <h3 className="font-serif text-lg text-primary">Similar Communities</h3>
      </div>

      <div className="space-y-4">
        {communities.map((community) => (
          <Link
            key={community.id}
            href={`/communities/${community.slug}`}
            className="block group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-primary group-hover:text-accent transition-colors line-clamp-1">
                    {community.name}
                  </h4>
                  {community.privacy === 'PRIVATE' ? (
                    <Lock className="w-3 h-3 text-support flex-shrink-0" />
                  ) : (
                    <Globe className="w-3 h-3 text-support flex-shrink-0" />
                  )}
                </div>
                
                {community.description && (
                  <p className="text-sm text-support line-clamp-2 mb-2">
                    {community.description}
                  </p>
                )}

                <div className="flex items-center gap-2 text-xs text-support">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {community.memberCount} {community.memberCount === 1 ? 'member' : 'members'}
                  </span>
                  <span>•</span>
                  <span className="px-2 py-0.5 rounded-full bg-surface">
                    {community.privacy === 'PRIVATE' ? 'Private' : 'Public'}
                  </span>
                </div>

                {/* Shared Tags */}
                {community.sharedTags.length > 0 && (
                  <div className="flex items-center gap-1 mt-2 flex-wrap">
                    {community.sharedTags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent"
                      >
                        {tag}
                      </span>
                    ))}
                    {community.sharedTags.length > 3 && (
                      <span className="text-xs text-support">
                        +{community.sharedTags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Similarity Score */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <TrendingUp className="w-3 h-3 text-accent" />
                <span className="text-xs text-accent font-medium">
                  {Math.round(community.similarityScore * 100)}%
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* View All Link */}
      {communities.length === limit && (
        <div className="mt-4 pt-4 border-t border-border">
          <Link
            href="/communities"
            className="text-sm text-accent hover:text-accent/80 transition-colors"
          >
            Explore all communities →
          </Link>
        </div>
      )}
    </div>
  );
}
