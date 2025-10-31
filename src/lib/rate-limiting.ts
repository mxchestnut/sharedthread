import { NextRequest, NextResponse } from 'next/server';
import { logError, logWarning } from '@/lib/error-logger';


// Redis interface for dependency injection
interface RedisClient {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  del(key: string): Promise<number>;
  get(key: string): Promise<string | null>;
  setex(key: string, seconds: number, value: string): Promise<string>;
  pipeline(): {
    incr(key: string): RedisClient;
    expire(key: string, seconds: number): RedisClient;
    exec(): Promise<[Error | null, unknown][] | null>;
  };
}

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator: (req: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  message?: string;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  totalRequests: number;
}

// Utility function to get client IP
export function getClientIP(req: NextRequest): string {
  return (
    req.headers.get('cf-connecting-ip') || // Cloudflare
    req.headers.get('x-real-ip') || // Nginx
    req.headers.get('x-forwarded-for')?.split(',')[0] || // Load balancer
    'unknown'
  );
}

// Mock Redis for development/testing
function createMockRedis(): RedisClient {
  const storage = new Map<string, { value: number; expiry: number }>();
  
  return {
    async incr(key: string): Promise<number> {
      const item = storage.get(key);
      const newValue = (item?.value || 0) + 1;
      storage.set(key, { value: newValue, expiry: item?.expiry || Date.now() + 60000 });
      return newValue;
    },
    async expire(key: string, seconds: number): Promise<number> {
      const item = storage.get(key);
      if (item) {
        storage.set(key, { ...item, expiry: Date.now() + seconds * 1000 });
        return 1;
      }
      return 0;
    },
    async del(key: string): Promise<number> {
      return storage.delete(key) ? 1 : 0;
    },
    async get(key: string): Promise<string | null> {
      const item = storage.get(key);
      if (!item || item.expiry < Date.now()) {
        storage.delete(key);
        return null;
      }
      return item.value.toString();
    },
    async setex(key: string, seconds: number, value: string): Promise<string> {
      storage.set(key, { value: parseInt(value) || 0, expiry: Date.now() + seconds * 1000 });
      return 'OK';
    },
    pipeline() {
      const commands: Array<() => Promise<unknown>> = [];
      return {
        incr: (key: string) => {
          commands.push(async () => {
            const item = storage.get(key);
            const newValue = (item?.value || 0) + 1;
            storage.set(key, { value: newValue, expiry: item?.expiry || Date.now() + 60000 });
            return newValue;
          });
          return this;
        },
        expire: (key: string, seconds: number) => {
          commands.push(async () => {
            const item = storage.get(key);
            if (item) {
              storage.set(key, { ...item, expiry: Date.now() + seconds * 1000 });
              return 1;
            }
            return 0;
          });
          return this;
        },
        exec: async () => {
          const results: [Error | null, unknown][] = [];
          for (const cmd of commands) {
            try {
              const result = await cmd();
              results.push([null, result]);
            } catch (error) {
              results.push([error as Error, null]);
            }
          }
          return results;
        }
      };
    }
  };
}

class RateLimiter {
  private redis: RedisClient;
  public readonly config: RateLimitConfig;

  constructor(config: RateLimitConfig, redis?: RedisClient) {
    this.config = config;
    // Use provided Redis client or mock for development
    this.redis = redis || createMockRedis();
  }

  async checkLimit(req: NextRequest): Promise<RateLimitResult> {
    const key = this.config.keyGenerator(req);
    const now = Date.now();
    const window = Math.floor(now / this.config.windowMs);
    const redisKey = `rate_limit:${key}:${window}`;

    try {
      // Use Redis pipeline for atomic operations
      const pipeline = this.redis.pipeline();
      pipeline.incr(redisKey);
      pipeline.expire(redisKey, Math.ceil(this.config.windowMs / 1000));
      
      const results = await pipeline.exec();
      const currentCount = results?.[0]?.[1] as number || 0;

      const resetTime = (window + 1) * this.config.windowMs;
      const remaining = Math.max(0, this.config.maxRequests - currentCount);

      return {
        success: currentCount <= this.config.maxRequests,
        remaining,
        resetTime,
        totalRequests: currentCount
      };
    } catch (error) {
      logError('Rate limiting error:', error);
      // Fail open - allow request if Redis is down
      return {
        success: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs,
        totalRequests: 1
      };
    }
  }

  async reset(req: NextRequest): Promise<void> {
    const key = this.config.keyGenerator(req);
    const now = Date.now();
    const window = Math.floor(now / this.config.windowMs);
    const redisKey = `rate_limit:${key}:${window}`;
    
    await this.redis.del(redisKey);
  }
}

