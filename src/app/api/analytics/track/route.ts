import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { logError } from '@/lib/error-logger';


interface AnalyticsEvent {
  event: string
  properties: Record<string, unknown>
  timestamp: string
  ip_hash: string
  session_id: string
}

/**
 * Privacy-First Analytics API
 * Collects minimal, anonymous usage data for platform improvement
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, properties } = body

    // Get anonymized IP (hash on server side)
    const headersList = await headers()
    const forwarded = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const ip = forwarded ? forwarded.split(',')[0] : realIp || 'unknown'
    
    // Hash IP for privacy (don't store actual IP)
    const ipHash = await hashString(ip)

    // Anonymize the event data
    const anonymizedEvent: AnalyticsEvent = {
      event: sanitizeEventName(event),
      properties: sanitizeProperties(properties),
      timestamp: new Date().toISOString(),
      ip_hash: ipHash,
      session_id: generateSessionId(request),
      // No user identification
    }

    // Log to internal analytics system (not third-party)
    await logAnalyticsEvent(anonymizedEvent)

    return NextResponse.json({ success: true })
  } catch (error) {
    logError('Analytics tracking error:', error);
    // Fail silently - analytics should never break the app
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

/**
 * Hash a string for privacy
 */
async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(input + process.env.ANALYTICS_SALT)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Generate anonymous session ID
 */
function generateSessionId(request: NextRequest): string {
  const userAgent = request.headers.get('user-agent') || ''
  const timestamp = Date.now()
  
  // Create a session ID that's unique but not personally identifiable
  return `session_${timestamp}_${userAgent.slice(0, 10).replace(/\W/g, '')}`
}

/**
 * Sanitize event names to prevent sensitive data leakage
 */
function sanitizeEventName(event: string): string {
  // Allow only predefined event names
  const allowedEvents = [
    'page_view',
    'work_created',
    'work_published',
    'comment_posted',
    'rating_given',
    'search_performed',
    'filter_applied',
    'export_requested',
    'settings_changed'
  ]

  return allowedEvents.includes(event) ? event : 'unknown_event'
}

/**
 * Sanitize properties to remove any personal information
 */
function sanitizeProperties(properties: unknown): Record<string, unknown> {
  if (!properties || typeof properties !== 'object') {
    return {}
  }

  const sanitized: Record<string, unknown> = {}
  const allowedFields = [
    'path',
    'screen_resolution',
    'timestamp',
    'user_agent',
    'referrer',
    'search_term_length', // length, not actual term
    'filter_type',
    'work_type',
    'rating_value',
    'page_load_time',
    'error_type'
  ]

  for (const [key, value] of Object.entries(properties as Record<string, unknown>)) {
    if (allowedFields.includes(key)) {
      // Additional sanitization for specific fields
      if (key === 'path') {
        sanitized[key] = sanitizePath(value as string)
      } else if (key === 'user_agent') {
        sanitized[key] = sanitizeUserAgent(value as string)
      } else if (key === 'search_term_length') {
        sanitized[key] = typeof value === 'string' ? value.length : 0
      } else {
        sanitized[key] = value
      }
    }
  }

  return sanitized
}

/**
 * Anonymize URL paths
 */
function sanitizePath(path: string): string {
  if (!path) return 'unknown'
  
  return path
    .replace(/\/users\/[^\/]+/g, '/users/:id')
    .replace(/\/works\/[^\/]+/g, '/works/:id')
    .replace(/\/collections\/[^\/]+/g, '/collections/:id')
    .replace(/\?.*$/, '') // Remove query parameters
    .slice(0, 100) // Limit length
}

/**
 * Sanitize user agent to remove identifying information
 */
function sanitizeUserAgent(userAgent: string): string {
  if (!userAgent) return 'unknown'
  
  // Extract only browser family and OS family (no versions)
  const browserMatch = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)/i)
  const osMatch = userAgent.match(/(Windows|Mac|Linux|iOS|Android)/i)
  
  const browser = browserMatch ? browserMatch[1] : 'unknown'
  const os = osMatch ? osMatch[1] : 'unknown'
  
  return `${browser}_${os}`
}

/**
 * Log analytics event to internal system
 */
async function logAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
  // In a real implementation, this would:
  // 1. Store in a privacy-focused analytics database
  // 2. Aggregate data for insights
  // 3. Automatically purge after retention period
  
  // For now, just log to console in development
  if (process.env.NODE_ENV === 'development') {
    // console.log('Analytics Event:', JSON.stringify(event, null, 2)); // Migrated: Use logInfo if needed
  }
  
  // TODO: Implement actual storage
  // Example with a privacy-focused analytics service:
  // await analyticsDB.insert('events', event)
}