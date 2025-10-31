import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { logError } from '@/lib/error-logger';


interface ErrorLog {
  message: string
  stack?: string
  timestamp: string
  ip_hash: string
  session_id: string
  user_agent: string
}

/**
 * Privacy-First Error Tracking API
 * Collects anonymous error data for debugging and improvement
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, stack } = body

    // Validate input
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid error data' }, { status: 400 })
    }

    // Get anonymized IP (hash on server side)
    const headersList = await headers()
    const forwarded = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const ip = forwarded ? forwarded.split(',')[0] : realIp || 'unknown'
    
    // Hash IP for privacy (don't store actual IP)
    const ipHash = await hashString(ip)

    // Create sanitized error log
    const errorLog: ErrorLog = {
      message: sanitizeErrorMessage(message),
      stack: stack ? sanitizeStackTrace(stack) : undefined,
      timestamp: new Date().toISOString(),
      ip_hash: ipHash,
      session_id: generateSessionId(request),
      user_agent: sanitizeUserAgent(request.headers.get('user-agent') || ''),
    }

    // Log to internal error tracking system
    await logError(errorLog)

    return NextResponse.json({ success: true })
  } catch (error) {
    logError('Error tracking error:', error);
    // Fail silently - error tracking should never break the app
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
 * Sanitize error message to remove any personal information
 */
function sanitizeErrorMessage(message: string): string {
  if (!message) return 'Unknown error'
  
  return message
    .replace(/\/users\/[^\/\s]+/g, '/users/:id')
    .replace(/\/works\/[^\/\s]+/g, '/works/:id')
    .replace(/\/collections\/[^\/\s]+/g, '/collections/:id')
    .replace(/email:\s*[^\s]+/gi, 'email: [redacted]')
    .replace(/token:\s*[^\s]+/gi, 'token: [redacted]')
    .replace(/password:\s*[^\s]+/gi, 'password: [redacted]')
    .slice(0, 500) // Limit length
}

/**
 * Sanitize stack trace to remove sensitive paths and personal data
 */
function sanitizeStackTrace(stack: string): string {
  if (!stack) return ''
  
  return stack
    .split('\n')
    .map(line => {
      // Remove absolute file paths
      return line.replace(/\/[^\s]*\//g, '/')
        .replace(/\/users\/[^\/\s]+/g, '/users/:id')
        .replace(/\/works\/[^\/\s]+/g, '/works/:id')
        .replace(/\/collections\/[^\/\s]+/g, '/collections/:id')
    })
    .slice(0, 10) // Limit to first 10 lines
    .join('\n')
    .slice(0, 1000) // Limit total length
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
 * Log error to internal system
 */
async function logError(errorLog: ErrorLog): Promise<void> {
  // In a real implementation, this would:
  // 1. Store in an error tracking database
  // 2. Alert developers for critical errors
  // 3. Aggregate for debugging insights
  // 4. Automatically purge after retention period
  
  // For now, just log to console in development
  if (process.env.NODE_ENV === 'development') {
    // console.log('Error Log:', JSON.stringify(errorLog, null, 2)); // Migrated: Use logInfo if needed
  }
  
  // TODO: Implement actual storage and alerting
  // Example with an error tracking service:
  // await errorDB.insert('errors', errorLog)
  // if (isCriticalError(errorLog)) {
  //   await alertDevelopers(errorLog)
  // }
}