// Pre-configured rate limiters for different endpoints
export const rateLimiters = {
  // General API rate limiting
  api: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    keyGenerator: (req) => {
      const ip = getClientIP(req);
      return `api:${ip}`;
    },
    message: 'Too many API requests, please try again later.'
  }),

  // Authentication endpoints (stricter)
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    keyGenerator: (req) => {
      const ip = getClientIP(req);
      return `auth:${ip}`;
    },
    message: 'Too many authentication attempts, please try again later.'
  }),

  // Content creation (moderate)
  content: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50,
    keyGenerator: (req) => {
      const userId = req.headers.get('x-user-id') || getClientIP(req);
      return `content:${userId}`;
    },
    message: 'Too many content creation requests, please try again later.'
  }),

  // File uploads (very strict)
  upload: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    keyGenerator: (req) => {
      const userId = req.headers.get('x-user-id') || getClientIP(req);
      return `upload:${userId}`;
    },
    message: 'Too many file uploads, please try again later.'
  }),

  // Search endpoints
  search: new RateLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 100,
    keyGenerator: (req) => {
      const userId = req.headers.get('x-user-id') || getClientIP(req);
      return `search:${userId}`;
    },
    message: 'Too many search requests, please try again later.'
  }),

  // Password reset (very strict)
  passwordReset: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    keyGenerator: (req) => {
      const ip = getClientIP(req);
      return `password_reset:${ip}`;
    },
    message: 'Too many password reset attempts, please try again later.'
  })
};

// Middleware function to apply rate limiting
export function withRateLimit(limiter: RateLimiter) {
  return async (req: NextRequest): Promise<NextResponse | null> => {
    const result = await limiter.checkLimit(req);

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: limiter.config.message || 'Too many requests',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limiter.config.maxRequests.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString(),
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }

    // Add rate limit headers to successful responses
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', limiter.config.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.resetTime.toString());

    return null; // Continue to next middleware
  };
}

// Advanced rate limiting with multiple tiers
export class AdaptiveRateLimiter {
  private limits: Map<string, RateLimiter>;
  private redis: RedisClient;

  constructor(redis?: RedisClient) {
    this.limits = new Map();
    this.redis = redis || createMockRedis();
  }

  // Get user tier based on reputation/subscription
  async getUserTier(userId: string): Promise<'free' | 'premium' | 'admin'> {
    try {
      const tierKey = `user_tier:${userId}`;
      const tier = await this.redis.get(tierKey);
      return (tier as 'free' | 'premium' | 'admin') || 'free';
    } catch {
      return 'free';
    }
  }

  // Apply different limits based on user tier
  async checkAdaptiveLimit(req: NextRequest, endpoint: string): Promise<RateLimitResult> {
    const userId = req.headers.get('x-user-id');
    const tier = userId ? await this.getUserTier(userId) : 'free';

    const tierLimits = {
      free: { windowMs: 15 * 60 * 1000, maxRequests: 100 },
      premium: { windowMs: 15 * 60 * 1000, maxRequests: 500 },
      admin: { windowMs: 15 * 60 * 1000, maxRequests: 10000 }
    };

    const config = tierLimits[tier];
    const limiterKey = `${endpoint}:${tier}`;

    if (!this.limits.has(limiterKey)) {
      this.limits.set(limiterKey, new RateLimiter({
        ...config,
        keyGenerator: (req) => {
          const identifier = userId || getClientIP(req);
          return `${endpoint}:${tier}:${identifier}`;
        }
      }, this.redis));
    }

    const limiter = this.limits.get(limiterKey)!;
    return await limiter.checkLimit(req);
  }
}

// DDoS protection with automatic IP blocking
export class DDoSProtection {
  private redis: RedisClient;
  private suspiciousIps: Set<string>;

  constructor(redis?: RedisClient) {
    this.redis = redis || createMockRedis();
    this.suspiciousIps = new Set();
  }

  async checkForDDoS(req: NextRequest): Promise<boolean> {
    const ip = getClientIP(req);
    
    // Check if IP is already blocked
    const blockedKey = `blocked_ip:${ip}`;
    const isBlocked = await this.redis.get(blockedKey);
    
    if (isBlocked) {
      return false; // Block the request
    }

    // Check request patterns
    const now = Date.now();
    const windowKey = `ddos_check:${ip}:${Math.floor(now / 60000)}`; // 1-minute windows
    
    const requestCount = await this.redis.incr(windowKey);
    await this.redis.expire(windowKey, 60);

    // If more than 1000 requests per minute, block IP for 1 hour
    if (requestCount > 1000) {
      await this.redis.setex(blockedKey, 3600, 'ddos_protection');
      
      // Log security event
      logWarning(`DDoS protection: Blocked IP ${ip} for excessive requests (${requestCount} req/min)`);
      
      return false;
    }

    // Mark as suspicious if over 500 requests per minute
    if (requestCount > 500) {
      this.suspiciousIps.add(ip);
    }

    return true; // Allow the request
  }

  async unblockIp(ip: string): Promise<void> {
    const blockedKey = `blocked_ip:${ip}`;
    await this.redis.del(blockedKey);
    this.suspiciousIps.delete(ip);
  }

  getSuspiciousIps(): string[] {
    return Array.from(this.suspiciousIps);
  }
}

// Export instances for use in middleware
export const adaptiveRateLimiter = new AdaptiveRateLimiter();
export const ddosProtection = new DDoSProtection();