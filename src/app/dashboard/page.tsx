'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FilePen, LibraryBig, Users, BookMarked, Plus, Sparkles } from 'lucide-react';
import { logError } from '@/lib/error-logger';


interface DashboardUser {
  id: string;
  username: string;
  displayName: string;
  role: string;
  _count: {
    works: number;
    followers: number;
    following: number;
  };
}

// Fortune cookie taglines (AI-generated style)
const fortuneCookies = [
  "Today's blank page is tomorrow's masterpiece.",
  "Every great work begins with a single sentence.",
  "Your story matters. The world is waiting to hear it.",
  "Creativity flows when you give it permission to breathe.",
  "The best time to write was yesterday. The second best time is now.",
  "Your unique voice is your superpower.",
  "Progress, not perfection, is the path to greatness.",
  "Every word you write is a seed planted for future growth.",
  "The muse favors the persistent, not the perfect.",
  "Your draft doesn't need to be good. It just needs to exist.",
];

export default function DashboardPage() {
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fortuneCookie, setFortuneCookie] = useState('');
  const [activeTab, setActiveTab] = useState<'activity' | 'discovery'>('activity');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      } catch (error) {
        logError('Failed to load user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
    
    // Set random fortune cookie
    const randomFortune = fortuneCookies[Math.floor(Math.random() * fortuneCookies.length)];
    setFortuneCookie(randomFortune);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Welcome Header with Fortune Cookie */}
        <div className="mb-8">
          <h1 className="text-3xl font-medium text-black mb-2">
            Welcome back, {user.displayName}
          </h1>
          <div className="flex items-start gap-2 text-gray-600">
            <Sparkles size={18} className="mt-0.5 flex-shrink-0 text-accent" />
            <p className="italic">{fortuneCookie}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="border-2 border-black p-6">
            <div className="text-3xl font-medium text-black mb-2">
              {user._count.works}
            </div>
            <div className="text-sm text-gray-600">Your Works</div>
          </div>
          <div className="border-2 border-black p-6">
            <div className="text-3xl font-medium text-black mb-2">
              {user._count.followers}
            </div>
            <div className="text-sm text-gray-600">Followers</div>
          </div>
          <div className="border-2 border-black p-6">
            <div className="text-3xl font-medium text-black mb-2">
              {user._count.following}
            </div>
            <div className="text-sm text-gray-600">Following</div>
          </div>
        </div>

        {/* My Work Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-medium text-black">My Work</h2>
            <Link
              href="/atelier/new"
              className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors font-medium"
            >
              <Plus size={18} />
              New Article
            </Link>
          </div>

          {/* Articles Grid or Template Placeholders */}
          {user._count.works === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Template Placeholders */}
              <div className="border-2 border-dashed border-gray-300 p-6 bg-gray-50">
                <div className="text-gray-400 mb-4">
                  <FilePen size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Essay</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Structured longform writing with sections and citations
                </p>
                <Link
                  href="/atelier/new?template=essay"
                  className="text-sm text-accent hover:underline"
                >
                  Start an essay →
                </Link>
              </div>

              <div className="border-2 border-dashed border-gray-300 p-6 bg-gray-50">
                <div className="text-gray-400 mb-4">
                  <LibraryBig size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Story</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Fiction or narrative with chapters and character development
                </p>
                <Link
                  href="/atelier/new?template=story"
                  className="text-sm text-accent hover:underline"
                >
                  Start a story →
                </Link>
              </div>

              <div className="border-2 border-dashed border-gray-300 p-6 bg-gray-50">
                <div className="text-gray-400 mb-4">
                  <BookMarked size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Guide</h3>
                <p className="text-sm text-gray-500 mb-4">
                  How-to content with steps, tips, and examples
                </p>
                <Link
                  href="/atelier/new?template=guide"
                  className="text-sm text-accent hover:underline"
                >
                  Start a guide →
                </Link>
              </div>
            </div>
          ) : (
            <div className="border-2 border-black p-6">
              <p className="text-center text-gray-600">
                Your works will appear here. Visit the{' '}
                <Link href="/atelier" className="text-accent hover:underline">
                  Atelier
                </Link>{' '}
                to manage your projects.
              </p>
            </div>
          )}
        </div>

        {/* Beta Projects Section (conditional) */}
        {user._count.works >= 3 && (
          <div className="mb-8">
            <h2 className="text-2xl font-medium text-black mb-4">Beta Projects</h2>
            <div className="border-2 border-black p-6">
              <p className="text-center text-gray-600">
                Projects in beta review will appear here once you have works ready for feedback.
              </p>
            </div>
          </div>
        )}

        {/* Quick Actions (conditional) */}
        {user._count.works < 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Link
              href="/library"
              className="border-2 border-black p-6 hover:bg-gray-50 transition-colors group"
            >
              <LibraryBig size={32} className="mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">Browse Library</h3>
              <p className="text-sm text-gray-600">Discover published works</p>
            </Link>

            <Link
              href="/users"
              className="border-2 border-black p-6 hover:bg-gray-50 transition-colors group"
            >
              <Users size={32} className="mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">Find Creators</h3>
              <p className="text-sm text-gray-600">Connect with other writers</p>
            </Link>

            <Link
              href="/collections"
              className="border-2 border-black p-6 hover:bg-gray-50 transition-colors group"
            >
              <BookMarked size={32} className="mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">My Collections</h3>
              <p className="text-sm text-gray-600">Organize your favorites</p>
            </Link>
          </div>
        )}

        {/* Activity & Discovery Feed Tabs */}
        <div className="border-2 border-black">
          {/* Tab Headers */}
          <div className="flex border-b-2 border-black">
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'activity'
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-gray-50'
              }`}
            >
              Activity Feed
            </button>
            <button
              onClick={() => setActiveTab('discovery')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'discovery'
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-gray-50'
              }`}
            >
              Discovery Feed
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'activity' ? (
              <div className="text-center py-12 text-gray-600">
                <p className="text-lg mb-2">Your activity feed will appear here</p>
                <p className="text-sm">
                  Updates from people you follow, comments on your works, and more
                </p>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-600">
                <p className="text-lg mb-2">Discover new content</p>
                <p className="text-sm">
                  Trending works, recommended creators, and curated collections
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Admin Link (if applicable) */}
        {user.role === 'admin' && (
          <div className="mt-8 p-6 bg-gray-50 border-2 border-black">
            <h3 className="text-lg font-medium text-black mb-2">Staff Access</h3>
            <p className="text-gray-600 mb-4">
              You have administrative privileges
            </p>
            <Link
              href="/staff"
              className="inline-block px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors font-medium"
            >
              Go to Staff Dashboard →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
