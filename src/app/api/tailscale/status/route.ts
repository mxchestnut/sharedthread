import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getTailscaleConfig, getClientIP, isTailscaleIP } from '@/lib/tailscale';

/**
 * GET /api/tailscale/status
 * 
 * Returns Tailscale network status and client IP information.
 * Useful for debugging VPN connectivity issues.
 */
export async function GET(request: NextRequest) {
  const clientIP = getClientIP(request);
  const config = getTailscaleConfig();
  
  return NextResponse.json({
    tailscale: {
      enabled: config.enabled,
      subnet: config.subnet,
      requireTailscale: config.requireTailscale,
      environment: config.environment,
    },
    client: {
      ip: clientIP || 'unknown',
      isTailscale: clientIP ? isTailscaleIP(clientIP) : false,
      headers: {
        'x-forwarded-for': request.headers.get('x-forwarded-for'),
        'x-real-ip': request.headers.get('x-real-ip'),
        'cf-connecting-ip': request.headers.get('cf-connecting-ip'),
      },
    },
    access: {
      staffPagesAllowed: clientIP ? isTailscaleIP(clientIP) : false,
      message: clientIP && isTailscaleIP(clientIP)
        ? 'You are connected via Tailscale VPN'
        : 'Connect to Tailscale VPN to access staff pages',
    },
  });
}
