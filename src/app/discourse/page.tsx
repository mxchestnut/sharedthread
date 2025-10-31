'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  Clock, 
  Hash, 
  MessageSquare, 
  ArrowBigUp, 
  ArrowBigDown,
  Send,
  Plus,
  Filter,
  Star,
  Sparkles
} from 'lucide-react';

type SortOption = 'hot' | 'new' | 'top';
type FeedFilter = 'all' | 'subscribed' | 'following';

interface DiscoursePost {
  id: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  title: string;
  content: string;
  hashtags: string[];
  upvotes: number;
  downvotes: number;
  commentCount: number;
  createdAt: string;
  userVote?: 'up' | 'down' | null;
}

interface HashtagSubscription {
  hashtag: string;
  postCount: number;
}

export default function DiscoursePage() {
  const [sortBy, setSortBy] = useState<SortOption>('hot');
  const [feedFilter, setFeedFilter] = useState<FeedFilter>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', hashtags: '' });
  
  // Initialize with mock data
  const [posts, setPosts] = useState<DiscoursePost[]>([
    {
      id: '1',
      author: {
        id: 'u1',
        username: 'sarah_writes',
        displayName: 'Sarah Martinez',
      },
      title: 'The future of collaborative storytelling platforms',
      content: 'I\'ve been thinking about how platforms like Shared Thread are changing the way we create and share stories. The ability to get real-time feedback during beta phases is revolutionary...',
      hashtags: ['storytelling', 'collaboration', 'creative-writing'],
      upvotes: 42,
      downvotes: 3,
      commentCount: 18,
      createdAt: '2024-01-15T14:30:00Z',
      userVote: null,
    },
    {
      id: '2',
      author: {
        id: 'u2',
        username: 'alex_dev',
        displayName: 'Alex Chen',
      },
      title: 'Tips for structuring long-form essays',
      content: 'After writing 50+ essays on this platform, I\'ve learned some key principles about structure. Here\'s what works...',
      hashtags: ['writing-tips', 'essays', 'structure'],
      upvotes: 89,
      downvotes: 5,
      commentCount: 34,
      createdAt: '2024-01-15T11:30:00Z',
      userVote: 'up',
    },
    {
      id: '3',
      author: {
        id: 'u3',
        username: 'jamie_poet',
        displayName: 'Jamie Rivera',
      },
      title: 'How I use annotations to improve my drafts',
      content: 'The annotation system has completely changed my editing process. Instead of generic comments, I can point to specific paragraphs...',
      hashtags: ['annotations', 'editing', 'beta-feedback'],
      upvotes: 67,
      downvotes: 2,
      commentCount: 23,
      createdAt: '2024-01-15T08:30:00Z',
      userVote: null,
    },
  ]);
  
  const [subscriptions, setSubscriptions] = useState<HashtagSubscription[]>([
    { hashtag: 'creative-writing', postCount: 156 },
    { hashtag: 'storytelling', postCount: 89 },
    { hashtag: 'writing-tips', postCount: 234 },
  ]);
  
  const handleVote = (postId: string, voteType: 'up' | 'down') => {
    setPosts(prev => prev.map(post => {
      if (post.id !== postId) return post;
      
      const currentVote = post.userVote;
      let newUpvotes = post.upvotes;
      let newDownvotes = post.downvotes;
      let newUserVote: 'up' | 'down' | null = voteType;
      
      // Remove previous vote
      if (currentVote === 'up') newUpvotes--;
      if (currentVote === 'down') newDownvotes--;
      
      // Add new vote or remove if same
      if (currentVote === voteType) {
        newUserVote = null;
      } else {
        if (voteType === 'up') newUpvotes++;
        if (voteType === 'down') newDownvotes++;
      }
      
      return {
        ...post,
        upvotes: newUpvotes,
        downvotes: newDownvotes,
        userVote: newUserVote,
      };
    }));
  };
  
  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    
    const hashtags = newPost.hashtags
      .split(',')
      .map(tag => tag.trim().toLowerCase().replace(/^#/, ''))
      .filter(tag => tag.length > 0);
    
    const post: DiscoursePost = {
      id: Date.now().toString(),
      author: {
        id: 'current-user',
        username: 'you',
        displayName: 'You',
      },
      title: newPost.title,
      content: newPost.content,
      hashtags,
      upvotes: 1,
      downvotes: 0,
      commentCount: 0,
      createdAt: new Date().toISOString(),
      userVote: 'up',
    };
    
    setPosts(prev => [post, ...prev]);
    setNewPost({ title: '', content: '', hashtags: '' });
    setIsCreating(false);
  };
  
  const toggleSubscription = (hashtag: string) => {
    setSubscriptions(prev => {
      const exists = prev.find(s => s.hashtag === hashtag);
      if (exists) {
        return prev.filter(s => s.hashtag !== hashtag);
      } else {
        return [...prev, { hashtag, postCount: 0 }];
      }
    });
  };
  
  const getScore = (post: DiscoursePost) => post.upvotes - post.downvotes;
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-medium text-black mb-2">Discourse</h1>
              <p className="text-gray-600">
                Community discussions, questions, and conversations
              </p>
            </div>
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors font-medium"
              aria-label={isCreating ? "Cancel creating new post" : "Create a new post"}
              aria-expanded={isCreating}
            >
              <Plus size={20} aria-hidden="true" />
              New Post
            </button>
          </div>

          {/* Filters & Sort */}
          <div className="flex flex-wrap items-center gap-4 mb-6" role="toolbar" aria-label="Post filters and sorting">
            {/* Feed Filter */}
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-600" aria-hidden="true" />
              <div className="flex border-2 border-black" role="group" aria-label="Feed filter">
                <button
                  onClick={() => setFeedFilter('all')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    feedFilter === 'all'
                      ? 'bg-black text-white'
                      : 'bg-white text-black hover:bg-gray-100'
                  }`}
                  aria-pressed={feedFilter === 'all'}
                  aria-label="Show all posts"
                >
                  All Posts
                </button>
                <button
                  onClick={() => setFeedFilter('subscribed')}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-l-2 border-black ${
                    feedFilter === 'subscribed'
                      ? 'bg-black text-white'
                      : 'bg-white text-black hover:bg-gray-100'
                  }`}
                  aria-pressed={feedFilter === 'subscribed'}
                  aria-label="Show posts from subscribed tags only"
                >
                  Subscribed Tags
                </button>
                <button
                  onClick={() => setFeedFilter('following')}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-l-2 border-black ${
                    feedFilter === 'following'
                      ? 'bg-black text-white'
                      : 'bg-white text-black hover:bg-gray-100'
                  }`}
                  aria-pressed={feedFilter === 'following'}
                  aria-label="Show posts from people you follow"
                >
                  Following
                </button>
              </div>
            </div>

            {/* Sort */}
            <div className="flex border-2 border-black ml-auto" role="group" aria-label="Sort posts">
              <button
                onClick={() => setSortBy('hot')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                  sortBy === 'hot'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
                aria-pressed={sortBy === 'hot'}
                aria-label="Sort by hot (trending posts)"
              >
                <TrendingUp size={16} aria-hidden="true" />
                Hot
              </button>
              <button
                onClick={() => setSortBy('new')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-l-2 border-black ${
                  sortBy === 'new'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
                aria-pressed={sortBy === 'new'}
                aria-label="Sort by new (most recent posts)"
              >
                <Clock size={16} aria-hidden="true" />
                New
              </button>
              <button
                onClick={() => setSortBy('top')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-l-2 border-black ${
                  sortBy === 'top'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
                aria-pressed={sortBy === 'top'}
                aria-label="Sort by top (highest rated posts)"
              >
                <Sparkles size={16} aria-hidden="true" />
                Top
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2">
            {/* Create Post Form */}
            {isCreating && (
              <div className="mb-6 border-2 border-black p-6">
                <h2 className="text-xl font-medium text-black mb-4">Create a Post</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={newPost.title}
                      onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="What's on your mind?"
                      maxLength={200}
                      className="w-full px-4 py-2 border-2 border-gray-300 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Content
                    </label>
                    <textarea
                      value={newPost.content}
                      onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Share your thoughts, ask a question, start a discussion..."
                      rows={6}
                      maxLength={5000}
                      className="w-full px-4 py-2 border-2 border-gray-300 focus:outline-none focus:border-black resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {newPost.content.length}/5000 characters
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Hashtags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={newPost.hashtags}
                      onChange={(e) => setNewPost(prev => ({ ...prev, hashtags: e.target.value }))}
                      placeholder="storytelling, writing-tips, creative-process"
                      className="w-full px-4 py-2 border-2 border-gray-300 focus:outline-none focus:border-black"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Add hashtags to help people discover your post
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCreatePost}
                      disabled={!newPost.title.trim() || !newPost.content.trim()}
                      className="flex items-center gap-2 px-6 py-2 bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      <Send size={16} />
                      Post
                    </button>
                    <button
                      onClick={() => {
                        setIsCreating(false);
                        setNewPost({ title: '', content: '', hashtags: '' });
                      }}
                      className="px-6 py-2 border-2 border-black hover:bg-gray-100 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Posts List */}
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="border-2 border-black hover:shadow-lg transition-shadow">
                  <div className="flex">
                    {/* Vote Section */}
                    <div className="w-16 bg-gray-50 border-r-2 border-black flex flex-col items-center py-4 gap-2">
                      <button
                        onClick={() => handleVote(post.id, 'up')}
                        className={`hover:bg-gray-200 p-1 rounded transition-colors ${
                          post.userVote === 'up' ? 'text-accent' : 'text-gray-600'
                        }`}
                        aria-label={`Upvote post: ${post.title}`}
                        title="Upvote this post"
                      >
                        <ArrowBigUp size={24} fill={post.userVote === 'up' ? 'currentColor' : 'none'} />
                      </button>
                      <span className="text-sm font-bold text-black" aria-label={`Score: ${getScore(post)}`}>{getScore(post)}</span>
                      <button
                        onClick={() => handleVote(post.id, 'down')}
                        className={`hover:bg-gray-200 p-1 rounded transition-colors ${
                          post.userVote === 'down' ? 'text-red-600' : 'text-gray-600'
                        }`}
                        aria-label={`Downvote post: ${post.title}`}
                        title="Downvote this post"
                      >
                        <ArrowBigDown size={24} fill={post.userVote === 'down' ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4">
                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                        <span className="font-medium text-black">u/{post.author.username}</span>
                        <span>•</span>
                        <span>{formatTimestamp(post.createdAt)}</span>
                      </div>

                      <Link href={`/discourse/${post.id}`} className="block group">
                        <h2 className="text-xl font-medium text-black mb-2 group-hover:text-accent transition-colors">
                          {post.title}
                        </h2>
                        <p className="text-gray-700 mb-3 line-clamp-3">
                          {post.content}
                        </p>
                      </Link>

                      {/* Hashtags */}
                      {post.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {post.hashtags.map((tag) => {
                            const isSubscribed = subscriptions.some(s => s.hashtag === tag);
                            return (
                              <button
                                key={tag}
                                onClick={() => toggleSubscription(tag)}
                                className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                                  isSubscribed
                                    ? 'bg-accent text-white hover:bg-accent/90'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                                aria-label={isSubscribed ? `Unsubscribe from hashtag ${tag}` : `Subscribe to hashtag ${tag}`}
                                title={isSubscribed ? `Unsubscribe from #${tag}` : `Subscribe to #${tag}`}
                              >
                                <Hash size={12} />
                                {tag}
                                {isSubscribed && <Star size={10} fill="currentColor" />}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <Link
                          href={`/discourse/${post.id}`}
                          className="flex items-center gap-2 hover:text-black transition-colors"
                        >
                          <MessageSquare size={16} />
                          {post.commentCount} comments
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscribed Hashtags */}
            <div className="border-2 border-black p-6">
              <h3 className="text-lg font-medium text-black mb-4">Your Subscriptions</h3>
              {subscriptions.length === 0 ? (
                <p className="text-sm text-gray-600">
                  Click on hashtags in posts to subscribe and customize your feed.
                </p>
              ) : (
                <div className="space-y-2">
                  {subscriptions.map((sub) => (
                    <button
                      key={sub.hashtag}
                      onClick={() => toggleSubscription(sub.hashtag)}
                      className="flex items-center justify-between w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <Hash size={14} className="text-accent" />
                        <span className="text-sm font-medium text-black">{sub.hashtag}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {sub.postCount > 0 ? `${sub.postCount} posts` : 'Subscribed'}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              <Link
                href="/discourse/hashtags"
                className="block mt-4 text-center text-sm text-accent hover:underline"
              >
                Browse all hashtags →
              </Link>
            </div>

            {/* Popular Hashtags */}
            <div className="border-2 border-black p-6">
              <h3 className="text-lg font-medium text-black mb-4">Popular Hashtags</h3>
              <div className="space-y-2">
                {['creative-writing', 'storytelling', 'writing-tips', 'editing', 'beta-feedback'].map((tag) => {
                  const isSubscribed = subscriptions.some(s => s.hashtag === tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleSubscription(tag)}
                      className={`flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors ${
                        isSubscribed
                          ? 'bg-accent text-white hover:bg-accent/90'
                          : 'bg-gray-50 hover:bg-gray-100 text-black'
                      }`}
                    >
                      <Hash size={14} />
                      {tag}
                      {isSubscribed && <Star size={12} fill="currentColor" className="ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Community Guidelines */}
            <div className="border-2 border-black p-6 bg-gray-50">
              <h3 className="text-lg font-medium text-black mb-2">Community Guidelines</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Be respectful and constructive</li>
                <li>• Stay on topic</li>
                <li>• No self-promotion spam</li>
                <li>• Cite sources when sharing facts</li>
              </ul>
              <Link
                href="/community-guidelines"
                className="block mt-3 text-sm text-accent hover:underline"
              >
                Read full guidelines →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
