'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface DashboardStats {
  pendingProposals: number;
  totalUsers: number;
  activeUsers: number;
  totalProposals: number;
  approvedProposals: number;
  rejectedProposals: number;
  totalCommunities: number;
}

interface RecentUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: string;
  createdAt: string;
}

interface RecentProposal {
  id: string;
  proposedName: string;
  proposedSlug: string;
  status: string;
  createdAt: string;
  proposer: {
    id: string;
    username: string;
    displayName: string;
  };
}

interface DashboardData {
  stats: DashboardStats;
  recentActivity: {
    users: RecentUser[];
    proposals: RecentProposal[];
  };
}

export default function StaffDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/staff/dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto py-8 px-4">
          <div className="text-center py-8">
            <p className="text-ink/60">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto py-8 px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error loading dashboard: {error}</p>
            <button 
              onClick={fetchDashboardData}
              className="mt-2 text-red-600 hover:text-red-500 underline text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-medium text-ink mb-4">
            Staff Dashboard
          </h1>
          <p className="text-ink/70 leading-relaxed">
            Administrative tools for managing the Shared Thread community, reviewing proposals, and overseeing platform activity.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <h3 className="text-sm font-medium text-ink/60 mb-2">Pending Proposals</h3>
            <p className="text-2xl font-semibold text-ink">{data.stats.pendingProposals}</p>
          </div>
          <div className="card">
            <h3 className="text-sm font-medium text-ink/60 mb-2">Total Communities</h3>
            <p className="text-2xl font-semibold text-ink">{data.stats.totalCommunities}</p>
          </div>
          <div className="card">
            <h3 className="text-sm font-medium text-ink/60 mb-2">Total Users</h3>
            <p className="text-2xl font-semibold text-ink">{data.stats.totalUsers}</p>
            <p className="text-xs text-ink/60 mt-1">{data.stats.activeUsers} active (30 days)</p>
          </div>
          <div className="card">
            <h3 className="text-sm font-medium text-ink/60 mb-2">Total Proposals</h3>
            <p className="text-2xl font-semibold text-ink">{data.stats.totalProposals}</p>
            <p className="text-xs text-ink/60 mt-1">{data.stats.approvedProposals} approved, {data.stats.rejectedProposals} rejected</p>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-medium text-ink mb-3">User Management</h3>
            <div className="space-y-2">
              <Link 
                href="/staff/users" 
                className="block p-3 rounded-md bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-colors"
              >
                <span className="font-medium text-purple-900">Manage Users</span>
                <p className="text-sm text-purple-700">View, search, filter & reset passwords</p>
              </Link>
            </div>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-medium text-ink mb-3">Community Management</h3>
            <div className="space-y-2">
              <Link 
                href="/staff/community-reviews" 
                className="block p-3 rounded-md bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                <span className="font-medium text-blue-900">Review Proposals</span>
                <p className="text-sm text-blue-700">{data.stats.pendingProposals} pending</p>
              </Link>
              <Link 
                href="/staff/communities" 
                className="block p-3 rounded-md bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium text-gray-900">Manage Communities</span>
                <p className="text-sm text-gray-700">{data.stats.totalCommunities} total</p>
              </Link>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-ink mb-3">User Management</h3>
            <div className="space-y-2">
              <Link 
                href="/staff/users" 
                className="block p-3 rounded-md bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium text-gray-900">Manage Users</span>
                <p className="text-sm text-gray-700">{data.stats.totalUsers} total users</p>
              </Link>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-ink mb-3">AI Platform Insights</h3>
            <div className="space-y-2">
              <Link 
                href="/staff/ai-insights" 
                className="block p-3 rounded-md bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-colors"
              >
                <span className="font-medium text-purple-900">View AI Analytics</span>
                <p className="text-sm text-purple-700">Platform health & trend analysis</p>
              </Link>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-ink mb-3">Recent Activity</h3>
            <div className="space-y-2">
              <p className="text-sm text-ink/70">
                {data.recentActivity.proposals.length} recent proposals
              </p>
              <p className="text-sm text-ink/70">
                {data.recentActivity.users.length} new users (7 days)
              </p>
            </div>
          </div>
        </div>

        {/* Staff Access Note */}
        <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-medium text-green-900 mb-3">
            Staff Member Access
          </h3>
          <p className="text-sm text-green-800 mb-2">
            As a staff member, you have full access to all member features:
          </p>
          <div className="flex gap-4 text-sm">
            <Link href="/atelier" className="text-green-600 hover:text-green-500 underline">
              Atelier
            </Link>
            <Link href="/library" className="text-green-600 hover:text-green-500 underline">
              Library
            </Link>
            <Link href="/community-proposals" className="text-green-600 hover:text-green-500 underline">
              Communities
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}