'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, Filter } from 'lucide-react';
import LibraryCard from '@/components/LibraryCard';
import { logInfo } from '@/lib/error-logger';


interface Work {
  id: string;
  title: string;
  excerpt: string;
  status: string;
  viewCount: number;
  rating?: number;
  tags: string[];
  createdAt: string;
  author: {
    id: string;
    username: string;
    displayName: string;
  };
  _count: {
    comments: number;
    ratings: number;
    collections: number;
  };
}

interface Tag {
  tag: string;
  count: number;
}

interface LibraryData {
  works: Work[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  filters: {
    popularTags: Tag[];
    currentSearch: string;
    currentStatus: string;
    currentTags: string[];
    currentSortBy: string;
  };
}

export function DynamicLibrary() {
  const [data, setData] = useState<LibraryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('PUBLISHED');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);

  const fetchWorks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        status: selectedStatus,
        sortBy,
        search: searchQuery,
        tags: selectedTags.join(',')
      });
      
      const response = await fetch(`/api/library?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch works');
      }
      
      const libraryData = await response.json();
      setData(libraryData);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus, selectedTags, sortBy, searchQuery]);

  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWorks();
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setSortBy('recent');
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'Published Works';
      case 'BETA': return 'Beta Works';
      case 'DRAFT': return 'Draft Works';
      default: return 'All Works';
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <button 
          onClick={fetchWorks}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="pl-4 sm:pl-0">
      {/* Header with Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="bg-white rounded-lg border-2 border-black p-1 inline-flex">
          <button
            onClick={() => setSelectedStatus('PUBLISHED')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              selectedStatus === 'PUBLISHED' 
                ? 'bg-black text-white shadow-sm' 
                : 'text-black hover:bg-gray-100'
            }`}
          >
            Library
          </button>
          <button
            onClick={() => setSelectedStatus('BETA')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              selectedStatus === 'BETA' 
                ? 'bg-black text-white shadow-sm' 
                : 'text-black hover:bg-gray-100'
            }`}
          >
            Beta Works
          </button>
          <Link 
            href="/library/discourse" 
            className="px-4 py-2 text-black hover:bg-gray-100 transition-colors"
          >
            Discourse
          </Link>
        </div>

        {/* Search and Filter Toggle */}
        <div className="flex gap-3 flex-wrap">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
              <input
                type="text"
                placeholder="Search works..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm whitespace-nowrap"
            >
              Search
            </button>
          </form>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border-2 border-black rounded-md hover:bg-gray-100 transition-colors text-sm flex items-center gap-2 whitespace-nowrap"
          >
            <Filter size={16} />
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-2 border-black rounded-lg p-4 mb-6 space-y-4">
          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="comments">Most Discussed</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>

          {/* Popular Tags */}
          {data?.filters.popularTags && data.filters.popularTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-black mb-2">Popular Tags</label>
              <div className="flex flex-wrap gap-2">
                {data.filters.popularTags.slice(0, 15).map(({ tag, count }) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-black text-white'
                        : 'bg-white border-2 border-black text-black hover:bg-gray-100'
                    }`}
                  >
                    {tag} ({count})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {(selectedTags.length > 0 || searchQuery) && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-black">Active Filters:</span>
                <button
                  onClick={clearFilters}
                  className="text-xs text-black hover:text-gray-700 underline"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <span className="px-2 py-1 bg-gray-200 text-black rounded text-xs border border-black">
                    Search: &quot;{searchQuery}&quot;
                  </span>
                )}
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-200 text-black rounded text-xs flex items-center gap-1 border border-black"
                  >
                    {tag}
                    <button
                      onClick={() => toggleTag(tag)}
                      className="text-black hover:text-gray-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-medium text-black">
          {getStatusLabel(selectedStatus)}
        </h2>
        {data && (
          <span className="text-sm text-gray-600">
            {data.pagination.total} {data.pagination.total === 1 ? 'work' : 'works'}
          </span>
        )}
      </div>

      {/* Works Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border-2 border-black rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : data && data.works.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.works.map((work) => (
            <LibraryCard
              key={work.id}
              title={work.title}
              excerpt={work.excerpt}
              rating={work.rating?.toFixed(1) || 'New'}
              comments={work._count.comments}
              saves={work._count.collections}
              author={work.author.displayName}
              authorUsername={work.author.username}
              tags={work.tags}
              workId={work.id}
              status={work.status}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-600">
          <p className="text-lg mb-2">No works found</p>
          <p className="text-sm">
            {searchQuery || selectedTags.length > 0 
              ? 'Try adjusting your search or filters'
              : 'Be the first to publish a work!'}
          </p>
          {selectedStatus === 'PUBLISHED' && (
            <Link 
              href="/atelier"
              className="inline-block mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Create Your First Work
            </Link>
          )}
        </div>
      )}

      {/* Pagination */}
      {data && data.pagination.hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={() => {
              // TODO: Implement load more functionality
              logInfo('Load more works');
            }}
            className="px-6 py-2 border-2 border-black rounded-md hover:bg-gray-100 transition-colors"
          >
            Load More Works
          </button>
        </div>
      )}
    </div>
  );
}