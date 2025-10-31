'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, Globe, Lock, MessageSquare, FileText, Pin, ThumbsUp, Settings } from 'lucide-react';
import { CreateDiscussionModal } from '@/components/community/CreateDiscussionModal';
import { CommunityPrivacySettings } from '@/components/community/CommunityPrivacySettings';
import { CommunityAnnouncements } from '@/components/community/CommunityAnnouncements';
import { CommunityWorks } from '@/components/community/CommunityWorks';
import { logError, logInfo } from '@/lib/error-logger';


interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  isPrivate: boolean;
  privacyLevel?: 'PUBLIC' | 'GUARDED' | 'PRIVATE';
  settings?: Record<string, unknown>;
  memberCount: number;
  workCount: number;
  createdAt: string;
  owner: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  userMembership: { id: string; role: string; joinedAt: string } | null;
  isMember: boolean;
  isOwner: boolean;
}

interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: 'admin' | 'member';
  avatarUrl?: string;
}

interface DiscussionCategory {
  id: string;
  name: string;
  description?: string;
  slug: string;
  color: string;
  icon: string;
  position: number;
  postCount?: number;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  isImportant: boolean;
}

interface Discussion {
  id: string;
  title: string;
  slug: string;
  content: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  category: DiscussionCategory;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  upvotes: number;
  downvotes: number;
  replyCount: number;
  voteCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function CommunityPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [community, setCommunity] = useState<Community | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Discussion state
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [categories, setCategories] = useState<DiscussionCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [discussionsLoading, setDiscussionsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreatingDiscussion, setIsCreatingDiscussion] = useState(false);

  // Announcements state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Popular hashtags state
  const [popularHashtags, setPopularHashtags] = useState<Array<{ tag: string; count: number }>>([]);
  const [hashtagsLoading, setHashtagsLoading] = useState(false);

