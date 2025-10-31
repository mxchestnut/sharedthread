import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { logError } from '@/lib/error-logger';


interface PerformanceMetric {
  metric: string
  value: number
  timestamp: string
  ip_hash: string
  session_id: string
}

/**
 * Privacy-First Performance Monitoring API
 * Collects anonymous performance data for platform optimization
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { metric, value } = body

    // Validate input
    if (!metric || typeof value !== 'number') {
      return NextResponse.json({ error: 'Invalid metric data' }, { status: 400 })
    }

    // Get anonymized IP (hash on server side)
    const headersList = await headers()
    const forwarded = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const ip = forwarded ? forwarded.split(',')[0] : realIp || 'unknown'
    
    // Hash IP for privacy (don't store actual IP)
    const ipHash = await hashString(ip)

    // Create performance metric record
    const performanceData: PerformanceMetric = {
      metric: sanitizeMetricName(metric),
      value: sanitizeMetricValue(value),
      timestamp: new Date().toISOString(),
      ip_hash: ipHash,
      session_id: generateSessionId(request),
    }

    // Log to internal performance monitoring system
    await logPerformanceMetric(performanceData)

    return NextResponse.json({ success: true })
  } catch (error) {
    logError('Performance tracking error:', error);
    // Fail silently - performance monitoring should never break the app
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
 * Sanitize metric names to prevent sensitive data leakage
 */
function sanitizeMetricName(metric: string): string {
  // Allow only predefined metric names
  const allowedMetrics = [
    'page_load_time',
    'first_contentful_paint',
    'largest_contentful_paint',
    'cumulative_layout_shift',
    'first_input_delay',
    'time_to_interactive',
    'dom_content_loaded',
    'api_response_time',
    'bundle_size',
    'memory_usage'
  ]

  return allowedMetrics.includes(metric) ? metric : 'unknown_metric'
}

/**
 * Sanitize metric values to ensure they're reasonable
 */
function sanitizeMetricValue(value: number): number {
  // Ensure value is a positive number within reasonable bounds
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return 0
  }
  
  // Cap extremely large values (likely errors)
  const MAX_VALUE = 300000 // 5 minutes in milliseconds
  return Math.min(value, MAX_VALUE)
}

/**
 * Log performance metric to internal system
 */
async function logPerformanceMetric(metric: PerformanceMetric): Promise<void> {
  // In a real implementation, this would:
  // 1. Store in a performance monitoring database
  // 2. Aggregate data for insights and alerts
  // 3. Automatically purge after retention period
  
  // For now, just log to console in development
  if (process.env.NODE_ENV === 'development') {
    // console.log('Performance Metric:', JSON.stringify(metric, null, 2)); // Migrated: Use logInfo if needed
  }
  
  // TODO: Implement actual storage
  // Example with a performance monitoring service:
  // await performanceDB.insert('metrics', metric)
}