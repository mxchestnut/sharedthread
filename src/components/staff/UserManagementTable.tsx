'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, RotateCcw, Mail, Phone, Calendar, User, Shield, Clock, AlertCircle, CheckCircle, XCircle, ExternalLink, ChevronDown, ChevronUp, FileText, MessageSquare, Star, Users as UsersIcon } from 'lucide-react';
import { logError } from '@/lib/error-logger';


interface UserData {
  id: string;
  username: string;
  displayName: string;
  email: string;
  phoneNumber: string | null;
  role: string;
  status: string;
  isApproved: boolean;
  emailVerified: boolean;
  onWaitlist: boolean;
  waitlistReason: string | null;
  birthday: string | null;
  pronouns: string | null;
  newsletterSubscribed: boolean;
  smsOptIn: boolean;
  createdAt: string;
  lastActiveAt: string;
  isOver18: boolean;
}

interface UserActivity {
  works: Array<{ id: string; title: string; status: string; createdAt: string }>;
  comments: Array<{ id: string; content: string; createdAt: string; workTitle: string }>;
  ratings: Array<{ id: string; score: number; createdAt: string; workTitle: string }>;
  communities: Array<{ id: string; name: string; role: string; joinedAt: string }>;
}

export default function UserManagementTable() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [waitlistFilter, setWaitlistFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Password reset
  const [resettingPassword, setResettingPassword] = useState<string | null>(null);
  const [processingApproval, setProcessingApproval] = useState<string | null>(null);
  const [changingStatus, setChangingStatus] = useState<string | null>(null);
  
  // Activity history
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [activityData, setActivityData] = useState<Record<string, UserActivity>>({});
  const [loadingActivity, setLoadingActivity] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/staff/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...users];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(query) ||
        user.displayName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.phoneNumber && user.phoneNumber.includes(query))
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter === 'approved') {
      filtered = filtered.filter(user => user.isApproved);
    } else if (statusFilter === 'pending') {
      filtered = filtered.filter(user => !user.isApproved);
    } else if (statusFilter === 'verified') {
      filtered = filtered.filter(user => user.emailVerified);
    } else if (statusFilter === 'unverified') {
      filtered = filtered.filter(user => !user.emailVerified);
    }

    // Waitlist filter
    if (waitlistFilter === 'waitlist') {
      filtered = filtered.filter(user => user.onWaitlist);
    } else if (waitlistFilter === 'active') {
      filtered = filtered.filter(user => !user.onWaitlist);
    }

    setFilteredUsers(filtered);
  }, [users, searchQuery, roleFilter, statusFilter, waitlistFilter]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handlePasswordReset = async (userId: string, email: string) => {
    if (!confirm(`Send password reset email to ${email}?`)) return;

    setResettingPassword(userId);
    try {
      const response = await fetch('/api/staff/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) throw new Error('Failed to send reset email');
      
      alert('Password reset email sent successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setResettingPassword(null);
    }
  };

  const handleApproveUser = async (userId: string, username: string) => {
    if (!confirm(`Approve user @${username}? They will gain full access to the platform.`)) return;

    setProcessingApproval(userId);
    try {
      const response = await fetch('/api/staff/users/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, approve: true }),
      });

      if (!response.ok) throw new Error('Failed to approve user');
      
      alert('User approved successfully!');
      fetchUsers(); // Refresh the list
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve user');
    } finally {
      setProcessingApproval(null);
    }
  };

  const handleDenyUser = async (userId: string, username: string) => {
    const reason = prompt(`Deny user @${username}?\n\nOptional: Enter a reason for denial:`);
    if (reason === null) return; // User cancelled

    setProcessingApproval(userId);
    try {
      const response = await fetch('/api/staff/users/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, approve: false, reason }),
      });

      if (!response.ok) throw new Error('Failed to deny user');
      
      alert('User denied. They will need to reapply.');
      fetchUsers(); // Refresh the list
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to deny user');
    } finally {
      setProcessingApproval(null);
    }
  };

  const handleStatusChange = async (userId: string, username: string, newStatus: string) => {
    const statusMessages = {
      ACTIVE: 'restore full access to',
      WARNED: 'issue a warning to',
      SUSPENDED: 'suspend',
      BANNED: 'permanently ban'
    };

    const message = statusMessages[newStatus as keyof typeof statusMessages] || 'change status of';
    if (!confirm(`Are you sure you want to ${message} @${username}?`)) return;

    setChangingStatus(userId);
    try {
      const response = await fetch('/api/staff/users/change-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to change user status');
      
      alert(`User status changed to ${newStatus}`);
      fetchUsers(); // Refresh the list
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to change user status');
    } finally {
      setChangingStatus(null);
    }
  };

  const toggleActivityHistory = async (userId: string) => {
    // If clicking on already expanded user, collapse it
    if (expandedUserId === userId) {
      setExpandedUserId(null);
      return;
    }

    // Expand this user
    setExpandedUserId(userId);

    // If we already have the data, don't fetch again
    if (activityData[userId]) {
      return;
    }

    // Fetch activity data
    setLoadingActivity(userId);
    try {
      const response = await fetch(`/api/staff/users/${userId}/activity`);
      if (!response.ok) throw new Error('Failed to fetch activity');
      const data = await response.json();
      setActivityData(prev => ({ ...prev, [userId]: data }));
    } catch (err) {
      logError('Failed to fetch user activity:', err);
      alert('Failed to load activity history');
      setExpandedUserId(null);
    } finally {
      setLoadingActivity(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateAge = (birthday: string | null) => {
    if (!birthday) return null;
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border-2 border-red-500 rounded text-red-800">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black">User Management</h2>
          <p className="text-sm text-gray-600">
            {filteredUsers.length} of {users.length} users
          </p>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border-2 border-black rounded hover:bg-gray-100 flex items-center gap-2"
          >
            <Filter size={18} />
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border-2 border-black rounded p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="STAFF">Staff</option>
              <option value="MEMBER">Member</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending Approval</option>
              <option value="verified">Email Verified</option>
              <option value="unverified">Email Unverified</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">Waitlist</label>
            <select
              value={waitlistFilter}
              onChange={(e) => setWaitlistFilter(e.target.value)}
              className="w-full px-3 py-2 border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">All Users</option>
              <option value="active">Active Users</option>
              <option value="waitlist">On Waitlist</option>
            </select>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white border-2 border-black rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">User</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Contact</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Role & Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Details</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Dates</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No users found matching your filters
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <>
                    <tr key={user.id} className="hover:bg-gray-50">
                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold">
                          {user.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-black">{user.displayName}</div>
                          <div className="text-sm text-gray-600">@{user.username}</div>
                          {user.pronouns && (
                            <div className="text-xs text-gray-500">{user.pronouns}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-3">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Mail size={14} />
                          <span className="truncate max-w-[200px]">{user.email}</span>
                        </div>
                        {user.phoneNumber && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Phone size={14} />
                            <span>{user.phoneNumber}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Role & Status */}
                    <td className="px-4 py-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Shield size={14} />
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${
                            user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                            user.role === 'STAFF' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                        
                        {/* Account Status Dropdown */}
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">Account Status:</label>
                          <select
                            value={user.status}
                            onChange={(e) => handleStatusChange(user.id, user.username, e.target.value)}
                            disabled={changingStatus === user.id}
                            className={`text-xs px-2 py-1 rounded border-2 w-full font-semibold ${
                              user.status === 'ACTIVE' ? 'bg-green-50 text-green-800 border-green-300' :
                              user.status === 'WARNED' ? 'bg-yellow-50 text-yellow-800 border-yellow-300' :
                              user.status === 'SUSPENDED' ? 'bg-orange-50 text-orange-800 border-orange-300' :
                              user.status === 'BANNED' ? 'bg-red-50 text-red-800 border-red-300' :
                              'bg-gray-50 text-gray-800 border-gray-300'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            <option value="ACTIVE">Active</option>
                            <option value="WARNED">Warned</option>
                            <option value="SUSPENDED">Suspended</option>
                            <option value="BANNED">Banned</option>
                          </select>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {user.onWaitlist && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded border border-yellow-300">
                              Waitlist
                            </span>
                          )}
                          {!user.isApproved && (
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded border border-orange-300">
                              Pending
                            </span>
                          )}
                          {user.emailVerified && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded border border-green-300">
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Details */}
                    <td className="px-4 py-3">
                      <div className="space-y-1 text-sm text-gray-700">
                        {user.birthday && (
                          <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            <span>Age: {calculateAge(user.birthday)}</span>
                          </div>
                        )}
                        {user.waitlistReason && (
                          <div className="flex items-center gap-2 text-yellow-700">
                            <AlertCircle size={14} />
                            <span className="text-xs">{user.waitlistReason}</span>
                          </div>
                        )}
                        <div className="flex gap-2 text-xs">
                          {user.newsletterSubscribed && (
                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">Newsletter</span>
                          )}
                          {user.smsOptIn && (
                            <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded">SMS</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Dates */}
                    <td className="px-4 py-3">
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User size={14} />
                          <span>Joined: {formatDate(user.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          <span>Active: {formatDate(user.lastActiveAt)}</span>
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-2">
                        {/* View Profile Link */}
                        <a
                          href={`/users/${user.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 px-3 py-1.5 text-sm border-2 border-black rounded hover:bg-gray-100"
                        >
                          <ExternalLink size={14} />
                          View Profile
                        </a>

                        {/* Approval Actions */}
                        {!user.isApproved && !user.onWaitlist && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleApproveUser(user.id, user.username)}
                              disabled={processingApproval === user.id}
                              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-sm bg-green-500 text-white border-2 border-black rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Approve user"
                            >
                              <CheckCircle size={14} />
                              Approve
                            </button>
                            <button
                              onClick={() => handleDenyUser(user.id, user.username)}
                              disabled={processingApproval === user.id}
                              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-sm bg-red-500 text-white border-2 border-black rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Deny user"
                            >
                              <XCircle size={14} />
                              Deny
                            </button>
                          </div>
                        )}

                        {/* Password Reset */}
                        <button
                          onClick={() => handlePasswordReset(user.id, user.email)}
                          disabled={resettingPassword === user.id}
                          className="flex items-center justify-center gap-2 px-3 py-1.5 text-sm border-2 border-black rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <RotateCcw size={14} />
                          {resettingPassword === user.id ? 'Sending...' : 'Reset Password'}
                        </button>

                        {/* Activity History Toggle */}
                        <button
                          onClick={() => toggleActivityHistory(user.id)}
                          className="flex items-center justify-center gap-2 px-3 py-1.5 text-sm border-2 border-black rounded hover:bg-gray-100"
                        >
                          {expandedUserId === user.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          Activity History
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Activity History Accordion Row */}
                  {expandedUserId === user.id && (
                    <tr>
                      <td colSpan={6} className="px-4 py-4 bg-gray-50">
                        {loadingActivity === user.id ? (
                          <div className="text-center py-4 text-gray-600">Loading activity...</div>
                        ) : activityData[user.id] ? (
                          <div className="space-y-4">
                            <h3 className="font-bold text-lg mb-3">Activity Snapshot for @{user.username}</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Works */}
                              <div className="bg-white border-2 border-black rounded p-3">
                                <div className="flex items-center gap-2 mb-3">
                                  <FileText size={16} />
                                  <h4 className="font-semibold">Works ({activityData[user.id].works.length})</h4>
                                </div>
                                {activityData[user.id].works.length === 0 ? (
                                  <p className="text-sm text-gray-500">No works created</p>
                                ) : (
                                  <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {activityData[user.id].works.map((work) => (
                                      <div key={work.id} className="text-sm border-l-2 border-gray-300 pl-2">
                                        <div className="font-medium">{work.title}</div>
                                        <div className="text-xs text-gray-600">
                                          <span className={`px-1.5 py-0.5 rounded ${
                                            work.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                                            work.status === 'BETA' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                          }`}>
                                            {work.status}
                                          </span>
                                          {' • '}
                                          {formatDate(work.createdAt)}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Comments */}
                              <div className="bg-white border-2 border-black rounded p-3">
                                <div className="flex items-center gap-2 mb-3">
                                  <MessageSquare size={16} />
                                  <h4 className="font-semibold">Comments ({activityData[user.id].comments.length})</h4>
                                </div>
                                {activityData[user.id].comments.length === 0 ? (
                                  <p className="text-sm text-gray-500">No comments posted</p>
                                ) : (
                                  <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {activityData[user.id].comments.map((comment) => (
                                      <div key={comment.id} className="text-sm border-l-2 border-gray-300 pl-2">
                                        <div className="text-xs text-gray-600 mb-1">
                                          On: <span className="font-medium">{comment.workTitle}</span>
                                        </div>
                                        <div className="text-xs line-clamp-2">{comment.content}</div>
                                        <div className="text-xs text-gray-500 mt-1">{formatDate(comment.createdAt)}</div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Ratings */}
                              <div className="bg-white border-2 border-black rounded p-3">
                                <div className="flex items-center gap-2 mb-3">
                                  <Star size={16} />
                                  <h4 className="font-semibold">Ratings ({activityData[user.id].ratings.length})</h4>
                                </div>
                                {activityData[user.id].ratings.length === 0 ? (
                                  <p className="text-sm text-gray-500">No ratings given</p>
                                ) : (
                                  <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {activityData[user.id].ratings.map((rating) => (
                                      <div key={rating.id} className="text-sm border-l-2 border-gray-300 pl-2">
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold text-yellow-600">{rating.score}/5</span>
                                          <span className="text-xs text-gray-600">{rating.workTitle}</span>
                                        </div>
                                        <div className="text-xs text-gray-500">{formatDate(rating.createdAt)}</div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Communities */}
                              <div className="bg-white border-2 border-black rounded p-3">
                                <div className="flex items-center gap-2 mb-3">
                                  <UsersIcon size={16} />
                                  <h4 className="font-semibold">Communities ({activityData[user.id].communities.length})</h4>
                                </div>
                                {activityData[user.id].communities.length === 0 ? (
                                  <p className="text-sm text-gray-500">Not in any communities</p>
                                ) : (
                                  <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {activityData[user.id].communities.map((community) => (
                                      <div key={community.id} className="text-sm border-l-2 border-gray-300 pl-2">
                                        <div className="font-medium">{community.name}</div>
                                        <div className="text-xs text-gray-600">
                                          <span className={`px-1.5 py-0.5 rounded ${
                                            community.role === 'OWNER' ? 'bg-purple-100 text-purple-800' :
                                            community.role === 'MODERATOR' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                          }`}>
                                            {community.role}
                                          </span>
                                          {' • '}
                                          {formatDate(community.joinedAt)}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-600">No activity data available</div>
                        )}
                      </td>
                    </tr>
                  )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border-2 border-black rounded p-4">
          <div className="text-2xl font-bold text-black">{users.length}</div>
          <div className="text-sm text-gray-600">Total Users</div>
        </div>
        <div className="bg-white border-2 border-black rounded p-4">
          <div className="text-2xl font-bold text-black">
            {users.filter(u => u.role === 'ADMIN').length}
          </div>
          <div className="text-sm text-gray-600">Admins</div>
        </div>
        <div className="bg-white border-2 border-black rounded p-4">
          <div className="text-2xl font-bold text-black">
            {users.filter(u => u.onWaitlist).length}
          </div>
          <div className="text-sm text-gray-600">On Waitlist</div>
        </div>
        <div className="bg-white border-2 border-black rounded p-4">
          <div className="text-2xl font-bold text-black">
            {users.filter(u => !u.isApproved).length}
          </div>
          <div className="text-sm text-gray-600">Pending Approval</div>
        </div>
        <div className="bg-white border-2 border-black rounded p-4">
          <div className="text-2xl font-bold text-black">
            {users.filter(u => u.emailVerified).length}
          </div>
          <div className="text-sm text-gray-600">Email Verified</div>
        </div>
      </div>
    </div>
  );
}
