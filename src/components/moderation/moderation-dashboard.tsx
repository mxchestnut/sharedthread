'use client'

import React, { useState, useEffect } from 'react'
import { 
import { logError } from '@/lib/error-logger';

  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  MessageSquare,
  Flag,
  User,
  TrendingUp
} from 'lucide-react'

interface ModerationQueueItem {
  id: string
  type: 'work' | 'comment' | 'profile' | 'collection'
  title: string
  author: string
  author_id: string
  author_trust_level: number
  content_preview: string
  submitted_at: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  flags: string[]
  spam_confidence: number
  previous_violations: number
}

interface ModerationStats {
  pending_items: number
  approved_today: number
  rejected_today: number
  average_review_time: number
  queue_health: 'good' | 'busy' | 'overloaded'
}

export function ModerationDashboard() {
  const [queueItems, setQueueItems] = useState<ModerationQueueItem[]>([])
  const [stats, setStats] = useState<ModerationStats | null>(null)
  const [selectedItem, setSelectedItem] = useState<ModerationQueueItem | null>(null)
  const [filter, setFilter] = useState<'all' | 'high_priority' | 'spam' | 'appeals'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadModerationData()
  }, [filter])

  const loadModerationData = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API calls
      const mockStats: ModerationStats = {
        pending_items: 23,
        approved_today: 147,
        rejected_today: 12,
        average_review_time: 8.5,
        queue_health: 'good'
      }

      const mockItems: ModerationQueueItem[] = [
        {
          id: '1',
          type: 'work',
          title: 'The Future of AI in Creative Writing',
          author: 'alex_writer',
          author_id: 'user_123',
          author_trust_level: 0,
          content_preview: 'In this comprehensive exploration of artificial intelligence...',
          submitted_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          priority: 'medium',
          flags: ['new_user'],
          spam_confidence: 0.15,
          previous_violations: 0
        },
        {
          id: '2',
          type: 'comment',
          title: 'Comment on "Modern Poetry Techniques"',
          author: 'poetry_fan',
          author_id: 'user_456',
          author_trust_level: 1,
          content_preview: 'This is amazing! Check out my website for more poetry tips...',
          submitted_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          priority: 'high',
          flags: ['suspicious_links', 'promotional_content'],
          spam_confidence: 0.72,
          previous_violations: 1
        },
        {
          id: '3',
          type: 'work',
          title: 'Climate Change Solutions for the 21st Century',
          author: 'eco_researcher',
          author_id: 'user_789',
          author_trust_level: 2,
          content_preview: 'Based on recent research from leading climate scientists...',
          submitted_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          priority: 'low',
          flags: ['expedited_review'],
          spam_confidence: 0.05,
          previous_violations: 0
        }
      ]

      setStats(mockStats)
      setQueueItems(mockItems)
    } catch (error) {
      logError('Failed to load moderation data:', error);
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (itemId: string) => {
    try {
      // TODO: Implement actual approval API
      await fetch(`/api/moderation/approve/${itemId}`, { method: 'POST' })
      setQueueItems(items => items.filter(item => item.id !== itemId))
      setSelectedItem(null)
    } catch (error) {
      logError('Failed to approve item:', error);
    }
  }

  const handleReject = async (itemId: string, reason: string) => {
    try {
      // TODO: Implement actual rejection API
      await fetch(`/api/moderation/reject/${itemId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })
      setQueueItems(items => items.filter(item => item.id !== itemId))
      setSelectedItem(null)
    } catch (error) {
      logError('Failed to reject item:', error);
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getSpamIndicator = (confidence: number) => {
    if (confidence > 0.7) return { color: 'text-red-600', level: 'High Risk' }
    if (confidence > 0.4) return { color: 'text-yellow-600', level: 'Medium Risk' }
    return { color: 'text-green-600', level: 'Low Risk' }
  }

  const getTrustLevelName = (level: number) => {
    const names = ['New User', 'Verified', 'Trusted', 'Community Mod', 'Staff']
    return names[level] || 'Unknown'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Moderation Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Review and moderate community content
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setFilter('high_priority')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'high_priority' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            High Priority
          </button>
          <button
            onClick={() => setFilter('spam')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'spam' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Spam Detection
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-gray-900">Pending Review</span>
            </div>
            <div className="text-2xl font-bold text-orange-600 mt-1">
              {stats.pending_items}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-900">Approved Today</span>
            </div>
            <div className="text-2xl font-bold text-green-600 mt-1">
              {stats.approved_today}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="font-medium text-gray-900">Rejected Today</span>
            </div>
            <div className="text-2xl font-bold text-red-600 mt-1">
              {stats.rejected_today}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">Avg Review Time</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              {stats.average_review_time}m
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Queue Items */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-medium text-gray-900">Review Queue</h2>
          
          {queueItems.length === 0 ? (
            <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
              <p className="text-gray-600">No items pending review right now.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {queueItems.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedItem?.id === item.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {item.type === 'work' && <MessageSquare className="w-4 h-4 text-blue-600" />}
                      {item.type === 'comment' && <MessageSquare className="w-4 h-4 text-green-600" />}
                      <span className="font-medium text-gray-900">{item.title}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(item.submitted_at).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {item.author} ({getTrustLevelName(item.author_trust_level)})
                    </div>
                    {item.previous_violations > 0 && (
                      <div className="flex items-center gap-1 text-yellow-600">
                        <AlertTriangle className="w-3 h-3" />
                        {item.previous_violations} violations
                      </div>
                    )}
                    <div className={`flex items-center gap-1 ${getSpamIndicator(item.spam_confidence).color}`}>
                      <Flag className="w-3 h-3" />
                      {getSpamIndicator(item.spam_confidence).level}
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-2">
                    {item.content_preview.substring(0, 150)}...
                  </p>

                  {item.flags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.flags.map((flag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {flag.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Item Details */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900">Item Details</h2>
          
          {selectedItem ? (
            <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">{selectedItem.title}</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Author: {selectedItem.author}</p>
                  <p>Trust Level: {getTrustLevelName(selectedItem.author_trust_level)}</p>
                  <p>Submitted: {new Date(selectedItem.submitted_at).toLocaleString()}</p>
                  <p>Type: {selectedItem.type}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Content Preview</h4>
                <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 max-h-40 overflow-y-auto">
                  {selectedItem.content_preview}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Analysis</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Spam Confidence:</span>
                    <span className={getSpamIndicator(selectedItem.spam_confidence).color}>
                      {Math.round(selectedItem.spam_confidence * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Previous Violations:</span>
                    <span>{selectedItem.previous_violations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Priority:</span>
                    <span className={getPriorityColor(selectedItem.priority)}>
                      {selectedItem.priority}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(selectedItem.id)}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => handleReject(selectedItem.id, 'Manual review rejection')}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>

              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" />
                View Full Content
              </button>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
              <Eye className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Select an item to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}