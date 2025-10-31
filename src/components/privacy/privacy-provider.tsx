'use client'

import React, { createContext, useContext, useState } from 'react'
import { cookieManager, PrivacySettings } from '@/lib/cookie-manager'

interface PrivacyContextType {
  settings: PrivacySettings | null
  hasConsent: boolean
  needsConsentUpdate: boolean
  updateSettings: (settings: Omit<PrivacySettings, 'consentTimestamp' | 'consentVersion'>) => void
  showConsentBanner: boolean
  dismissConsentBanner: () => void
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined)

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  // Initialize state from cookie manager (client-side only)
  const [state, setState] = useState(() => {
    if (typeof window === 'undefined') {
      return {
        settings: null,
        hasConsent: false,
        needsConsentUpdate: false,
        showConsentBanner: false
      }
    }
    
    const currentSettings = cookieManager.getSettings()
    const hasConsentValue = cookieManager.hasConsent()
    const needsUpdateValue = cookieManager.needsConsentUpdate()
    
    return {
      settings: currentSettings,
      hasConsent: hasConsentValue,
      needsConsentUpdate: needsUpdateValue,
      showConsentBanner: !hasConsentValue || needsUpdateValue
    }
  })

  const updateSettings = (newSettings: Omit<PrivacySettings, 'consentTimestamp' | 'consentVersion'>) => {
    cookieManager.saveSettings(newSettings)
    
    const updatedSettings = cookieManager.getSettings()
    setState({
      settings: updatedSettings,
      hasConsent: true,
      needsConsentUpdate: false,
      showConsentBanner: false
    })
  }

  const dismissConsentBanner = () => {
    // Accept essential cookies only
    updateSettings({
      analytics: false,
      performance: false,
      preferences: false
    })
  }

  return (
    <PrivacyContext.Provider
      value={{
        settings: state.settings,
        hasConsent: state.hasConsent,
        needsConsentUpdate: state.needsConsentUpdate,
        updateSettings,
        showConsentBanner: state.showConsentBanner,
        dismissConsentBanner
      }}
    >
      {children}
    </PrivacyContext.Provider>
  )
}

export function usePrivacy() {
  const context = useContext(PrivacyContext)
  if (context === undefined) {
    throw new Error('usePrivacy must be used within a PrivacyProvider')
  }
  return context
}