import { logError } from '@/lib/error-logger';

/**
 * Tailscale Network Security Utilities
 * 
 * Provides IP validation for Tailscale VPN access control.
 * Used to restrict admin/staff routes to Tailscale network only.
 */

// Tailscale uses CGNAT IP range: 100.64.0.0/10
const TAILSCALE_SUBNET = '100.64.0.0/10';

/**
 * Parse CIDR notation into network address and mask
 */
function parseCIDR(cidr: string): { network: number; mask: number } {
  const [ip, bits] = cidr.split('/');
  const mask = ~((1 << (32 - parseInt(bits))) - 1);
  const network = ipToNumber(ip) & mask;
  return { network, mask };
}

/**
 * Convert IP string to 32-bit number
 */
function ipToNumber(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) | parseInt(octet), 0) >>> 0;
}

/**
 * Check if an IP address is within a CIDR subnet
 */
export function isIPInSubnet(ip: string, cidr: string): boolean {
  try {
    const { network, mask } = parseCIDR(cidr);
    const ipNum = ipToNumber(ip);
    return (ipNum & mask) === network;
  } catch (error) {
    logError('Error checking IP subnet:', error);
    return false;
  }
}

/**
 * Check if an IP is from Tailscale network (100.64.0.0/10)
 */
export function isTailscaleIP(ip: string): boolean {
  return isIPInSubnet(ip, TAILSCALE_SUBNET);
}

/**
 * Extract client IP from request headers
 * Checks common headers set by proxies/load balancers
 */
export function getClientIP(request: Request): string | null {
  // Try x-forwarded-for first (most common)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP if there are multiple
    return forwardedFor.split(',')[0].trim();
  }

  // Try x-real-ip
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  // Try CF-Connecting-IP (Cloudflare)
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) {
    return cfIp.trim();
  }

  // Try True-Client-IP (Cloudflare Enterprise)
  const trueClientIp = request.headers.get('true-client-ip');
  if (trueClientIp) {
    return trueClientIp.trim();
  }

  return null;
}

/**
 * Check if request is from Tailscale VPN
 * Returns { allowed: boolean, ip: string | null, reason?: string }
 */
export function checkTailscaleAccess(request: Request): {
  allowed: boolean;
  ip: string | null;
  reason?: string;
} {
  // In development, allow all access (optional - set REQUIRE_TAILSCALE=true to enforce)
  if (process.env.NODE_ENV === 'development' && process.env.REQUIRE_TAILSCALE !== 'true') {
    return { allowed: true, ip: 'localhost', reason: 'Development mode' };
  }

  const clientIP = getClientIP(request);

  if (!clientIP) {
    return {
      allowed: false,
      ip: null,
      reason: 'Could not determine client IP',
    };
  }

  const isTailscale = isTailscaleIP(clientIP);

  if (!isTailscale) {
    return {
      allowed: false,
      ip: clientIP,
      reason: `IP ${clientIP} is not from Tailscale network (100.64.0.0/10)`,
    };
  }

  return {
    allowed: true,
    ip: clientIP,
  };
}

/**
 * Get Tailscale status and configuration
 * Useful for debugging and health checks
 */
export function getTailscaleConfig() {
  return {
    subnet: TAILSCALE_SUBNET,
    enabled: process.env.NODE_ENV === 'production' || process.env.REQUIRE_TAILSCALE === 'true',
    requireTailscale: process.env.REQUIRE_TAILSCALE === 'true',
    environment: process.env.NODE_ENV,
  };
}
