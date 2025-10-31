'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, TrendingUp, Hash, Star, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Hashtag {
  name: string;
  postCount: number;
  subscriberCount: number;
  trending: boolean;
  description?: string;
}

export default function HashtagsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'trending' | 'alphabetical'>('popular');
  
  const [hashtags] = useState<Hashtag[]>([
    {
      name: 'creative-writing',
      postCount: 156,
      subscriberCount: 342,
      trending: true,
      description: 'Discussions about the craft of creative writing, storytelling techniques, and narrative development.',
    },
    {
      name: 'writing-tips',
      postCount: 234,
      subscriberCount: 489,
      trending: true,
      description: 'Practical advice and tips for improving your writing skills.',
    },
    {
      name: 'storytelling',
      postCount: 89,
      subscriberCount: 256,
      trending: false,
      description: 'The art and science of telling compelling stories across all mediums.',
    },
    {
      name: 'annotations',
      postCount: 67,
      subscriberCount: 198,
      trending: true,
      description: 'How to use the annotation system effectively for beta feedback.',
    },
    {
      name: 'editing',
      postCount: 145,
      subscriberCount: 312,
      trending: false,
      description: 'Editing techniques, self-editing tips, and revision strategies.',
    },
    {
      name: 'beta-feedback',
      postCount: 98,
      subscriberCount: 234,
      trending: false,
      description: 'Discussion about giving and receiving beta reader feedback.',
    },
    {
      name: 'essays',
      postCount: 123,
      subscriberCount: 278,
      trending: false,
      description: 'Long-form essays on writing, creativity, and the creative process.',
    },
    {
      name: 'collaboration',
      postCount: 56,
      subscriberCount: 167,
      trending: false,
      description: 'Collaborative writing projects and techniques.',
    },
    {
      name: 'structure',
      postCount: 78,
      subscriberCount: 189,
      trending: false,
      description: 'Story structure, plot architecture, and organizing your work.',
    },
    {
      name: 'character-development',
      postCount: 91,
      subscriberCount: 245,
      trending: false,
      description: 'Creating compelling characters and character arcs.',
    },
    {
      name: 'world-building',
      postCount: 102,
      subscriberCount: 289,
      trending: true,
      description: 'Building immersive fictional worlds for your stories.',
    },
    {
      name: 'poetry',
      postCount: 67,
      subscriberCount: 134,
      trending: false,
      description: 'Poetry writing, analysis, and appreciation.',
    },
    {
      name: 'publishing',
      postCount: 43,
      subscriberCount: 156,
      trending: false,
      description: 'Traditional and self-publishing discussions.',
    },
    {
      name: 'flash-fiction',
      postCount: 89,
      subscriberCount: 201,
      trending: false,
      description: 'Micro-fiction and flash fiction pieces under 1000 words.',
    },
    {
      name: 'dialogue',
      postCount: 76,
      subscriberCount: 198,
      trending: false,
      description: 'Writing realistic and compelling dialogue.',
    },
  ]);

  const [subscriptions, setSubscriptions] = useState<string[]>([
    'creative-writing',
    'storytelling',
    'writing-tips',
  ]);

  const toggleSubscription = (hashtag: string) => {
    setSubscriptions(prev =>
      prev.includes(hashtag)
        ? prev.filter(h => h !== hashtag)
        : [...prev, hashtag]
    );
  };

  const filteredHashtags = hashtags
    .filter(tag => 
      tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'popular') {
        return b.subscriberCount - a.subscriberCount;
      } else if (sortBy === 'trending') {
        if (a.trending && !b.trending) return -1;
        if (!a.trending && b.trending) return 1;
        return b.postCount - a.postCount;
      } else {
        return a.name.localeCompare(b.name);
      }
    });

  return (
    <div className="min-h-screen bg-[#FAF7F0]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          <span>Back to Discourse</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Browse Hashtags
          </h1>
          <p className="text-gray-600">
            Discover and subscribe to hashtags to customize your discourse feed
          </p>
        </div>

        {/* Search and filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hashtags..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('popular')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  sortBy === 'popular'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Popular
              </button>
              <button
                onClick={() => setSortBy('trending')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  sortBy === 'trending'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Trending
              </button>
              <button
                onClick={() => setSortBy('alphabetical')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  sortBy === 'alphabetical'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                A-Z
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Hash className="text-orange-600" size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{hashtags.length}</div>
                <div className="text-sm text-gray-600">Total Hashtags</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Star className="text-blue-600" size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{subscriptions.length}</div>
                <div className="text-sm text-gray-600">Your Subscriptions</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="text-green-600" size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {hashtags.filter(h => h.trending).length}
                </div>
                <div className="text-sm text-gray-600">Trending Now</div>
              </div>
            </div>
          </div>
        </div>

        {/* Hashtags grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHashtags.map(tag => {
            const isSubscribed = subscriptions.includes(tag.name);
            
            return (
              <div
                key={tag.name}
                className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/discourse?tag=${tag.name}`}
                      className="text-lg font-semibold text-gray-900 hover:text-orange-600 transition-colors"
                    >
                      #{tag.name}
                    </Link>
                    {tag.trending && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                        <TrendingUp size={12} />
                        Trending
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => toggleSubscription(tag.name)}
                    className={`p-2 rounded-lg transition-colors ${
                      isSubscribed
                        ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                    }`}
                  >
                    <Star
                      size={20}
                      fill={isSubscribed ? 'currentColor' : 'none'}
                    />
                  </button>
                </div>

                {tag.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {tag.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Hash size={16} />
                    {tag.postCount} posts
                  </span>
                  <span className="flex items-center gap-1">
                    <Star size={16} />
                    {tag.subscriberCount} subscribers
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {filteredHashtags.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
            <Hash className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hashtags found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search query
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
