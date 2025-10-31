'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TrendingUp, Sparkles, Users, BookOpen } from 'lucide-react';

type DiscoveryTab = 'trending' | 'recommended' | 'writers';

export default function DiscoveryPage() {
  const [activeTab, setActiveTab] = useState<DiscoveryTab>('trending');

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-medium text-black mb-2">
            Discovery
          </h1>
          <p className="text-gray-600">
            Explore trending content, personalized recommendations, and connect with creators
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b-2 border-black mb-8">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('trending')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                activeTab === 'trending'
                  ? 'border-b-2 border-black -mb-0.5 text-black'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <TrendingUp size={18} />
              Trending
            </button>
            <button
              onClick={() => setActiveTab('recommended')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                activeTab === 'recommended'
                  ? 'border-b-2 border-black -mb-0.5 text-black'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <Sparkles size={18} />
              For You
            </button>
            <button
              onClick={() => setActiveTab('writers')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                activeTab === 'writers'
                  ? 'border-b-2 border-black -mb-0.5 text-black'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <Users size={18} />
              Find Writers
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px]">
          {activeTab === 'trending' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-medium text-black mb-4">
                  Trending This Week
                </h2>
                <p className="text-gray-600 text-sm mb-6">
                  Popular works and discussions from the community
                </p>
              </div>

              {/* Trending Works Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border-2 border-black p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      <BookOpen size={14} />
                      <span>Trending #{i}</span>
                    </div>
                    <h3 className="text-lg font-medium text-black mb-2">
                      Placeholder Work Title
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      This is a placeholder for trending content. Real works will appear here based on engagement metrics.
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>by Author Name</span>
                      <span>1.2k views</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'recommended' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-medium text-black mb-4">
                  Recommended For You
                </h2>
                <p className="text-gray-600 text-sm mb-6">
                  Personalized picks based on your interests and reading history
                </p>
              </div>

              {/* Recommendations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="border-2 border-black p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2 text-xs text-accent mb-3">
                      <Sparkles size={14} />
                      <span>Recommended</span>
                    </div>
                    <h3 className="text-lg font-medium text-black mb-2">
                      Placeholder Recommendation
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      AI-powered recommendations will appear here based on your reading patterns and preferences.
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>by Author Name</span>
                      <span>Match: 85%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'writers' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-medium text-black mb-4">
                  Find Writers
                </h2>
                <p className="text-gray-600 text-sm mb-6">
                  Discover and connect with talented creators in the community
                </p>
              </div>

              {/* Search and Filters */}
              <div className="mb-6 flex gap-4">
                <input
                  type="text"
                  placeholder="Search writers by name or expertise..."
                  className="flex-1 px-4 py-2 border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-black"
                />
                <select className="px-4 py-2 border-2 border-black rounded bg-white">
                  <option>All Categories</option>
                  <option>Fiction</option>
                  <option>Non-Fiction</option>
                  <option>Poetry</option>
                  <option>Technical</option>
                </select>
              </div>

              {/* Writers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="border-2 border-black p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <Users size={24} className="text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-black">Writer Name</h3>
                        <p className="text-xs text-gray-600">@username</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Bio placeholder. Writers can describe their work and interests here.
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-xs text-gray-500">
                        <span className="font-medium text-black">12</span> works
                      </div>
                      <div className="text-xs text-gray-500">
                        <span className="font-medium text-black">234</span> followers
                      </div>
                    </div>
                    <Link
                      href={`/users/writer-${i}`}
                      className="block w-full px-4 py-2 border-2 border-black text-center text-sm font-medium hover:bg-black hover:text-white transition-colors"
                    >
                      View Profile
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-12 p-6 bg-gray-50 border-2 border-gray-200 rounded">
          <h3 className="font-medium text-black mb-2">About Discovery</h3>
          <p className="text-sm text-gray-600">
            The Discovery section helps you explore Shared Thread&apos;s content and community. 
            <strong> Trending</strong> shows popular works based on recent engagement.
            <strong> For You</strong> offers AI-powered recommendations tailored to your interests.
            <strong> Find Writers</strong> helps you connect with creators whose work aligns with your tastes.
          </p>
        </div>
      </div>
    </div>
  );
}
