'use client'

import React, { useState } from 'react'
import { User, AlertTriangle, TrendingUp, Shield, Star } from 'lucide-react'
import { logInfo, logError } from '@/lib/error-logger';


interface UserProfile {
  id: string
  username: string
  display_name: string
  email: string
  trust_level: number
  reputation_score: number
  account_created: string
  last_active: string
}

interface UserStats {
  total_works: number
  total_comments: number
  total_ratings_given: number
  average_rating_received: number
  views_received: number
  followers: number
  following: number
}

interface Strike {
  id: string
  type: string
  severity: 'minor' | 'moderate' | 'severe'
  description: string
  issued_at: string
  expires_at: string
  issued_by: string
  status: 'active' | 'expired' | 'appealed' | 'overturned'
}

interface UserModerationHistory {
  strikes: Strike[]
  appeals_filed: number
  appeals_successful: number
  total_reports_made: number
  valid_reports_made: number
  total_reports_received: number
  valid_reports_received: number
}

export function UserModerationPanel() {
  const [searchTerm, setSearchTerm] = useState('')
  const [actionType, setActionType] = useState<'strike' | 'reputation' | 'trust_level' | null>(null)

  // Mock data - in real implementation, this would come from API
  const [userData] = useState<{
    profile: UserProfile
    stats: UserStats
    moderation: UserModerationHistory
  }>({
    profile: {
      id: 'user_123',
      username: 'alex_writer',
      display_name: 'Alex Thompson',
      email: 'alex@example.com',
      trust_level: 1,
      reputation_score: 245,
      account_created: '2024-01-15T10:30:00Z',
      last_active: '2024-10-27T08:15:00Z'
    },
    stats: {
      total_works: 12,
      total_comments: 89,
      total_ratings_given: 45,
      average_rating_received: 4.2,
      views_received: 2847,
      followers: 23,
      following: 31
    },
    moderation: {
      strikes: [
        {
          id: 'strike_1',
          type: 'spam',
          severity: 'minor',
          description: 'Posted promotional content in comments',
          issued_at: '2024-09-15T14:30:00Z',
          expires_at: '2024-12-15T14:30:00Z',
          issued_by: 'staff_mod_jane',
          status: 'active'
        }
      ],
      appeals_filed: 0,
      appeals_successful: 0,
      total_reports_made: 3,
      valid_reports_made: 2,
      total_reports_received: 1,
      valid_reports_received: 1
    }
  })

  const handleUserSearch = async (term: string) => {
    setSearchTerm(term)
    // TODO: Implement user search API
  }

  const handleIssueStrike = async (type: string, severity: string, description: string) => {
    try {
      // TODO: Implement strike API
      logInfo('Issuing strike:', { type, severity, description });
      setActionType(null)
    } catch (error) {
      logError('Failed to issue strike:', error);
    }
  }

  const handleAdjustReputation = async (change: number, reason: string) => {
    try {
      // TODO: Implement reputation adjustment API
      logInfo('Adjusting reputation:', { change, reason });
      setActionType(null)
    } catch (error) {
      logError('Failed to adjust reputation:', error);
    }
  }

  const handleChangeTrustLevel = async (newLevel: number, reason: string) => {
    try {
      // TODO: Implement trust level change API
      logInfo('Changing trust level:', { newLevel, reason });
      setActionType(null)
    } catch (error) {
      logError('Failed to change trust level:', error);
    }
  }

  const getTrustLevelName = (level: number) => {
    const names = ['New User', 'Verified User', 'Trusted Creator', 'Community Moderator', 'Staff Moderator']
    return names[level] || 'Unknown'
  }

  const getTrustLevelColor = (level: number) => {
    const colors = ['text-gray-600', 'text-blue-600', 'text-green-600', 'text-purple-600', 'text-red-600']
    return colors[level] || 'text-gray-600'
  }

  const getStrikeColor = (severity: string) => {
    switch (severity) {
      case 'minor': return 'text-yellow-600 bg-yellow-100'
      case 'moderate': return 'text-orange-600 bg-orange-100'
      case 'severe': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-600" />
          User Moderation Panel
        </h1>
      </div>

      {/* User Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search User
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleUserSearch(e.target.value)}
              placeholder="Enter username, email, or user ID..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* User Profile Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{userData.profile.display_name}</h2>
                  <p className="text-gray-600">@{userData.profile.username}</p>
                  <p className="text-sm text-gray-500">{userData.profile.email}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getTrustLevelColor(userData.profile.trust_level)} bg-opacity-10`}>
                  <Shield className="w-4 h-4" />
                  {getTrustLevelName(userData.profile.trust_level)}
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  Reputation: <span className="font-medium">{userData.profile.reputation_score}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Joined:</span>
                <div className="font-medium">
                  {new Date(userData.profile.account_created).toLocaleDateString()}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Last Active:</span>
                <div className="font-medium">
                  {new Date(userData.profile.last_active).toLocaleDateString()}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Works:</span>
                <div className="font-medium">{userData.stats.total_works}</div>
              </div>
              <div>
                <span className="text-gray-600">Comments:</span>
                <div className="font-medium">{userData.stats.total_comments}</div>
              </div>
            </div>
          </div>

          {/* Activity Stats */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Activity Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{userData.stats.total_works}</div>
                <div className="text-sm text-gray-600">Works Published</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{userData.stats.average_rating_received.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Avg Rating</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{userData.stats.views_received.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Views</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{userData.stats.followers}</div>
                <div className="text-sm text-gray-600">Followers</div>
              </div>
            </div>
          </div>

          {/* Moderation History */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Moderation History
            </h3>
            
            {userData.moderation.strikes.length > 0 ? (
              <div className="space-y-3">
                {userData.moderation.strikes.map((strike) => (
                  <div key={strike.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStrikeColor(strike.severity)}`}>
                            {strike.severity} {strike.type}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            strike.status === 'active' ? 'text-red-600 bg-red-100' : 'text-gray-600 bg-gray-100'
                          }`}>
                            {strike.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{strike.description}</p>
                        <div className="text-xs text-gray-500">
                          Issued by {strike.issued_by} on {new Date(strike.issued_at).toLocaleDateString()}
                          {strike.status === 'active' && (
                            <span> • Expires {new Date(strike.expires_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Shield className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No moderation history</p>
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Reports Made:</span>
                <div className="font-medium">{userData.moderation.total_reports_made}</div>
              </div>
              <div>
                <span className="text-gray-600">Valid Reports:</span>
                <div className="font-medium text-green-600">{userData.moderation.valid_reports_made}</div>
              </div>
              <div>
                <span className="text-gray-600">Reports Received:</span>
                <div className="font-medium">{userData.moderation.total_reports_received}</div>
              </div>
              <div>
                <span className="text-gray-600">Appeals Filed:</span>
                <div className="font-medium">{userData.moderation.appeals_filed}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Moderation Actions */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Moderation Actions</h3>
          
          <div className="space-y-3">
            <button
              onClick={() => setActionType('strike')}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Issue Strike
            </button>
            
            <button
              onClick={() => setActionType('reputation')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Star className="w-4 h-4" />
              Adjust Reputation
            </button>
            
            <button
              onClick={() => setActionType('trust_level')}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Change Trust Level
            </button>
          </div>

          {/* Action Modals would go here - simplified for this example */}
          {actionType && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h4 className="text-lg font-medium mb-4">
                  {actionType === 'strike' && 'Issue Strike'}
                  {actionType === 'reputation' && 'Adjust Reputation'}
                  {actionType === 'trust_level' && 'Change Trust Level'}
                </h4>
                
                <div className="space-y-4">
                  {actionType === 'strike' && (
                    <>
                      <select className="w-full p-2 border border-gray-300 rounded-md">
                        <option>Spam</option>
                        <option>Policy Violation</option>
                        <option>Community Guidelines</option>
                        <option>Copyright</option>
                        <option>Harassment</option>
                      </select>
                      <select className="w-full p-2 border border-gray-300 rounded-md">
                        <option>Minor</option>
                        <option>Moderate</option>
                        <option>Severe</option>
                      </select>
                      <textarea
                        placeholder="Description of violation..."
                        className="w-full p-2 border border-gray-300 rounded-md h-20"
                      />
                    </>
                  )}
                  
                  {actionType === 'reputation' && (
                    <>
                      <input
                        type="number"
                        placeholder="Reputation change (+/-)"
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                      <textarea
                        placeholder="Reason for adjustment..."
                        className="w-full p-2 border border-gray-300 rounded-md h-20"
                      />
                    </>
                  )}
                  
                  {actionType === 'trust_level' && (
                    <>
                      <select className="w-full p-2 border border-gray-300 rounded-md">
                        <option value={0}>New User</option>
                        <option value={1}>Verified User</option>
                        <option value={2}>Trusted Creator</option>
                        <option value={3}>Community Moderator</option>
                        <option value={4}>Staff Moderator</option>
                      </select>
                      <textarea
                        placeholder="Reason for change..."
                        className="w-full p-2 border border-gray-300 rounded-md h-20"
                      />
                    </>
                  )}
                </div>
                
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => setActionType(null)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (actionType === 'strike') handleIssueStrike('spam', 'minor', 'Test description')
                      if (actionType === 'reputation') handleAdjustReputation(-50, 'Test adjustment')
                      if (actionType === 'trust_level') handleChangeTrustLevel(0, 'Test change')
                    }}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}