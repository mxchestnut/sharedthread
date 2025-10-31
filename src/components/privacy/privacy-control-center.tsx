'use client'

import React, { useState } from 'react'
import { usePrivacy } from './privacy-provider'
import { cookieManager } from '@/lib/cookie-manager'
import { Shield, Eye, Download, Trash2, Settings, Info, CheckCircle, XCircle } from 'lucide-react'
import { logError } from '@/lib/error-logger';


export function PrivacyControlCenter() {
  const { settings, updateSettings } = usePrivacy()
  const [activeTab, setActiveTab] = useState<'preferences' | 'data' | 'transparency'>('preferences')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [preferences, setPreferences] = useState({
    analytics: settings?.analytics ?? false,
    performance: settings?.performance ?? false,
    preferences: settings?.preferences ?? false
  })

  const handleSavePreferences = () => {
    updateSettings(preferences)
  }

  const handleDataExport = async () => {
    try {
      const response = await fetch('/api/privacy/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `workShelf-data-export-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      logError('Failed to export data:', error);
    }
  }

  const handleDataDeletion = async () => {
    try {
      await fetch('/api/privacy/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
      setShowDeleteConfirm(false)
      // Redirect to account deletion confirmation
      window.location.href = '/account-deleted'
    } catch (error) {
      logError('Failed to delete data:', error);
    }
  }

  const cookieCategories = cookieManager.getCookieCategories()

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
          <Shield className="w-6 h-6 text-blue-600" />
          Privacy Control Center
        </h1>
        <p className="text-gray-600">
          Manage your privacy preferences and data with complete transparency
        </p>
      </div>

      {/* Current Status */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-5 h-5 text-blue-600" />
          <h3 className="font-medium text-blue-900">Privacy Status</h3>
        </div>
        <div className="text-sm text-blue-800 space-y-1">
          <p>✓ Consent given: {settings?.consentTimestamp ? new Date(settings.consentTimestamp).toLocaleDateString() : 'Not provided'}</p>
          <p>✓ Data collection: Minimal and transparent</p>
          <p>✓ Third-party sharing: None</p>
          <p>✓ Your control: Complete</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('preferences')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'preferences'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Cookie Preferences
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'data'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-2" />
            Your Data
          </button>
          <button
            onClick={() => setActiveTab('transparency')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'transparency'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Info className="w-4 h-4 inline mr-2" />
            Transparency
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Cookie Categories
              </h3>
              <div className="space-y-4">
                {cookieCategories.map((category) => (
                  <div
                    key={category.id}
                    className="border border-gray-200 rounded-lg p-4 bg-white"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">
                            {category.name}
                          </h4>
                          {category.essential && (
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                              Required
                            </span>
                          )}
                          {category.enabled && !category.essential && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                          {!category.enabled && !category.essential && (
                            <XCircle className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {category.description}
                        </p>
                      </div>
                      
                      {!category.essential && (
                        <label className="flex items-center ml-4">
                          <input
                            type="checkbox"
                            checked={preferences[category.id as keyof typeof preferences] || false}
                            onChange={(e) =>
                              setPreferences(prev => ({
                                ...prev,
                                [category.id]: e.target.checked
                              }))
                            }
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Enable</span>
                        </label>
                      )}
                    </div>
                    
                    {category.cookies.length > 0 && (
                      <details className="mt-2">
                        <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                          View {category.cookies.length} cookie{category.cookies.length !== 1 ? 's' : ''}
                        </summary>
                        <div className="mt-2 space-y-2">
                          {category.cookies.map((cookie, index) => (
                            <div key={index} className="text-xs bg-gray-50 rounded p-2 border">
                              <div className="font-medium text-gray-900">{cookie.name}</div>
                              <div className="text-gray-600 mt-1">{cookie.purpose}</div>
                              <div className="flex gap-4 mt-1 text-gray-500">
                                <span>Duration: {cookie.duration}</span>
                                <span>Type: {cookie.type}</span>
                                {cookie.secure && <span>✓ Secure</span>}
                                {cookie.httpOnly && <span>✓ HTTP Only</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleSavePreferences}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Save Preferences
              </button>
              <button
                onClick={() => setPreferences({
                  analytics: false,
                  performance: false,
                  preferences: false
                })}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Reset to Essential Only
              </button>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Your Data Rights
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Data Export</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Download all data we have about you in a portable format
                      </p>
                    </div>
                    <button
                      onClick={handleDataExport}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Export Data
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Account Deletion</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Permanently delete your account and all associated data
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                What Data We Collect
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <strong>Account Information:</strong> Email, username, profile picture (if provided)
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <strong>Content:</strong> Works you create, comments, ratings, collections
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <strong>Usage Data:</strong> Anonymous analytics (if enabled), error logs for debugging
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                    <div>
                      <strong>We DO NOT collect:</strong> Personal browsing history, data from other sites, precise location, or sell any data
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transparency' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Privacy Transparency Report
              </h3>
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Data Security</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>✓ All data encrypted in transit (TLS 1.3)</li>
                    <li>✓ All data encrypted at rest (AES-256)</li>
                    <li>✓ Regular security audits and updates</li>
                    <li>✓ Zero-knowledge authentication where possible</li>
                  </ul>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Third-Party Services</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>✓ Authentication: Self-hosted with secure OAuth providers</li>
                    <li>✓ Analytics: Self-hosted, no third-party tracking</li>
                    <li>✓ Hosting: Azure (Microsoft) with EU data residency</li>
                    <li>✓ CDN: Cloudflare (privacy-first configuration)</li>
                  </ul>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Data Retention</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Active accounts: Data retained while account is active</li>
                    <li>• Deleted accounts: All data permanently deleted within 30 days</li>
                    <li>• Analytics: Anonymous usage data retained for 90 days</li>
                    <li>• Logs: Security logs retained for 180 days</li>
                  </ul>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Your Rights (GDPR/CCPA)</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>✓ Right to access your data</li>
                    <li>✓ Right to correct inaccurate data</li>
                    <li>✓ Right to delete your data</li>
                    <li>✓ Right to data portability</li>
                    <li>✓ Right to object to processing</li>
                    <li>✓ Right to withdraw consent</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Account Deletion
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              This action cannot be undone. All your works, comments, and data will be permanently deleted within 30 days.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDataDeletion}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}