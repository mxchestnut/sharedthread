'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Folder, TrendingUp, BookOpen, Loader2 } from 'lucide-react';

interface RelatedCollection {
  id: string;
  name: string;
  description: string | null;
  itemCount: number;
  sharedTags: string[];
  similarityScore: number;
  creator: {
    id: string;
    username: string;
    displayName: string;
  };
}

interface RelatedCollectionsResponse {
  relatedCollections: RelatedCollection[];
  context: {
    tags: string[];
  };
}

interface RelatedCollectionsWidgetProps {
  workId?: string;
  userId?: string;
  limit?: number;
}

export function RelatedCollectionsWidget({ 
  workId, 
  userId, 
  limit = 5 
}: RelatedCollectionsWidgetProps) {
  const [collections, setCollections] = useState<RelatedCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRelatedCollections();
  }, [workId, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchRelatedCollections = async () => {
    if (!workId && !userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/ai/related-collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workId, userId, limit }),
      });

      if (!res.ok) throw new Error('Failed to fetch collections');
      
      const data: RelatedCollectionsResponse = await res.json();
      setCollections(data.relatedCollections);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load collections');
      setCollections([]);
    } finally {
      setLoading(false);
    }
  };

  // Don't render if no context provided
  if (!workId && !userId) {
    return null;
  }

  // Don't render if loading
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Folder className="w-5 h-5 text-accent" />
          <h3 className="font-serif text-lg text-primary">Related Collections</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-accent animate-spin" />
        </div>
      </div>
    );
  }

  // Don't render if error or no collections
  if (error || collections.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Folder className="w-5 h-5 text-accent" />
        <h3 className="font-serif text-lg text-primary">Related Collections</h3>
      </div>

      <div className="space-y-4">
        {collections.map((collection) => (
          <Link
            key={collection.id}
            href={`/collections/${collection.id}`}
            className="block group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-primary group-hover:text-accent transition-colors line-clamp-1 mb-1">
                  {collection.name}
                </h4>
                
                {collection.description && (
                  <p className="text-sm text-support line-clamp-2 mb-2">
                    {collection.description}
                  </p>
                )}

                <div className="flex items-center gap-2 text-xs text-support">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {collection.itemCount} {collection.itemCount === 1 ? 'item' : 'items'}
                  </span>
                  <span>•</span>
                  <span>by {collection.creator.displayName}</span>
                </div>

                {/* Shared Tags */}
                {collection.sharedTags.length > 0 && (
                  <div className="flex items-center gap-1 mt-2 flex-wrap">
                    {collection.sharedTags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent"
                      >
                        {tag}
                      </span>
                    ))}
                    {collection.sharedTags.length > 3 && (
                      <span className="text-xs text-support">
                        +{collection.sharedTags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Similarity Score */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <TrendingUp className="w-3 h-3 text-accent" />
                <span className="text-xs text-accent font-medium">
                  {Math.round(collection.similarityScore * 100)}%
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* View All Link */}
      {collections.length === limit && (
        <div className="mt-4 pt-4 border-t border-border">
          <Link
            href="/collections"
            className="text-sm text-accent hover:text-accent/80 transition-colors"
          >
            View all collections →
          </Link>
        </div>
      )}
    </div>
  );
}
