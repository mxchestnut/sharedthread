'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Tag } from 'lucide-react';

interface Work {
  id: string;
  title: string;
  excerpt: string;
  tags: string[];
  author: {
    username: string;
    displayName: string;
  };
  _count: {
    ratings: number;
  };
  avgRating?: number;
}

interface SimilarWork extends Work {
  score: number;
  sharedTags: string[];
}

interface SimilarWorksProps {
  workId: string;
  limit?: number;
}

export function SimilarWorksWidget({ workId, limit = 5 }: SimilarWorksProps) {
  const [similarWorks, setSimilarWorks] = useState<SimilarWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSimilarWorks() {
      try {
        setLoading(true);
        const res = await fetch('/api/ai/similar-works', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workId, limit }),
        });

        if (!res.ok) {
          throw new Error('Failed to load similar works');
        }

        const data = await res.json();
        setSimilarWorks(data.similarWorks || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    if (workId) {
      fetchSimilarWorks();
    }
  }, [workId, limit]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-support" />
          <h2 className="text-lg font-semibold text-primary">Similar Works</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-5 bg-surface rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-surface rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || similarWorks.length === 0) {
    return null; // Don't show the widget if there's an error or no similar works
  }

  return (
    <div className="bg-white rounded-lg border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-support" />
        <h2 className="text-lg font-semibold text-primary">Readers Also Enjoyed</h2>
      </div>

      <div className="space-y-4">
        {similarWorks.map(work => (
          <article key={work.id} className="group">
            <Link
              href={`/works/${work.id}`}
              className="block hover:bg-surface/50 -mx-2 px-2 py-2 rounded transition-colors"
            >
              <h3 className="font-medium text-primary group-hover:text-accent transition-colors mb-1">
                {work.title}
              </h3>
              
              <p className="text-sm text-support mb-2">
                by {work.author.displayName}
              </p>

              {/* Shared Tags */}
              {work.sharedTags.length > 0 && (
                <div className="flex items-center gap-1.5 mb-2">
                  <Tag className="w-3.5 h-3.5 text-accent" />
                  <div className="flex flex-wrap gap-1">
                    {work.sharedTags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-accent/10 text-accent rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                    {work.sharedTags.length > 3 && (
                      <span className="text-xs text-support">
                        +{work.sharedTags.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="flex gap-3 text-xs text-support">
                <span>
                  {work._count.ratings} rating{work._count.ratings !== 1 ? 's' : ''}
                </span>
                {work.avgRating && (
                  <span>★ {work.avgRating.toFixed(1)}</span>
                )}
                <span className="text-accent font-medium">
                  {Math.round(work.score * 100)}% similar
                </span>
              </div>
            </Link>
          </article>
        ))}
      </div>

      <Link
        href="/feed/discovery"
        className="block mt-4 pt-4 border-t border-border text-sm text-accent hover:text-accent/80 text-center transition-colors"
      >
        Explore more recommendations →
      </Link>
    </div>
  );
}
