'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AnnotatedContent from '@/components/works/AnnotatedContent';

interface ContentNode {
  type: string;
  content?: Array<{ text?: string; [key: string]: unknown }>;
  [key: string]: unknown;
}

interface Content {
  content?: ContentNode[];
  [key: string]: unknown;
}

interface Work {
  id: string;
  title: string;
  content: Content | string;
  excerpt: string;
  status: string;
  visibility: string;
  viewCount: number;
  rating?: number;
  tags: string[];
  createdAt: string;
  publishedAt?: string;
  acceptingFeedback?: boolean;
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

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
    displayName: string;
  };
  parentId?: string;
  replies?: Comment[];
}

interface Rating {
  id: string;
  value: number;
  review?: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
  };
}

export default function WorkPage() {
  const params = useParams();
  const workId = params.id as string;
  
  const [work, setWork] = useState<Work | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'discussion' | 'qa' | 'ratings'>('discussion');

  // New comment/rating form states
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newReview, setNewReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadWork = async () => {
      if (workId) {
        try {
          setIsLoading(true);
          const response = await fetch(`/api/works/${workId}`);
          
          if (!response.ok) {
            if (response.status === 404) {
              throw new Error('Work not found');
            } else if (response.status === 403) {
              throw new Error('You do not have permission to view this work');
            } else {
              throw new Error('Failed to load work');
            }
          }

          const data = await response.json();
          setWork(data.work);
          setComments(data.work.comments || []);
          setRatings(data.work.ratings || []);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadWork();
  }, [workId]);



  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/works/${workId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      const result = await response.json();
      setComments(prev => [result.comment, ...prev]);
      setNewComment('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/works/${workId}/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          value: newRating, 
          review: newReview.trim() || undefined 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }

      const result = await response.json();
      setRatings(prev => [result.rating, ...prev]);
      setNewRating(5);
      setNewReview('');
      
      // Refresh work data to update average rating
      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  const extractTextFromContent = (content: Content | string): string => {
    if (typeof content === 'string') return content;
    if (!content || !content.content) return '';
    
    return content.content.map((node: ContentNode) => {
      if (node.type === 'paragraph' && node.content) {
        return node.content.map((text) => text.text || '').join('');
      }
      return '';
    }).join('\n\n');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number, interactive = false, onRate?: (value: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && onRate && onRate(star)}
            className={`text-lg ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            } ${interactive ? 'hover:text-yellow-300 cursor-pointer' : ''}`}
            disabled={!interactive}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-ink/60">Loading work...</p>
        </div>
      </div>
    );
  }

  if (error || !work) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-ink mb-4">Error</h1>
          <p className="text-red-600 mb-4">{error || 'Work not found'}</p>
          <Link 
            href="/library"
            className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
          >
            Back to Library
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-medium text-ink mb-2">{work.title}</h1>
              <div className="flex items-center gap-4 text-sm text-ink/60">
                <span>by {work.author.displayName}</span>
                <span>•</span>
                <span>{formatDate(work.publishedAt || work.createdAt)}</span>
                <span>•</span>
                <span>{work.viewCount} views</span>
                {work.rating && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <span>★ {work.rating.toFixed(1)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Link 
                href="/library"
                className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
              >
                ← Back to Library
              </Link>
            </div>
          </div>

          {/* Tags */}
          {work.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {work.tags.map((tag) => (
                <span 
                  key={tag} 
                  className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        {work.status === 'BETA' && work.acceptingFeedback ? (
          <div className="mb-8">
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-blue-600 font-medium">📝 Beta Version</span>
                <span className="text-sm text-blue-700">
                  This work is accepting feedback. Click on paragraphs to add annotations.
                </span>
              </div>
            </div>
            <AnnotatedContent 
              workId={work.id} 
              content={work.content}
            />
          </div>
        ) : (
          <div className="mb-8 prose prose-lg max-w-none">
            <div className="whitespace-pre-wrap text-ink leading-relaxed">
              {extractTextFromContent(work.content)}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('discussion')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'discussion'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Discussion ({work._count.comments})
            </button>
            <button
              onClick={() => setActiveTab('qa')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'qa'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Q&A (0)
            </button>
            <button
              onClick={() => setActiveTab('ratings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'ratings'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Ratings ({work._count.ratings})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'discussion' && (
          <div className="space-y-6">
            {/* New Comment Form */}
            <form onSubmit={handleSubmitComment} className="bg-gray-50 rounded-lg p-4">
              <textarea
                placeholder="Share your thoughts about this work..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
              />
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-ink/60">
                  <p>No comments yet. Be the first to share your thoughts!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-ink">{comment.author.displayName}</span>
                        <span className="text-xs text-ink/60">@{comment.author.username}</span>
                      </div>
                      <span className="text-xs text-ink/60">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-ink leading-relaxed">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'qa' && (
          <div className="text-center py-12 text-ink/60">
            <p className="text-lg mb-2">Q&A System Coming Soon</p>
            <p className="text-sm">Ask questions about this work and get answers from the author and community.</p>
          </div>
        )}

        {activeTab === 'ratings' && (
          <div className="space-y-6">
            {/* New Rating Form */}
            <form onSubmit={handleSubmitRating} className="bg-gray-50 rounded-lg p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-ink mb-2">Your Rating</label>
                {renderStars(newRating, true, setNewRating)}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-ink mb-2">Review (optional)</label>
                <textarea
                  placeholder="Share your detailed thoughts about this work..."
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                </button>
              </div>
            </form>

            {/* Ratings List */}
            <div className="space-y-4">
              {ratings.length === 0 ? (
                <div className="text-center py-8 text-ink/60">
                  <p>No ratings yet. Be the first to rate this work!</p>
                </div>
              ) : (
                ratings.map((rating) => (
                  <div key={rating.id} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-ink">{rating.user.displayName}</span>
                        {renderStars(rating.value)}
                      </div>
                      <span className="text-xs text-ink/60">{formatDate(rating.createdAt)}</span>
                    </div>
                    {rating.review && (
                      <p className="text-ink leading-relaxed mt-2">{rating.review}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}