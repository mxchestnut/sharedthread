import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Security headers configuration
export const securityHeaders = {
  // Prevent clickjacking attacks
  'X-Frame-Options': 'DENY',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Enable XSS protection (legacy, but still useful)
  'X-XSS-Protection': '1; mode=block',
  
  // Enforce HTTPS (only in production)
  'Strict-Transport-Security': process.env.NODE_ENV === 'production' 
    ? 'max-age=63072000; includeSubDomains; preload' 
    : '',
    
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "media-src 'self' https:",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "upgrade-insecure-requests"
  ].join('; '),
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy (formerly Feature Policy)
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()'
  ].join(', '),
  
  // Cross-Origin policies
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin'
};

// Development-specific relaxed headers
export const developmentHeaders = {
  ...securityHeaders,
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: http: blob:",
    "connect-src 'self' http://localhost:* ws://localhost:*",
    "frame-ancestors 'none'",
    "form-action 'self'"
  ].join('; '),
  'Strict-Transport-Security': '', // Disable HSTS in development
  'Cross-Origin-Embedder-Policy': '', // Relax for dev tools
  'Cross-Origin-Opener-Policy': '', // Relax for dev tools
};

// Apply security headers to response
export function applySecurityHeaders(response: NextResponse): NextResponse {
  const headers = process.env.NODE_ENV === 'development' 
    ? developmentHeaders 
    : securityHeaders;

  Object.entries(headers).forEach(([key, value]) => {
    if (value) { // Only set non-empty values
      response.headers.set(key, value);
    }
  });

  return response;
}

// CSRF Protection
export class CSRFProtection {
  private static readonly TOKEN_LENGTH = 32;
  private static readonly TOKEN_HEADER = 'x-csrf-token';
  private static readonly TOKEN_COOKIE = 'csrf-token';
  private static readonly TOKEN_EXPIRY = 1000 * 60 * 60 * 24; // 24 hours

  // Generate a cryptographically secure CSRF token
  static generateToken(): string {
    return crypto.randomBytes(this.TOKEN_LENGTH).toString('hex');
  }

  // Set CSRF token in cookie
  static setTokenCookie(response: NextResponse, token?: string): string {
    const csrfToken = token || this.generateToken();
    
    response.cookies.set(this.TOKEN_COOKIE, csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: this.TOKEN_EXPIRY / 1000,
      path: '/'
    });

    return csrfToken;
  }

  // Get CSRF token from cookie
  static getTokenFromCookie(req: NextRequest): string | null {
    return req.cookies.get(this.TOKEN_COOKIE)?.value || null;
  }

  // Get CSRF token from header
  static getTokenFromHeader(req: NextRequest): string | null {
    return req.headers.get(this.TOKEN_HEADER);
  }

  // Get CSRF token from request body (for form submissions)
  static getTokenFromBody(body: Record<string, unknown>): string | null {
    return (body._token as string) || null;
  }

  // Validate CSRF token
  static validateToken(req: NextRequest, bodyToken?: string): boolean {
    const cookieToken = this.getTokenFromCookie(req);
    const headerToken = this.getTokenFromHeader(req);
    const formToken = bodyToken;

    if (!cookieToken) {
      return false; // No token in cookie
    }

    // Check header token first (for API requests)
    if (headerToken && this.constantTimeCompare(cookieToken, headerToken)) {
      return true;
    }

    // Check form token (for form submissions)
    if (formToken && this.constantTimeCompare(cookieToken, formToken)) {
      return true;
    }

    return false;
  }

  // Constant-time string comparison to prevent timing attacks
  private static constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  // Middleware to protect against CSRF attacks
  static middleware() {
    return async (req: NextRequest): Promise<NextResponse | null> => {
      const method = req.method.toUpperCase();

      // Skip CSRF protection for safe methods
      if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
        return null; // Continue to next middleware
      }

      // Skip for API routes that use proper authentication
      if (req.nextUrl.pathname.startsWith('/api/auth/')) {
        return null; // Let NextAuth handle its own CSRF protection
      }

      // Validate CSRF token for state-changing requests
      let bodyToken: string | undefined;
      
      // Try to parse body for form submissions
      if (req.headers.get('content-type')?.includes('application/x-www-form-urlencoded')) {
        try {
          const formData = await req.formData();
          bodyToken = formData.get('_token') as string;
        } catch {
          // Ignore parsing errors for now
        }
      }

      if (!this.validateToken(req, bodyToken)) {
        return NextResponse.json(
          { 
            error: 'Invalid CSRF token',
            code: 'CSRF_TOKEN_MISMATCH'
          },
          { status: 403 }
        );
      }

      return null; // Continue to next middleware
    };
  }
}

// Session security utilities
export class SessionSecurity {
  private static readonly SESSION_TIMEOUT = 1000 * 60 * 60 * 8; // 8 hours
  private static readonly REMEMBER_ME_TIMEOUT = 1000 * 60 * 60 * 24 * 30; // 30 days

  // Generate secure session ID
  static generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Validate session timing
  static isSessionValid(
    createdAt: number, 
    lastActivity: number, 
    rememberMe = false
  ): boolean {
    const now = Date.now();
    const timeout = rememberMe ? this.REMEMBER_ME_TIMEOUT : this.SESSION_TIMEOUT;
    
    // Check if session has expired
    if (now - lastActivity > timeout) {
      return false;
    }

    // For security, force re-authentication after 24 hours regardless
    if (now - createdAt > 1000 * 60 * 60 * 24) {
      return false;
    }

    return true;
  }

