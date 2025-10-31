'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardStats {
  users: {
    total: number;
    newThisWeek: number;
    active: number;
  };
  works: {
    total: number;
    published: number;
    beta: number;
    drafts: number;
  };
  activity: {
    comments: number;
    ratings: number;
    follows: number;
    collections: number;
  };
  moderation: {
    pendingReports: number;
    resolvedToday: number;
  };
}

interface RecentActivity {
  id: string;
  type: 'user_joined' | 'work_published' | 'comment_added' | 'report_created';
  description: string;
  timestamp: string;
  user?: {
    username: string;
    displayName: string;
  };
  work?: {
    id: string;
    title: string;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch stats
      const statsResponse = await fetch('/api/admin/dashboard/stats');
      if (!statsResponse.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      const statsData = await statsResponse.json();
      setStats(statsData.stats);

      // Fetch recent activity
      const activityResponse = await fetch('/api/admin/dashboard/activity');
      if (!activityResponse.ok) {
        throw new Error('Failed to fetch recent activity');
      }
      const activityData = await activityResponse.json();
      setRecentActivity(activityData.activity);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_joined':
        return '👤';
      case 'work_published':
        return '📝';
      case 'comment_added':
        return '💬';
      case 'report_created':
        return '⚠️';
      default:
        return '📊';
    }
  };

  const formatActivityTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-ink/60">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-ink mb-4">Dashboard Error</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-medium text-ink mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Platform overview and management tools</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={fetchDashboardData}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md transition-colors text-sm"
                title="Refresh dashboard"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Users Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Users</h3>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-semibold text-ink">{formatNumber(stats.users.total)}</div>
                <div className="text-sm text-gray-600">
                  <span className="text-green-600">+{stats.users.newThisWeek}</span> this week
                </div>
                <div className="text-xs text-gray-500">{formatNumber(stats.users.active)} active</div>
              </div>
            </div>

            {/* Works Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Works</h3>
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-semibold text-ink">{formatNumber(stats.works.total)}</div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Published:</span>
                    <span className="text-green-600">{formatNumber(stats.works.published)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Beta:</span>
                    <span className="text-blue-600">{formatNumber(stats.works.beta)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Activity</h3>
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z"/>
                  </svg>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-semibold text-ink">{formatNumber(stats.activity.comments + stats.activity.ratings)}</div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Comments:</span>
                    <span className="text-ink">{formatNumber(stats.activity.comments)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ratings:</span>
                    <span className="text-ink">{formatNumber(stats.activity.ratings)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Moderation Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Moderation</h3>
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C14.8,12.6 13.9,13.5 12.8,13.5H11.2C10.1,13.5 9.2,12.6 9.2,11.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,9.5V10.8C10.5,11.1 10.7,11.3 11.0,11.3H13.0C13.3,11.3 13.5,11.1 13.5,10.8V9.5C13.5,8.7 12.8,8.2 12,8.2Z"/>
                  </svg>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-semibold text-ink">{formatNumber(stats.moderation.pendingReports)}</div>
                <div className="text-sm text-gray-600">Pending reports</div>
                <div className="text-xs text-gray-500">
                  {formatNumber(stats.moderation.resolvedToday)} resolved today
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-ink mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/admin/users"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-ink">Manage Users</div>
                    <div className="text-sm text-gray-600">View and moderate user accounts</div>
                  </div>
                </Link>

                <Link
                  href="/admin/reports"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                    <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-ink">Review Reports</div>
                    <div className="text-sm text-gray-600">Handle content moderation</div>
                  </div>
                </Link>

                <Link
                  href="/admin/works"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-ink">Content Management</div>
                    <div className="text-sm text-gray-600">Moderate works and content</div>
                  </div>
                </Link>

                <Link
                  href="/admin/analytics"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-ink">Analytics</div>
                    <div className="text-sm text-gray-600">View detailed platform metrics</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-ink mb-4">Recent Activity</h3>
              
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm">
                        {getActivityIcon(activity.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-ink">{activity.description}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <span>{formatActivityTime(activity.timestamp)}</span>
                          {activity.user && (
                            <>
                              <span>•</span>
                              <span>{activity.user.displayName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-12 h-12 mx-auto mb-4 text-gray-300">
                    <svg fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                    </svg>
                  </div>
                  <p>No recent activity to display</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}