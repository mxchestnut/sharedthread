import { NextRequest, NextResponse } from 'next/server';
import { rateLimiters, withRateLimit, ddosProtection } from './rate-limiting';
import { applySecurityHeaders, CSRFProtection } from './security-headers';
import { 
import { logError, logInfo } from '@/lib/error-logger';

  SecurityMonitor, 
  SecurityEventType, 
  SecurityEventSeverity, 
  VulnerabilityScanner,
  IncidentResponse 
} from './vulnerability-scanner';

// Security middleware configuration
interface SecurityConfig {
  enableRateLimit: boolean;
  enableCSRFProtection: boolean;
  enableVulnerabilityScanning: boolean;
  enableSecurityHeaders: boolean;
  enableDDoSProtection: boolean;
  blockSuspiciousRequests: boolean;
  enableRequestLogging: boolean;
}

// Default security configuration
const defaultSecurityConfig: SecurityConfig = {
  enableRateLimit: true,
  enableCSRFProtection: true,
  enableVulnerabilityScanning: true,
  enableSecurityHeaders: true,
  enableDDoSProtection: true,
  blockSuspiciousRequests: true,
  enableRequestLogging: process.env.NODE_ENV === 'production'
};

// Main security middleware
export class SecurityMiddleware {
  private config: SecurityConfig;

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = { ...defaultSecurityConfig, ...config };
  }

  // Main middleware function
  async handle(req: NextRequest): Promise<NextResponse> {
    const startTime = Date.now();
    let response = NextResponse.next();
    let blocked = false;
    const securityEvents: Array<{
      type: SecurityEventType;
      severity: SecurityEventSeverity;
      details: Record<string, unknown>;
    }> = [];

    try {
      // 1. DDoS Protection
      if (this.config.enableDDoSProtection) {
        const ddosAllowed = await ddosProtection.checkForDDoS(req);
        if (!ddosAllowed) {
          blocked = true;
          securityEvents.push({
            type: SecurityEventType.DDOS_ATTACK,
            severity: SecurityEventSeverity.CRITICAL,
            details: { reason: 'Request pattern indicates DDoS attack' }
          });

          response = NextResponse.json(
            { error: 'Too many requests from this IP' },
            { status: 429 }
          );
        }
      }

      // 2. Vulnerability Scanning
      if (!blocked && this.config.enableVulnerabilityScanning) {
        const scanResult = VulnerabilityScanner.scanRequest(req);
        
        if (scanResult.threats.length > 0) {
          securityEvents.push(...scanResult.threats);
          
          // Block critical threats
          const criticalThreats = scanResult.threats.filter(
            threat => threat.severity === SecurityEventSeverity.CRITICAL
          );
          
          if (criticalThreats.length > 0 && this.config.blockSuspiciousRequests) {
            blocked = true;
            response = NextResponse.json(
              { error: 'Request blocked for security reasons' },
              { status: 403 }
            );
          }
        }

        // Scan request body for POST/PUT requests
        if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
          try {
            const clonedRequest = req.clone();
            const contentType = req.headers.get('content-type') || '';
            
            let body: string | FormData | null = null;
            if (contentType.includes('application/json')) {
              body = await clonedRequest.text();
            } else if (contentType.includes('multipart/form-data')) {
              body = await clonedRequest.formData();
            } else if (contentType.includes('application/x-www-form-urlencoded')) {
              body = await clonedRequest.text();
            }

            const bodyThreats = await VulnerabilityScanner.scanRequestBody(body, contentType);
            if (bodyThreats.threats.length > 0) {
              securityEvents.push(...bodyThreats.threats);
              
              const bodyCriticalThreats = bodyThreats.threats.filter(
                threat => threat.severity === SecurityEventSeverity.CRITICAL
              );
              
              if (bodyCriticalThreats.length > 0 && this.config.blockSuspiciousRequests && !blocked) {
                blocked = true;
                response = NextResponse.json(
                  { error: 'Request content blocked for security reasons' },
                  { status: 403 }
                );
              }
            }
          } catch (error) {
            // Log error but don't block request
            logError('Error scanning request body:', error);
          }
        }
      }

      // 3. Rate Limiting
      if (!blocked && this.config.enableRateLimit) {
        const rateLimitResult = await this.applyRateLimit(req);
        if (rateLimitResult) {
          blocked = true;
          securityEvents.push({
            type: SecurityEventType.RATE_LIMIT_EXCEEDED,
            severity: SecurityEventSeverity.MEDIUM,
            details: { rateLimiter: this.getRateLimiterType(req) }
          });
          response = rateLimitResult;
        }
      }

      // 4. CSRF Protection
      if (!blocked && this.config.enableCSRFProtection) {
        const csrfResult = await CSRFProtection.middleware()(req);
        if (csrfResult) {
          blocked = true;
          securityEvents.push({
            type: SecurityEventType.CSRF_VIOLATION,
            severity: SecurityEventSeverity.HIGH,
            details: { method: req.method, path: req.nextUrl.pathname }
          });
          response = csrfResult;
        }
      }

      // 5. Apply Security Headers
      if (this.config.enableSecurityHeaders) {
        response = applySecurityHeaders(response);
        
        // Add CSRF token to response if needed
        if (['GET', 'HEAD'].includes(req.method)) {
          CSRFProtection.setTokenCookie(response);
        }
      }

      // 6. Log Security Events
      if (securityEvents.length > 0) {
        for (const event of securityEvents) {
          SecurityMonitor.logEvent(
            event.type,
            event.severity,
            req,
            event.details,
            blocked
          );
          
          // Execute automated incident response
          const incidentResponse = await IncidentResponse.executeResponse(
            this.getClientIP(req),
            event.type,
            event.severity
          );
          
          if (incidentResponse.blocked && !blocked) {
            blocked = true;
            response = NextResponse.json(
              { error: 'IP blocked due to security violations' },
              { status: 403 }
            );
          }
        }
      }

      // 7. Request Logging
      if (this.config.enableRequestLogging) {
        this.logRequest(req, response, blocked, Date.now() - startTime);
      }

      return response;

    } catch (error) {
      logError('Security middleware error:', error);
      
      // Log the error as a security event
      SecurityMonitor.logEvent(
        SecurityEventType.MALFORMED_REQUEST,
        SecurityEventSeverity.MEDIUM,
        req,
        { error: error instanceof Error ? error.message : 'Unknown error' },
        false
      );

      // Return the original response on error (fail open)
      return NextResponse.next();
    }
  }

  // Apply appropriate rate limiting based on the request
  private async applyRateLimit(req: NextRequest): Promise<NextResponse | null> {
    const path = req.nextUrl.pathname;
    
    // Authentication endpoints
    if (path.startsWith('/api/auth/')) {
      return await withRateLimit(rateLimiters.auth)(req);
    }
    
    // Password reset endpoints
    if (path.includes('password-reset') || path.includes('forgot-password')) {
      return await withRateLimit(rateLimiters.passwordReset)(req);
    }
    
    // File upload endpoints
    if (path.startsWith('/api/upload') || req.method === 'POST' && 
        req.headers.get('content-type')?.includes('multipart/form-data')) {
      return await withRateLimit(rateLimiters.upload)(req);
    }
    
    // Search endpoints
    if (path.startsWith('/api/search')) {
      return await withRateLimit(rateLimiters.search)(req);
    }
    
    // Content creation endpoints
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && path.startsWith('/api/')) {
      return await withRateLimit(rateLimiters.content)(req);
    }
    
    // General API rate limiting
    if (path.startsWith('/api/')) {
      return await withRateLimit(rateLimiters.api)(req);
    }
    
    return null; // No rate limiting applied
  }

  // Determine which rate limiter was applied
  private getRateLimiterType(req: NextRequest): string {
    const path = req.nextUrl.pathname;
    
    if (path.startsWith('/api/auth/')) return 'auth';
    if (path.includes('password-reset')) return 'passwordReset';
    if (path.startsWith('/api/upload')) return 'upload';
    if (path.startsWith('/api/search')) return 'search';
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && path.startsWith('/api/')) return 'content';
    if (path.startsWith('/api/')) return 'api';
    
    return 'none';
  }

  // Get client IP address
  private getClientIP(req: NextRequest): string {
    return (
      req.headers.get('cf-connecting-ip') ||
      req.headers.get('x-real-ip') ||
      req.headers.get('x-forwarded-for')?.split(',')[0] ||
      'unknown'
    );
  }

  // Log request for monitoring
  private logRequest(
    req: NextRequest,
    response: NextResponse,
    blocked: boolean,
    responseTime: number
  ): void {
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.nextUrl.toString(),
      ip: this.getClientIP(req),
      userAgent: req.headers.get('user-agent'),
      status: response.status,
      blocked,
      responseTime,
      size: response.headers.get('content-length')
    };

    // In production, send to logging service
    if (process.env.NODE_ENV === 'development') {
      logInfo('Request log:', logData);
    }
  }

  // Get security metrics for monitoring dashboard
  static getSecurityDashboard(): {
    recentActivity: ReturnType<typeof SecurityMonitor.getSecurityMetrics>;
    suspiciousIPs: string[];
    systemStatus: {
      ddosProtectionActive: boolean;
      rateLimitingActive: boolean;
      csrfProtectionActive: boolean;
      vulnerabilityScanningActive: boolean;
    };
  } {
    return {
      recentActivity: SecurityMonitor.getSecurityMetrics(60), // Last hour
      suspiciousIPs: ddosProtection.getSuspiciousIps(),
      systemStatus: {
        ddosProtectionActive: true,
        rateLimitingActive: true,
        csrfProtectionActive: true,
        vulnerabilityScanningActive: true
      }
    };
  }
}

// Create default security middleware instance
export const securityMiddleware = new SecurityMiddleware();

// Middleware function for Next.js
export async function middleware(req: NextRequest): Promise<NextResponse> {
  return await securityMiddleware.handle(req);
}

// Configuration for middleware paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};

// Export security utilities for use in API routes
export {
  SecurityMonitor,
  VulnerabilityScanner,
  IncidentResponse,
  SecurityEventType,
  SecurityEventSeverity
} from './vulnerability-scanner';

export {
  CSRFProtection,
  SessionSecurity,
  AuthRateLimit,
  SecurityValidation
} from './security-headers';

export {
  rateLimiters,
  withRateLimit,
  adaptiveRateLimiter,
  ddosProtection
} from './rate-limiting';

export {
  InputValidator,
  ValidationSchemas,
  sanitizeHtml,
  sanitizeText,
  sanitizeFilename
} from './input-validation';