  // Generate fingerprint for additional security
  static generateFingerprint(req: NextRequest): string {
    const userAgent = req.headers.get('user-agent') || '';
    const acceptLanguage = req.headers.get('accept-language') || '';
    const acceptEncoding = req.headers.get('accept-encoding') || '';
    
    const fingerprint = `${userAgent}:${acceptLanguage}:${acceptEncoding}`;
    
    return crypto
      .createHash('sha256')
      .update(fingerprint)
      .digest('hex')
      .substring(0, 16); // Use first 16 chars for storage efficiency
  }

  // Validate session fingerprint
  static validateFingerprint(req: NextRequest, storedFingerprint: string): boolean {
    const currentFingerprint = this.generateFingerprint(req);
    return currentFingerprint === storedFingerprint;
  }
}

// Rate limiting for authentication endpoints
export class AuthRateLimit {
  private static attempts = new Map<string, { count: number; lastAttempt: number; blocked: boolean }>();
  private static readonly MAX_ATTEMPTS = 5;
  private static readonly BLOCK_DURATION = 1000 * 60 * 15; // 15 minutes
  private static readonly ATTEMPT_WINDOW = 1000 * 60 * 5; // 5 minutes

  static checkRateLimit(identifier: string): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    const attempt = this.attempts.get(identifier);

    if (!attempt) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now, blocked: false });
      return { allowed: true };
    }

    // Reset attempts if window has passed
    if (now - attempt.lastAttempt > this.ATTEMPT_WINDOW) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now, blocked: false });
      return { allowed: true };
    }

    // Check if currently blocked
    if (attempt.blocked && now - attempt.lastAttempt < this.BLOCK_DURATION) {
      const retryAfter = this.BLOCK_DURATION - (now - attempt.lastAttempt);
      return { allowed: false, retryAfter: Math.ceil(retryAfter / 1000) };
    }

    // Increment attempt count
    const newCount = attempt.count + 1;
    const blocked = newCount > this.MAX_ATTEMPTS;

    this.attempts.set(identifier, {
      count: newCount,
      lastAttempt: now,
      blocked
    });

    if (blocked) {
      const retryAfter = Math.ceil(this.BLOCK_DURATION / 1000);
      return { allowed: false, retryAfter };
    }

    return { allowed: true };
  }

  static recordSuccessfulAuth(identifier: string): void {
    this.attempts.delete(identifier); // Clear attempts on successful auth
  }

  static getAttemptInfo(identifier: string): { attempts: number; blocked: boolean } | null {
    const attempt = this.attempts.get(identifier);
    return attempt ? { attempts: attempt.count, blocked: attempt.blocked } : null;
  }
}

// Input validation for security-sensitive operations
export class SecurityValidation {
  // Validate password strength
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 8) score += 1;
    else feedback.push('Password should be at least 8 characters long');

    if (password.length >= 12) score += 1;

    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Password should include lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Password should include uppercase letters');

    if (/\d/.test(password)) score += 1;
    else feedback.push('Password should include numbers');

    if (/[^a-zA-Z\d]/.test(password)) score += 1;
    else feedback.push('Password should include special characters');

    // Common password patterns
    if (!/(.)\1{2,}/.test(password)) score += 1;
    else feedback.push('Avoid repeating characters');

    if (!/^.*(123|abc|password|qwerty).*$/i.test(password)) score += 1;
    else feedback.push('Avoid common patterns like "123" or "password"');

    return {
      isValid: score >= 5,
      score,
      feedback
    };
  }

  // Validate email for security concerns
  static validateEmailSecurity(email: string): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Basic format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      issues.push('Invalid email format');
    }

    // Length validation
    if (email.length > 254) {
      issues.push('Email address is too long');
    }

    // Check for suspicious patterns
    if (/[<>()[\]\\.,;:\s@"]/.test(email.split('@')[0])) {
      issues.push('Email contains suspicious characters');
    }

    // Domain validation
    const domain = email.split('@')[1];
    if (domain && domain.includes('..')) {
      issues.push('Invalid domain format');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  // Validate file upload security
  static validateFileUpload(file: File): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // File size limits (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      issues.push(`File size exceeds maximum of ${maxSize / (1024 * 1024)}MB`);
    }

    // Allowed MIME types
    const allowedTypes = [
      'image/jpeg',
      'image/png', 
      'image/gif',
      'image/webp',
      'text/plain',
      'application/pdf'
    ];

    if (!allowedTypes.includes(file.type)) {
      issues.push(`File type ${file.type} is not allowed`);
    }

    // Filename validation
    const dangerousExtensions = [
      '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
      '.php', '.asp', '.aspx', '.jsp', '.sh', '.py', '.rb', '.pl'
    ];

    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (dangerousExtensions.includes(fileExtension)) {
      issues.push('File extension is not allowed for security reasons');
    }

    // Filename length and characters
    if (file.name.length > 255) {
      issues.push('Filename is too long');
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(file.name)) {
      issues.push('Filename contains invalid characters');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }
}