'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Activity, Users, FileText, MessageSquare, User, Heart, MessageCircle, Eye } from 'lucide-react';
import { logError } from '@/lib/error-logger';


interface FeedItem {
  id: string;
  type: 'work' | 'discussion' | 'community_join' | 'follow';
  createdAt: string;
  
  // Work-specific fields
  work?: {
    id: string;
    title: string;
    excerpt: string;
    author: {
      id: string;
      username: string;
      displayName: string;
    };
    community?: {
      name: string;
      slug: string;
    };
    tags: string[];
    viewCount: number;
    _count: {
      comments: number;
      ratings: number;
    };
  };
  
  // Discussion-specific fields  
  discussion?: {
    id: string;
    title: string;
    content: string;
    author: {
      id: string;
      username: string;
      displayName: string;
    };
    community: {
      name: string;
      slug: string;
    };
    category: {
      name: string;
      color: string;
    };
    replyCount: number;
    upvotes: number;
  };
  
  // Activity-specific fields
  user?: {
    id: string;
    username: string;
    displayName: string;
  };
  targetUser?: {
    id: string;
    username: string;
    displayName: string;
  };
  community?: {
    name: string;
    slug: string;
  };
}

export default function FeedPage() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'works' | 'discussions' | 'activity'>('all');

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/feed?filter=${filter}`);
      
      if (response.ok) {
        const data = await response.json();
        setFeedItems(data.items || []);
      } else {
        logError('Error', 'Failed to fetch feed');
      }
    } catch (error) {
      logError('Error fetching feed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (hours < 24) {
      return hours === 0 ? 'Just now' : `${hours}h ago`;
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderFeedItem = (item: FeedItem) => {
    switch (item.type) {
      case 'work':
        return (
          <div key={item.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText size={16} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-support mb-2">
                  <User size={14} />
                  <span><strong>{item.work?.author.displayName}</strong> published a work</span>
                  {item.work?.community && (
                    <>
                      <span>in</span>
                      <Link 
                        href={`/communities/${item.work.community.slug}`}
                        className="text-accent hover:underline font-medium"
                      >
                        {item.work.community.name}
                      </Link>
                    </>
                  )}
                  <span>•</span>
                  <span>{formatDate(item.createdAt)}</span>
                </div>
                
                <Link 
                  href={`/works/${item.work?.id}`}
                  className="block"
                >
                  <h3 className="text-lg font-medium text-ink mb-2 hover:text-accent transition-colors">
                    {item.work?.title}
                  </h3>
                  {item.work?.excerpt && (
                    <p className="text-support mb-3 line-clamp-2">
                      {item.work.excerpt}
                    </p>
                  )}
                </Link>
                
                <div className="flex items-center gap-4 text-sm text-support">
                  <span className="flex items-center gap-1">
                    <Eye size={14} />
                    {item.work?.viewCount} views
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle size={14} />
                    {item.work?._count.comments} comments
                  </span>
                  {item.work?._count?.ratings && item.work._count.ratings > 0 && (
                    <span className="flex items-center gap-1">
                      <Heart size={14} />
                      {item.work._count.ratings} ratings
                    </span>
                  )}
                  {item.work?.tags && item.work.tags.length > 0 && (
                    <div className="flex gap-1">
                      {item.work.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-accent/10 text-accent rounded text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'discussion':
        return (
          <div key={item.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <MessageSquare size={16} className="text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-support mb-2">
                  <User size={14} />
                  <span><strong>{item.discussion?.author.displayName}</strong> started a discussion</span>
                  <span>in</span>
                  <Link 
                    href={`/communities/${item.discussion?.community.slug}`}
                    className="text-accent hover:underline font-medium"
                  >
                    {item.discussion?.community.name}
                  </Link>
                  <span>•</span>
                  <span>{formatDate(item.createdAt)}</span>
                </div>
                
                <Link 
                  href={`/communities/${item.discussion?.community.slug}/discussions/${item.discussion?.id}`}
                  className="block"
                >
                  <h3 className="text-lg font-medium text-ink mb-2 hover:text-accent transition-colors">
                    {item.discussion?.title}
                  </h3>
                  <p className="text-support mb-3 line-clamp-2">
                    {item.discussion?.content}
                  </p>
                </Link>
                
                <div className="flex items-center gap-4 text-sm text-support">
                  <span 
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{ 
                      backgroundColor: `${item.discussion?.category.color}20`, 
                      color: item.discussion?.category.color 
                    }}
                  >
                    {item.discussion?.category.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle size={14} />
                    {item.discussion?.replyCount} replies
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart size={14} />
                    {item.discussion?.upvotes} upvotes
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'community_join':
        return (
          <div key={item.id} className="card">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Users size={16} className="text-purple-600" />
              </div>
              <div className="text-sm text-support">
                <strong>{item.user?.displayName}</strong> joined{' '}
                <Link 
                  href={`/communities/${item.community?.slug}`}
                  className="text-accent hover:underline font-medium"
                >
                  {item.community?.name}
                </Link>
                <span className="ml-2">•</span>
                <span className="ml-2">{formatDate(item.createdAt)}</span>
              </div>
            </div>
          </div>
        );

      case 'follow':
        return (
          <div key={item.id} className="card">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                <Heart size={16} className="text-pink-600" />
              </div>
              <div className="text-sm text-support">
                <strong>{item.user?.displayName}</strong> started following{' '}
                <Link 
                  href={`/users/${item.targetUser?.username}`}
                  className="text-accent hover:underline font-medium"
                >
                  {item.targetUser?.displayName}
                </Link>
                <span className="ml-2">•</span>
                <span className="ml-2">{formatDate(item.createdAt)}</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity size={28} className="text-accent" />
          <div>
            <h1 className="text-2xl font-bold text-ink">Your Feed</h1>
            <p className="text-support">Latest from your followed users and communities</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 border-b border-border">
        {[
          { key: 'all', label: 'All Activity' },
          { key: 'works', label: 'Works' },
          { key: 'discussions', label: 'Discussions' }, 
          { key: 'activity', label: 'Social' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as typeof filter)}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              filter === key
                ? 'border-accent text-accent'
                : 'border-transparent text-support hover:text-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Feed Content */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card">
              <div className="animate-pulse">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : feedItems.length > 0 ? (
        <div className="space-y-4">
          {feedItems.map(renderFeedItem)}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Activity size={48} className="mx-auto mb-4 text-accent/50" />
          <h3 className="text-lg font-medium text-ink mb-2">Your feed is empty</h3>
          <p className="text-support mb-6">
            Follow some writers and join communities to see their latest content here!
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/users"
              className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
            >
              Discover Writers
            </Link>
            <Link 
              href="/communities"
              className="px-4 py-2 border border-accent text-accent rounded-md hover:bg-accent/5 transition-colors"
            >
              Browse Communities
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}