'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Community {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  description: string;
  isApproved: boolean;
  isPrivate: boolean;
  createdAt: string;
  owner: {
    id: string;
    username: string;
    displayName: string;
  };
  _count: {
    members: number;
  };
}

export default function CommunitiesManagementPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');

  useEffect(() => {
    loadCommunities();
  }, []);

  const loadCommunities = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/staff/communities');
      
      if (!response.ok) {
        throw new Error('Failed to load communities');
      }

      const data = await response.json();
      setCommunities(data.communities || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load communities');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCommunities = communities.filter(c => {
    if (filter === 'approved') return c.isApproved;
    if (filter === 'pending') return !c.isApproved;
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading communities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-medium text-black mb-2">Community Management</h1>
          <p className="text-gray-600">
            Manage approved communities and their settings
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 text-red-800">
            {error}
            <button
              onClick={loadCommunities}
              className="ml-4 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 border-2 font-medium transition-colors ${
              filter === 'all'
                ? 'border-black bg-black text-white'
                : 'border-black bg-white text-black hover:bg-gray-100'
            }`}
          >
            All ({communities.length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 border-2 font-medium transition-colors ${
              filter === 'approved'
                ? 'border-black bg-black text-white'
                : 'border-black bg-white text-black hover:bg-gray-100'
            }`}
          >
            Approved ({communities.filter(c => c.isApproved).length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 border-2 font-medium transition-colors ${
              filter === 'pending'
                ? 'border-black bg-black text-white'
                : 'border-black bg-white text-black hover:bg-gray-100'
            }`}
          >
            Pending ({communities.filter(c => !c.isApproved).length})
          </button>
        </div>

        {/* Communities List */}
        {filteredCommunities.length === 0 ? (
          <div className="text-center py-12 border-2 border-black">
            <p className="text-gray-600">No communities found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCommunities.map((community) => (
              <div
                key={community.id}
                className="border-2 border-black p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-medium text-black">
                        {community.name}
                      </h3>
                      {!community.isApproved && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium">
                          PENDING APPROVAL
                        </span>
                      )}
                      {community.isPrivate && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium">
                          PRIVATE
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-3">
                      <span className="font-medium">Subdomain:</span> {community.subdomain}.sharedthread.co
                      {' • '}
                      <span className="font-medium">Slug:</span> /{community.slug}
                    </div>

                    <p className="text-gray-800 mb-3">{community.description}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>
                        <span className="font-medium">Owner:</span>{' '}
                        <Link
                          href={`/users/${community.owner.username}`}
                          className="text-black underline hover:no-underline"
                        >
                          {community.owner.displayName}
                        </Link>
                      </span>
                      <span>•</span>
                      <span>
                        <span className="font-medium">Members:</span> {community._count.members}
                      </span>
                      <span>•</span>
                      <span>
                        <span className="font-medium">Created:</span>{' '}
                        {new Date(community.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Link
                      href={`/communities/${community.slug}`}
                      className="px-4 py-2 border-2 border-black bg-white text-black hover:bg-black hover:text-white transition-colors text-sm font-medium text-center"
                    >
                      View Community
                    </Link>
                    {/* TODO: Add more management actions */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back Link */}
        <div className="mt-8">
          <Link
            href="/staff"
            className="text-black underline hover:no-underline"
          >
            ← Back to Staff Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
