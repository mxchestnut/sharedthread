import { logWarning } from '@/lib/error-logger';

/**
 * Ethical Cookie Management System
 * Implements privacy-first cookie handling with user consent
 */

export interface CookieCategory {
  id: string
  name: string
  description: string
  essential: boolean
  enabled: boolean
  cookies: CookieDefinition[]
}

export interface CookieDefinition {
  name: string
  purpose: string
  duration: string
  type: 'session' | 'persistent'
  secure: boolean
  httpOnly: boolean
  sameSite: 'strict' | 'lax' | 'none'
}

export interface PrivacySettings {
  analytics: boolean
  performance: boolean
  preferences: boolean
  consentTimestamp: string
  consentVersion: string
}

export class EthicalCookieManager {
  private readonly CONSENT_COOKIE = 'workShelf_privacy_consent'
  private readonly CONSENT_VERSION = '1.0'
  private settings: PrivacySettings | null = null
  
  constructor() {
    this.loadSettings()
  }
  
  /**
   * Cookie categories with full transparency
   */
  getCookieCategories(): CookieCategory[] {
    return [
      {
        id: 'essential',
        name: 'Essential Cookies',
        description: 'Required for basic functionality, security, and authentication. Cannot be disabled.',
        essential: true,
        enabled: true,
        cookies: [
          {
            name: 'next-auth.session-token',
            purpose: 'Maintains your login session securely',
            duration: '30 days',
            type: 'persistent',
            secure: true,
            httpOnly: true,
            sameSite: 'lax'
          },
          {
            name: 'next-auth.csrf-token',
            purpose: 'Prevents cross-site request forgery attacks',
            duration: 'Session',
            type: 'session',
            secure: true,
            httpOnly: true,
            sameSite: 'strict'
          },
          {
            name: 'workShelf_privacy_consent',
            purpose: 'Remembers your privacy preferences',
            duration: '1 year',
            type: 'persistent',
            secure: true,
            httpOnly: false,
            sameSite: 'strict'
          }
        ]
      },
      {
        id: 'preferences',
        name: 'Preference Cookies',
        description: 'Remember your choices like theme, language, and layout preferences.',
        essential: false,
        enabled: this.settings?.preferences ?? false,
        cookies: [
          {
            name: 'workShelf_theme',
            purpose: 'Remembers your preferred color theme (light/dark)',
            duration: '1 year',
            type: 'persistent',
            secure: true,
            httpOnly: false,
            sameSite: 'strict'
          },
          {
            name: 'workShelf_language',
            purpose: 'Remembers your preferred language setting',
            duration: '1 year',
            type: 'persistent',
            secure: true,
            httpOnly: false,
            sameSite: 'strict'
          }
        ]
      },
      {
        id: 'performance',
        name: 'Performance Cookies',
        description: 'Help us understand how the site performs and identify issues.',
        essential: false,
        enabled: this.settings?.performance ?? false,
        cookies: [
          {
            name: 'workShelf_performance',
            purpose: 'Tracks page load times and errors (no personal data)',
            duration: '7 days',
            type: 'persistent',
            secure: true,
            httpOnly: false,
            sameSite: 'strict'
          }
        ]
      },
      {
        id: 'analytics',
        name: 'Analytics Cookies',
        description: 'Anonymous usage patterns to improve the platform (aggregated data only).',
        essential: false,
        enabled: this.settings?.analytics ?? false,
        cookies: [
          {
            name: 'workShelf_analytics',
            purpose: 'Anonymous usage statistics (no personal identification)',
            duration: '30 days',
            type: 'persistent',
            secure: true,
            httpOnly: false,
            sameSite: 'strict'
          }
        ]
      }
    ]
  }
  
  /**
   * Load user's privacy settings from cookie
   */
  private loadSettings(): void {
    if (typeof window === 'undefined') return
    
    try {
      const consentCookie = this.getCookie(this.CONSENT_COOKIE)
      if (consentCookie) {
        this.settings = JSON.parse(consentCookie)
      }
    } catch (error) {
      logWarning('Failed to load privacy settings:', error);
      this.settings = null
    }
  }
  
  /**
   * Save user's privacy preferences
   */
  saveSettings(settings: Omit<PrivacySettings, 'consentTimestamp' | 'consentVersion'>): void {
    const fullSettings: PrivacySettings = {
      ...settings,
      consentTimestamp: new Date().toISOString(),
      consentVersion: this.CONSENT_VERSION
    }
    
    this.settings = fullSettings
    
    // Save to cookie (secure, 1 year expiry)
    this.setCookie(
      this.CONSENT_COOKIE, 
      JSON.stringify(fullSettings), 
      365 * 24 * 60 * 60 * 1000 // 1 year in milliseconds
    )
    
    // Apply settings immediately
    this.applySettings()
    
    // Log consent for compliance
    this.logConsent(fullSettings)
  }
  
  /**
   * Get current privacy settings
   */
  getSettings(): PrivacySettings | null {
    return this.settings
  }
  
  /**
   * Check if user has given consent
   */
  hasConsent(): boolean {
    return this.settings !== null
  }
  
  /**
   * Check if user needs to update consent (version change)
   */
  needsConsentUpdate(): boolean {
    return this.settings?.consentVersion !== this.CONSENT_VERSION
  }
  
