'use client';

import { useState, useEffect } from 'react';
import { Hash } from 'lucide-react';
import { logError } from '@/lib/error-logger';


interface PopularHashtag {
  tag: string;
  count: number;
}

export function PopularHashtagsSidebar() {
  const [hashtags, setHashtags] = useState<PopularHashtag[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPopularHashtags = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/hashtags/popular?limit=5');
      
      if (response.ok) {
        const data = await response.json();
        setHashtags(data.hashtags || []);
      }
    } catch (error) {
      logError('Failed to fetch popular hashtags:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPopularHashtags();
  }, []);

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Hash size={16} className="text-accent" />
          <h4 className="font-semibold">Popular Hashtags</h4>
        </div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (hashtags.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Hash size={16} className="text-accent" />
          <h4 className="font-semibold">Popular Hashtags</h4>
        </div>
        <p className="text-sm text-support">No hashtags available yet.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-3">
        <Hash size={16} className="text-accent" />
        <h4 className="font-semibold">Popular Hashtags</h4>
      </div>
      <p className="text-xs text-support mb-3">Trending across all public works</p>
      <div className="space-y-2">
        {hashtags.map((hashtag) => (
          <div key={hashtag.tag} className="flex items-center justify-between">
            <span className="text-sm font-medium text-ink">
              #{hashtag.tag}
            </span>
            <span className="text-xs text-support">
              {hashtag.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}