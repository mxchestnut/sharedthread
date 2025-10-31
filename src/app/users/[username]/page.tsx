'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface User {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  role: string;
  createdAt: string;
  lastActiveAt: string;
  reputationScore: number;
  _count: {
    works: number;
    followers: number;
    following: number;
    comments: number;
    ratings: number;
  };
  isFollowing?: boolean;
}

interface Work {
  id: string;
  title: string;
  excerpt: string;
  status: string;
  viewCount: number;
  rating?: number;
  createdAt: string;
  publishedAt?: string;
  tags: string[];
  _count: {
    comments: number;
    ratings: number;
  };
}

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [works, setWorks] = useState<Work[]>([]);
  const [activeTab, setActiveTab] = useState<'works' | 'activity' | 'about'>('works');
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/users/${username}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('User not found');
          } else {
            throw new Error('Failed to load user profile');
          }
        }

        const data = await response.json();
        setUser(data.user);
        setWorks(data.works || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      loadUserProfile();
    }
  }, [username]);

  const handleFollow = async () => {
    if (!user) return;
    
    setIsFollowLoading(true);
    try {
      const response = await fetch(`/api/users/${username}/follow`, {
        method: user.isFollowing ? 'DELETE' : 'POST',
      });

      if (response.ok) {
        setUser(prev => prev ? {
          ...prev,
          isFollowing: !prev.isFollowing,
          _count: {
            ...prev._count,
            followers: prev.isFollowing ? prev._count.followers - 1 : prev._count.followers + 1
          }
        } : null);
      } else {
        throw new Error('Failed to update follow status');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update follow status');
    } finally {
      setIsFollowLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'text-green-600 bg-green-100';
      case 'BETA': return 'text-blue-600 bg-blue-100';
      case 'DRAFT': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-ink/60">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-ink mb-4">Profile Not Found</h1>
          <p className="text-red-600 mb-4">{error || 'User not found'}</p>
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
        {/* Profile Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-medium">
              {user.avatarUrl ? (
                <Image 
                  src={user.avatarUrl} 
                  alt={user.displayName}
                  width={96}
                  height={96}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                user.displayName.charAt(0).toUpperCase()
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-medium text-ink mb-1">{user.displayName}</h1>
                  <p className="text-gray-600 mb-2">@{user.username}</p>
                  
                  {user.bio && (
                    <p className="text-ink mb-4 leading-relaxed">{user.bio}</p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-ink">{user._count.works}</div>
                      <div className="text-gray-600">Works</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-ink">{user._count.followers}</div>
                      <div className="text-gray-600">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-ink">{user._count.following}</div>
                      <div className="text-gray-600">Following</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-ink">{user.reputationScore}</div>
                      <div className="text-gray-600">Reputation</div>
                    </div>
                  </div>
                </div>

                {/* Follow Button */}
                <button
                  onClick={handleFollow}
                  disabled={isFollowLoading}
                  className={`px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    user.isFollowing
                      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      : 'bg-accent text-white hover:bg-accent/90'
                  }`}
                >
                  {isFollowLoading ? 'Loading...' : user.isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>Joined {formatDate(user.createdAt)}</span>
              <span>•</span>
              <span>Last active {formatDate(user.lastActiveAt)}</span>
              {user.role === 'admin' && (
                <>
                  <span>•</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                    Staff
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('works')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'works'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Works ({user._count.works})
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'activity'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Activity
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'about'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              About
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'works' && (
          <div className="space-y-4">
            {works.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No published works yet.</p>
              </div>
            ) : (
              works.map((work) => (
                <div key={work.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link href={`/works/${work.id}`}>
                        <h3 className="text-xl font-medium text-ink mb-2 hover:text-blue-600 transition-colors cursor-pointer">
                          {work.title}
                        </h3>
                      </Link>
                      <p className="text-gray-600 mb-3">{work.excerpt}</p>
                      
                      {/* Tags */}
                      {work.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {work.tags.map((tag) => (
                            <span key={tag} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{work.viewCount} views</span>
                        <span>{work._count.comments} comments</span>
                        <span>{work._count.ratings} ratings</span>
                        {work.rating && (
                          <span>★ {work.rating.toFixed(1)}</span>
                        )}
                        <span>•</span>
                        <span>{formatDate(work.publishedAt || work.createdAt)}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(work.status)}`}>
                      {work.status.charAt(0) + work.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">Activity Feed Coming Soon</p>
            <p className="text-sm">Recent comments, ratings, and interactions will appear here.</p>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-ink mb-2">About {user.displayName}</h3>
                {user.bio ? (
                  <p className="text-gray-600 leading-relaxed">{user.bio}</p>
                ) : (
                  <p className="text-gray-500 italic">No bio provided yet.</p>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-ink mb-3">Statistics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-medium text-accent">{user._count.works}</div>
                    <div className="text-sm text-gray-600">Published Works</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-medium text-accent">{user._count.comments}</div>
                    <div className="text-sm text-gray-600">Comments Posted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-medium text-accent">{user._count.ratings}</div>
                    <div className="text-sm text-gray-600">Works Rated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-medium text-accent">{user.reputationScore}</div>
                    <div className="text-sm text-gray-600">Reputation Score</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}