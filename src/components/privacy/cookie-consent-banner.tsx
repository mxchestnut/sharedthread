'use client'

import React, { useState } from 'react'
import { usePrivacy } from './privacy-provider'
import { cookieManager } from '@/lib/cookie-manager'
import { X, Shield, Info, Settings } from 'lucide-react'

export function CookieConsentBanner() {
  const { showConsentBanner, updateSettings, dismissConsentBanner } = usePrivacy()
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState({
    analytics: false,
    performance: false,
    preferences: false
  })

  if (!showConsentBanner) {
    return null
  }

  const handleAcceptAll = () => {
    updateSettings({
      analytics: true,
      performance: true,
      preferences: true
    })
  }

  const handleAcceptSelected = () => {
    updateSettings(preferences)
  }

  const handleRejectAll = () => {
    dismissConsentBanner()
  }

  const cookieCategories = cookieManager.getCookieCategories()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto p-4">
        {!showDetails ? (
          /* Simple Banner */
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-start gap-3 flex-1">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900 mb-1">
                  We respect your privacy
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  We use cookies to provide essential functionality and improve your experience. 
                  You can choose which cookies to accept.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={() => setShowDetails(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              >
                <Settings className="w-4 h-4" />
                Customize
              </button>
              
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Essential Only
              </button>
              
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          /* Detailed Settings */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Cookie Preferences
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {cookieCategories.map((category) => (
                <div
                  key={category.id}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">
                          {category.name}
                        </h4>
                        {category.essential && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                            Required
                          </span>
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
                      <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        View {category.cookies.length} cookie{category.cookies.length !== 1 ? 's' : ''}
                      </summary>
                      <div className="mt-2 space-y-2">
                        {category.cookies.map((cookie, index) => (
                          <div key={index} className="text-xs bg-white rounded p-2 border">
                            <div className="font-medium text-gray-900">{cookie.name}</div>
                            <div className="text-gray-600 mt-1">{cookie.purpose}</div>
                            <div className="flex gap-4 mt-1 text-gray-500">
                              <span>Duration: {cookie.duration}</span>
                              <span>Type: {cookie.type}</span>
                              {cookie.secure && <span>Secure</span>}
                              {cookie.httpOnly && <span>HTTP Only</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Essential Only
              </button>
              
              <button
                onClick={handleAcceptSelected}
                className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex-1 sm:flex-none"
              >
                Save Preferences
              </button>
              
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
              >
                Accept All
              </button>
            </div>
            
            <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
              <p>
                Learn more about our privacy practices in our{' '}
                <a href="/privacy" className="text-blue-600 hover:text-blue-800 underline">
                  Privacy Policy
                </a>
                . You can change these preferences anytime in your account settings.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}