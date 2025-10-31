'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { logError } from '@/lib/error-logger';


interface User {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  role: string;
  reputationScore: number;
  _count: {
    works: number;
    followers: number;
    following: number;
  };
  isFollowing?: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'reputation' | 'works' | 'followers' | 'recent'>('reputation');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/users?sort=${sortBy}&search=${encodeURIComponent(searchQuery)}`);
        
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users || []);
        }
      } catch (error) {
        logError('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [sortBy, searchQuery]);



  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Trigger useEffect by updating searchQuery
  };

  const handleFollow = async (username: string, isCurrentlyFollowing: boolean) => {
    try {
      const response = await fetch(`/api/users/${username}/follow`, {
        method: isCurrentlyFollowing ? 'DELETE' : 'POST',
      });

      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user.username === username
            ? {
                ...user,
                isFollowing: !isCurrentlyFollowing,
                _count: {
                  ...user._count,
                  followers: isCurrentlyFollowing ? user._count.followers - 1 : user._count.followers + 1
                }
              }
            : user
        ));
      }
    } catch (error) {
      logError('Error updating follow status:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.bio && user.bio.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-medium text-ink mb-4">Discover Writers</h1>
          <p className="text-gray-600 mb-6">
            Connect with talented writers and creators in the Shared Thread community.
          </p>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search writers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </form>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'reputation' | 'works' | 'followers' | 'recent')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              >
                <option value="reputation">Reputation</option>
                <option value="works">Works Published</option>
                <option value="followers">Followers</option>
                <option value="recent">Recently Active</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading writers...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No writers found</p>
            <p className="text-sm">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <div key={user.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                {/* Avatar and Header */}
                <div className="flex items-center gap-4 mb-4">
                  <Link href={`/users/${user.username}`}>
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-lg font-medium cursor-pointer hover:opacity-90 transition-opacity">
                      {user.avatarUrl ? (
                        <Image 
                          src={user.avatarUrl} 
                          alt={user.displayName}
                          width={48}
                          height={48}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        user.displayName.charAt(0).toUpperCase()
                      )}
                    </div>
                  </Link>
                  
                  <div className="flex-1">
                    <Link href={`/users/${user.username}`}>
                      <h3 className="font-medium text-ink hover:text-blue-600 transition-colors cursor-pointer">
                        {user.displayName}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-600">@{user.username}</p>
                    {user.role === 'admin' && (
                      <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium mt-1">
                        Staff
                      </span>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {user.bio && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {user.bio}
                  </p>
                )}

                {/* Stats */}
                <div className="flex justify-between items-center mb-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-ink">{user._count.works}</div>
                    <div className="text-gray-600">Works</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-ink">{user._count.followers}</div>
                    <div className="text-gray-600">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-ink">{user.reputationScore}</div>
                    <div className="text-gray-600">Reputation</div>
                  </div>
                </div>

                {/* Follow Button */}
                <button
                  onClick={() => handleFollow(user.username, user.isFollowing || false)}
                  className={`w-full py-2 rounded-md font-medium transition-colors ${
                    user.isFollowing
                      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      : 'bg-accent text-white hover:bg-accent/90'
                  }`}
                >
                  {user.isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {!isLoading && filteredUsers.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-600">
            Showing {filteredUsers.length} writer{filteredUsers.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}