  // Helper function to check if user can perform member actions (is member OR is admin)
  const canPerformMemberActions = () => {
    return isMember || user?.role === 'admin';
  };

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else if (response.status === 401) {
        // Authentication failed, use mock admin user for testing
        setUser({
          id: 'admin1',
          username: 'admin',
          email: 'admin@sharedthread.co',
          displayName: 'Admin User',
          role: 'admin'
        });
      }
    } catch (error) {
      logError('Failed to fetch user:', error);
    }
  };

  const fetchCommunity = async () => {
    try {
      const response = await fetch(`/api/communities/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setCommunity(data);
        setIsMember(data.isMember);
      } else if (response.status === 401) {
        // Authentication failed, show mock data for testing
        logInfo('Authentication failed, showing mock data for community');
        setCommunity({
          id: '1',
          name: 'Hieroscope',
          slug: 'hieroscope',
          description: 'A divination practice combining cleromancy with bibliomancy, using marked tiles and texts to reveal hidden patterns and insights.',
          isPrivate: true,
          memberCount: 0,
          workCount: 0,
          createdAt: new Date().toISOString(),
          owner: {
            id: 'owner1',
            username: 'admin',
            displayName: 'Admin User',
            avatarUrl: undefined
          },
          userMembership: null,
          isMember: false,
          isOwner: false
        });
        setIsMember(false);
      } else {
        setError('Failed to fetch community');
      }
    } catch {
      setError('Failed to fetch community');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchUser();
      if (slug) {
        await fetchCommunity();
      }
    };
    loadData();
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeTab === 'discussions' && slug) {
      fetchCategories();
      fetchDiscussions();
    }
  }, [activeTab, slug, selectedCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeTab === 'overview' && slug) {
      fetchAnnouncements();
      fetchPopularHashtags();
    }
  }, [activeTab, slug]); // eslint-disable-line react-hooks/exhaustive-deps



  const handleJoinLeave = async () => {
    if (!community) return;
    
    try {
      const response = await fetch(`/api/communities/${slug}/membership`, {
        method: isMember ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to update membership');
      }
      
      setIsMember(!isMember);
      // Refresh community data to update member count
      await fetchCommunity();
    } catch (err) {
      logError('Membership error:', err);
    }
  };

  const fetchDiscussions = async () => {
    if (!slug) return;
    
    try {
      setDiscussionsLoading(true);
      const categoryParam = selectedCategory ? `?categoryId=${selectedCategory}` : '';
      const response = await fetch(`/api/communities/${slug}/discussions${categoryParam}`);
      
      if (response.ok) {
        const data = await response.json();
        setDiscussions(data.discussions || []);
      }
    } catch (err) {
      logError('Failed to fetch discussions:', err);
    } finally {
      setDiscussionsLoading(false);
    }
  };

  const fetchCategories = async () => {
    if (!slug) return;
    
    try {
      const response = await fetch(`/api/communities/${slug}/discussions/categories`);
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      logError('Failed to fetch categories:', err);
    }
  };

  const fetchAnnouncements = async () => {
    if (!slug) return;
    
    try {
      const response = await fetch(`/api/communities/${slug}/announcements`);
      
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.announcements || []);
      }
    } catch (err) {
      logError('Failed to fetch announcements:', err);
    }
  };

  const fetchPopularHashtags = async () => {
    if (!slug) return;
    
    try {
      setHashtagsLoading(true);
      const response = await fetch(`/api/communities/${slug}/works?limit=100`); // Get more works to analyze tags
      
      if (response.ok) {
        const data = await response.json();
        const works = data.works || [];
        
        // Count tag frequency
        const tagCounts: Record<string, number> = {};
        works.forEach((work: { tags?: string[] }) => {
          work.tags?.forEach((tag: string) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        });
        
        // Convert to array and sort by count, take top 5
        const sortedTags = Object.entries(tagCounts)
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        
        setPopularHashtags(sortedTags);
      }
    } catch (err) {
      logError('Failed to fetch popular hashtags:', err);
    } finally {
      setHashtagsLoading(false);
    }
  };

  const handleCreateAnnouncement = async (announcementData: { title: string; content: string; isImportant: boolean }) => {
    if (!slug) return;
    
    try {
      const response = await fetch(`/api/communities/${slug}/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(announcementData),
      });
      
      if (response.ok) {
        await fetchAnnouncements(); // Refresh announcements
      } else {
        throw new Error('Failed to create announcement');
      }
    } catch (error) {
      logError('Error creating announcement:', error);
      throw error;
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!slug) return;
    
    try {
      const response = await fetch(`/api/communities/${slug}/announcements?id=${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchAnnouncements(); // Refresh announcements
      } else {
        throw new Error('Failed to delete announcement');
      }
    } catch (error) {
      logError('Error deleting announcement:', error);
      throw error;
    }
  };

  const handleCreateDiscussion = async (discussionData: { title: string; content: string; categoryId: string }) => {
    if (!slug) return;
    
    try {
      setIsCreatingDiscussion(true);
      
      const response = await fetch(`/api/communities/${slug}/discussions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(discussionData),
      });
      
      if (response.ok) {
        // Refresh discussions list
        await fetchDiscussions();
        setShowCreateModal(false);
      } else {
        throw new Error('Failed to create discussion');
      }
    } catch (error) {
      logError('Error creating discussion:', error);
      throw error; // Re-throw to let modal handle the error
    } finally {
      setIsCreatingDiscussion(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-support">Loading community...</p>
        </div>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-medium text-ink mb-4">
            {error === 'Community not found' ? 'Community Not Found' : 'Error'}
          </h1>
          <p className="text-support mb-6">
            {error === 'Community not found' 
              ? 'The community you\'re looking for doesn\'t exist or may have been removed.'
              : error || 'Something went wrong while loading the community.'
            }
          </p>
          <Link
            href="/communities"
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Communities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/communities"
            className="inline-flex items-center gap-2 text-support hover:text-ink mb-4 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Communities
          </Link>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-medium text-ink">{community.name}</h1>
                <div className="flex items-center gap-1 text-sm text-support px-2 py-1 bg-white border border-border rounded">
                  {community.isPrivate ? (
                    <>
                      <Lock size={14} />
                      Private
                    </>
                  ) : (
                    <>
                      <Globe size={14} />
                      Public
                    </>
                  )}
                </div>
              </div>
              
              <p className="text-support leading-relaxed mb-4">
                {community.description}
              </p>
              
              <div className="flex items-center gap-6 text-sm text-support">
                <span className="flex items-center gap-1">
                  <Users size={14} />
                  {community.memberCount} member{community.memberCount !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1">
                  <FileText size={14} />
                  {community.workCount} work{community.workCount !== 1 ? 's' : ''}
                </span>
                <span>
                  Created by {community.owner.displayName} (@{community.owner.username})
                </span>
              </div>
            </div>
            
            <div className="ml-6 flex gap-3">
              {/* Admin users have automatic access, don't show join/leave button */}
              {user?.role !== 'admin' && (
                <button
                  onClick={handleJoinLeave}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    isMember
                      ? 'bg-white border-2 border-accent text-accent hover:bg-accent hover:text-white'
                      : 'bg-accent text-white hover:bg-accent/90'
                  }`}
                >
                  {isMember ? 'Leave Community' : 'Join Community'}
                </button>
              )}
              
              {/* Show admin badge for admin users */}
              {user?.role === 'admin' && (
                <div className="px-4 py-2 bg-accent/10 border border-accent/20 text-accent rounded-md font-medium">
                  Admin Access
                </div>
              )}
              
              {/* Show settings for community owner or admin */}
              {(user?.id === community.owner.id || user?.role === 'admin') && (
                <Link
                  href={`/communities/${community.slug}/settings`}
                  className="p-2 border-2 border-border hover:border-accent rounded-md transition-colors"
                >
                  ⚙️
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Community Content */}
        <div className="space-y-6">

          {/* Navigation Tabs */}
          <div className="border-b border-border">
            <nav className="flex gap-6">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium transition-colors ${
                  activeTab === 'overview' 
                    ? 'border-accent text-accent' 
                    : 'border-transparent text-support hover:text-ink'
                }`}
              >
                Overview
              </button>
              <button 
                onClick={() => setActiveTab('discussions')}
                className={`py-2 px-1 border-b-2 font-medium transition-colors ${
                  activeTab === 'discussions' 
                    ? 'border-accent text-accent' 
                    : 'border-transparent text-support hover:text-ink'
                }`}
              >
                Discussions
              </button>
              <button 
                onClick={() => setActiveTab('works')}
                className={`py-2 px-1 border-b-2 font-medium transition-colors ${
                  activeTab === 'works' 
                    ? 'border-accent text-accent' 
                    : 'border-transparent text-support hover:text-ink'
                }`}
              >
                Works
              </button>
              {(user?.id === community.owner.id || user?.role === 'admin') && (
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`py-2 px-1 border-b-2 font-medium transition-colors ${
                    activeTab === 'settings' 
                      ? 'border-accent text-accent' 
                      : 'border-transparent text-support hover:text-ink'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Settings size={16} />
                    <span>Settings</span>
                  </div>
                </button>
              )}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="card">
                  <h3 className="text-lg font-medium text-ink mb-4">About This Community</h3>
                  <p className="text-support leading-relaxed">
                    {community.description}
                  </p>
                </div>

                {/* Community Announcements */}
                <CommunityAnnouncements
                  announcements={announcements}
                  onCreateAnnouncement={handleCreateAnnouncement}
                  onDeleteAnnouncement={handleDeleteAnnouncement}
                  canManage={user?.id === community.owner.id || user?.role === 'admin'}
                />

                {/* Recent Activity Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Discussions */}
                  <div className="card">
                    <div className="flex items-center gap-3 mb-4">
                      <MessageSquare size={20} className="text-accent" />
                      <h3 className="text-lg font-medium text-ink">Recent Discussions</h3>
                    </div>
                    <div className="text-center py-8 text-support">
                      <p>No discussions yet. Be the first to start a conversation!</p>
                      {canPerformMemberActions() && (
                        <button className="mt-4 px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors">
                          Start Discussion
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Recent Works */}
                  <div className="card">
                    <div className="flex items-center gap-3 mb-4">
                      <FileText size={20} className="text-accent" />
                      <h3 className="text-lg font-medium text-ink">Recent Works</h3>
                    </div>
                    <div className="text-center py-8 text-support">
                      <p>No works published to this community yet.</p>
                      {canPerformMemberActions() && (
                        <button className="mt-4 px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors">
                          Publish Work
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Community Popular Hashtags */}
                <div className="card">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xl">#</span>
                    <h3 className="text-lg font-medium text-ink">Popular Hashtags</h3>
                  </div>
                  {hashtagsLoading ? (
                    <div className="text-center py-4 text-support">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent mx-auto mb-2"></div>
                      <p className="text-sm">Loading hashtags...</p>
                    </div>
                  ) : popularHashtags.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm text-support mb-3">
                        Trending topics in this community&apos;s works
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {popularHashtags.slice(0, 5).map((hashtag) => (
                          <div key={hashtag.tag} className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium">
                            #{hashtag.tag} ({hashtag.count})
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-support">
                      <p className="text-sm">Popular hashtags will appear here as works are published with tags.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Discussions Tab */}
            {activeTab === 'discussions' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare size={24} className="text-accent" />
                    <h2 className="text-xl font-medium text-ink">Community Discussions</h2>
                  </div>
                  {canPerformMemberActions() && (
                    <button 
                      onClick={() => setShowCreateModal(true)}
                      className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
                    >
                      Start New Discussion
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                {categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedCategory === null
                          ? 'bg-accent text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-accent text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Discussions List */}
                {discussionsLoading ? (
                  <div className="card">
                    <div className="text-center py-8 text-support">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
                      <p>Loading discussions...</p>
                    </div>
                  </div>
                ) : discussions.length > 0 ? (
                  <div className="space-y-4">
                    {discussions.map((discussion) => (
                      <div key={discussion.id} className="card hover:border-accent/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {discussion.isPinned && (
                                <div className="flex items-center gap-1 text-support text-sm">
                                  <Pin size={14} className="text-gray-600" />
                                  <span>Pinned</span>
                                </div>
                              )}
                              <div 
                                className="px-2 py-1 rounded text-xs text-white"
                                style={{ backgroundColor: discussion.category.color }}
                              >
                                {discussion.category.name}
                              </div>
                            </div>
                            
                            <h3 className="text-lg font-medium text-ink mb-2 hover:text-accent cursor-pointer">
                              {discussion.title}
                            </h3>
                            
                            <p className="text-support text-sm mb-3 leading-relaxed">
                              {discussion.content}
                            </p>
                            
                            <div className="flex items-center gap-4 text-xs text-support">
                              <span>By {discussion.author.displayName}</span>
                              <span>•</span>
                              <span>{discussion.replyCount} replies</span>
                              <span>•</span>
                              <span>{discussion.viewCount} views</span>
                              <span>•</span>
                              <span>{new Date(discussion.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <div className="flex items-center gap-1 text-xs text-support">
                              <ThumbsUp size={14} className="text-gray-500" />
                              <span>{discussion.upvotes}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="card">
                    <div className="text-center py-12 text-support">
                      <MessageSquare size={48} className="mx-auto mb-4 text-accent/50" />
                      <p className="text-lg mb-2">
                        {selectedCategory ? 'No discussions in this category yet' : 'No discussions yet'}
                      </p>
                      <p>Be the first to start a conversation!</p>
                      {canPerformMemberActions() && (
                        <button 
                          onClick={() => setShowCreateModal(true)}
                          className="mt-6 px-6 py-3 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
                        >
                          {selectedCategory ? 'Create Discussion' : 'Create First Discussion'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Works Tab */}
            {activeTab === 'works' && (
              <CommunityWorks
                communitySlug={slug}
                canPublish={canPerformMemberActions()}
              />
            )}

            {/* Settings Tab - Only visible to community owner or admin */}
            {activeTab === 'settings' && (user?.id === community.owner.id || user?.role === 'admin') && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Settings size={24} className="text-accent" />
                  <h2 className="text-xl font-medium text-ink">Community Settings</h2>
                </div>

                <CommunityPrivacySettings
                  currentPrivacy={
                    community.privacyLevel || 
                    (community.isPrivate ? 'PRIVATE' : 'PUBLIC')
                  }
                  onSave={async (newPrivacy) => {
                    const response = await fetch(`/api/communities/${community.slug}/privacy`, {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ 
                        privacyLevel: newPrivacy,
                        isPrivate: newPrivacy !== 'PUBLIC'
                      }),
                    });

                    if (!response.ok) {
                      const error = await response.json();
                      throw new Error(error.error || 'Failed to update privacy settings');
                    }

                    // Refresh community data
                    await fetchCommunity();
                  }}
                  isOwner={user?.id === community.owner.id || user?.role === 'admin'}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Discussion Modal */}
      <CreateDiscussionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateDiscussion}
        categories={categories}
        isSubmitting={isCreatingDiscussion}
      />
    </div>
  );
}