  /**
   * Apply privacy settings (enable/disable features)
   */
  private applySettings(): void {
    if (!this.settings) return
    
    // Enable/disable analytics
    if (this.settings.analytics) {
      this.enableAnalytics()
    } else {
      this.disableAnalytics()
    }
    
    // Enable/disable performance monitoring
    if (this.settings.performance) {
      this.enablePerformanceTracking()
    } else {
      this.disablePerformanceTracking()
    }
    
    // Apply preference cookies
    if (!this.settings.preferences) {
      this.clearPreferenceCookies()
    }
  }
  
  /**
   * Enable anonymous analytics
   */
  private enableAnalytics(): void {
    // Set analytics cookie
    this.setCookie('workShelf_analytics', 'enabled', 30 * 24 * 60 * 60 * 1000) // 30 days
    
    // Initialize privacy-friendly analytics
    if (typeof window !== 'undefined') {
      window.workShelfAnalytics = {
        enabled: true,
        trackPageView: (path: string) => {
          // Track page views without personal data
          this.trackEvent('page_view', { path: this.anonymizePath(path) })
        },
        trackEvent: (event: string, properties?: Record<string, unknown>) => {
          this.trackEvent(event, properties)
        }
      }
    }
  }
  
  /**
   * Disable analytics
   */
  private disableAnalytics(): void {
    this.deleteCookie('workShelf_analytics')
    
    if (typeof window !== 'undefined') {
      window.workShelfAnalytics = { enabled: false }
    }
  }
  
  /**
   * Enable performance tracking
   */
  private enablePerformanceTracking(): void {
    this.setCookie('workShelf_performance', 'enabled', 7 * 24 * 60 * 60 * 1000) // 7 days
    
    // Monitor performance metrics
    if (typeof window !== 'undefined') {
      // Track load times
      window.addEventListener('load', () => {
        const loadTime = performance.now()
        this.trackMetric('page_load_time', loadTime)
      })
      
      // Track errors
      window.addEventListener('error', (event) => {
        this.trackError(event.error)
      })
    }
  }
  
  /**
   * Disable performance tracking
   */
  private disablePerformanceTracking(): void {
    this.deleteCookie('workShelf_performance')
  }
  
  /**
   * Clear preference cookies
   */
  private clearPreferenceCookies(): void {
    this.deleteCookie('workShelf_theme')
    this.deleteCookie('workShelf_language')
  }
  
  /**
   * Track anonymous event
   */
  private trackEvent(event: string, properties?: Record<string, unknown>): void {
    if (!this.settings?.analytics) return
    
    // Send to internal analytics (no third parties)
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        properties: {
          ...properties,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          screen_resolution: `${screen.width}x${screen.height}`,
          // No personal identifiers
        }
      })
    }).catch(() => {
      // Fail silently - privacy analytics should never break the app
    })
  }
  
  /**
   * Track performance metric
   */
  private trackMetric(metric: string, value: number): void {
    if (!this.settings?.performance) return
    
    fetch('/api/analytics/metric', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric,
        value,
        timestamp: new Date().toISOString()
      })
    }).catch(() => {
      // Fail silently
    })
  }
  
  /**
   * Track error for debugging
   */
  private trackError(error: Error): void {
    if (!this.settings?.performance) return
    
    fetch('/api/analytics/error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
        // No user information included
      })
    }).catch(() => {
      // Fail silently
    })
  }
  
  /**
   * Anonymize URL paths (remove IDs, personal info)
   */
  private anonymizePath(path: string): string {
    return path
      .replace(/\/users\/[^\/]+/g, '/users/:id')
      .replace(/\/works\/[^\/]+/g, '/works/:id')
      .replace(/\/collections\/[^\/]+/g, '/collections/:id')
      .replace(/\?.*$/, '') // Remove query parameters
  }
  
  /**
   * Log consent for compliance audits
   */
  private logConsent(settings: PrivacySettings): void {
    fetch('/api/privacy/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        settings,
        user_agent: navigator.userAgent,
        ip_hash: 'server_side_only', // IP is hashed server-side
        timestamp: settings.consentTimestamp
      })
    }).catch(() => {
      // Fail silently
    })
  }
  
  /**
   * Utility methods for cookie handling
   */
  private setCookie(name: string, value: string, maxAge: number): void {
    if (typeof document === 'undefined') return
    
    const cookie = [
      `${name}=${encodeURIComponent(value)}`,
      `Max-Age=${Math.floor(maxAge / 1000)}`,
      'Path=/',
      'Secure',
      'SameSite=Strict'
    ].join('; ')
    
    document.cookie = cookie
  }
  
  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null
    
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift()
      return cookieValue ? decodeURIComponent(cookieValue) : null
    }
    
    return null
  }
  
  private deleteCookie(name: string): void {
    if (typeof document === 'undefined') return
    
    document.cookie = `${name}=; Max-Age=0; Path=/; Secure; SameSite=Strict`
  }
}

// Global instance
export const cookieManager = new EthicalCookieManager()

// Type declarations for global analytics
declare global {
  interface Window {
    workShelfAnalytics?: {
      enabled: boolean
      trackPageView?: (path: string) => void
      trackEvent?: (event: string, properties?: Record<string, unknown>) => void
    }
  }
}