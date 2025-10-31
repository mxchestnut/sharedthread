/**
 * Simple in-memory rate limiter for auth endpoints
 * Industry standard: 5-10 attempts per 15 minutes per IP
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (will reset on server restart)
const store = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetTime) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000); // 5 minutes

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (usually IP address)
 * @param maxAttempts - Maximum attempts allowed (default: 5)
 * @param windowMs - Time window in milliseconds (default: 15 minutes)
 * @returns Rate limit result with success status and metadata
 */
export function rateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(identifier);

  // No entry exists or window expired - create new entry
  if (!entry || now > entry.resetTime) {
    const resetTime = now + windowMs;
    store.set(identifier, { count: 1, resetTime });
    
    return {
      success: true,
      limit: maxAttempts,
      remaining: maxAttempts - 1,
      reset: resetTime,
    };
  }

  // Entry exists and window is still valid
  if (entry.count < maxAttempts) {
    entry.count++;
    
    return {
      success: true,
      limit: maxAttempts,
      remaining: maxAttempts - entry.count,
      reset: entry.resetTime,
    };
  }

  // Rate limit exceeded
  return {
    success: false,
    limit: maxAttempts,
    remaining: 0,
    reset: entry.resetTime,
  };
}

/**
 * Get client IP address from request headers
 * Checks multiple headers for proxy/load balancer compatibility
 */
export function getClientIP(request: Request): string {
  const headers = request.headers;
  
  // Check common proxy headers
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }

  const realIP = headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Cloudflare
  const cfConnectingIP = headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fastly
  const fastlyClientIP = headers.get('fastly-client-ip');
  if (fastlyClientIP) {
    return fastlyClientIP;
  }

  // Default fallback
  return 'unknown';
}

/**
 * Reset rate limit for a specific identifier
 * Useful for clearing rate limits after successful login
 */
export function resetRateLimit(identifier: string): void {
  store.delete(identifier);
}
