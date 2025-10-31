'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, User, Eye, MessageSquare, Star, Filter, Clock, TrendingUp } from 'lucide-react';
import { logError } from '@/lib/error-logger';


interface Work {
  id: string;
  title: string;
  excerpt: string | null;
  authorId: string;
  status: string;
  publishedAt: string | null;
  viewCount: number;
  rating: number | null;
  tags: string[];
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  _count: {
    comments: number;
    ratings: number;
  };
}

interface CommunityWorksProps {
  communitySlug: string;
  canPublish: boolean;
}

export function CommunityWorks({ communitySlug, canPublish }: CommunityWorksProps) {
  const [works, setWorks] = useState<Work[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchWorks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        sortBy,
        ...(selectedCategory && { category: selectedCategory })
      });

      const response = await fetch(`/api/communities/${communitySlug}/works?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setWorks(data.works || []);
        setCategories(data.categories || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.totalCount || 0);
      } else {
        logError('Error', 'Failed to fetch works');
      }
    } catch (error) {
      logError('Error fetching works:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorks();
  }, [communitySlug, selectedCategory, sortBy, currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Draft';
    return new Date(dateString).toLocaleDateString();
  };

  const getSortIcon = (sort: string) => {
    switch (sort) {
      case 'popular': return <TrendingUp size={16} />;
      case 'discussed': return <MessageSquare size={16} />;
      default: return <Clock size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="flex gap-4">
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filters and sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FileText size={24} className="text-accent" />
          <div>
            <h2 className="text-xl font-medium text-ink">Community Works</h2>
            <p className="text-sm text-support">{totalCount} published works</p>
          </div>
        </div>
        
        {canPublish && (
          <button className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors">
            Publish Work
          </button>
        )}
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-support" />
          <select
            value={selectedCategory || ''}
            onChange={(e) => {
              setSelectedCategory(e.target.value || null);
              setCurrentPage(1);
            }}
            className="px-3 py-1 border border-border rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          {['latest', 'popular', 'discussed'].map(sort => (
            <button
              key={sort}
              onClick={() => {
                setSortBy(sort);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 transition-colors ${
                sortBy === sort
                  ? 'bg-accent text-white'
                  : 'bg-white border border-border text-support hover:text-ink hover:border-accent'
              }`}
            >
              {getSortIcon(sort)}
              <span className="capitalize">{sort}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Works List */}
      {works.length > 0 ? (
        <div className="space-y-4">
          {works.map(work => (
            <div key={work.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <Link 
                    href={`/works/${work.id}`}
                    className="text-lg font-medium text-ink hover:text-accent transition-colors"
                  >
                    {work.title}
                  </Link>
                  <div className="flex items-center gap-3 mt-1 text-sm text-support">
                    <span className="flex items-center gap-1">
                      <User size={14} />
                      {work.author.displayName}
                    </span>
                    <span>•</span>
                    <span>{formatDate(work.publishedAt)}</span>
                    {work.tags.length > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-accent font-medium">{work.tags[0]}</span>
                      </>
                    )}
                  </div>
                </div>
                
                {work.rating && (
                  <div className="flex items-center gap-1 text-sm text-support ml-4">
                    <Star size={14} className="text-yellow-500" />
                    <span>{work.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              
              {work.excerpt && (
                <p className="text-support leading-relaxed mb-4 line-clamp-3">
                  {work.excerpt}
                </p>
              )}
              
              <div className="flex items-center gap-6 text-sm text-support">
                <span className="flex items-center gap-1">
                  <Eye size={14} />
                  {work.viewCount} views
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare size={14} />
                  {work._count.comments} comments
                </span>
                {work._count.ratings > 0 && (
                  <span className="flex items-center gap-1">
                    <Star size={14} />
                    {work._count.ratings} ratings
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="text-center py-12 text-support">
            <FileText size={48} className="mx-auto mb-4 text-accent/50" />
            <p className="text-lg mb-2">
              {selectedCategory ? `No works in "${selectedCategory}" category yet` : 'No works published yet'}
            </p>
            <p className="mb-6">
              {selectedCategory 
                ? 'Try selecting a different category or be the first to publish in this one!' 
                : 'Share your first work with this community!'}
            </p>
            {canPublish && (
              <button className="px-6 py-3 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors">
                Publish First Work
              </button>
            )}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:border-accent transition-colors"
          >
            Previous
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages, currentPage - 2 + i));
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    currentPage === pageNum
                      ? 'bg-accent text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:border-accent transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}