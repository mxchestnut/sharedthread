/**
 * Staff AI Insights API
 * GET /api/staff/ai-insights
 * 
 * Provides comprehensive platform health analytics for staff:
 * - User behavior patterns and stuck points
 * - Feature usage statistics
 * - Content quality alerts
 * - AI-powered trend analysis
 * 
 * Requires: STAFF role authorization
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { generatePlatformHealthReport } from '@/lib/ai/staff-insights';
import { logError } from '@/lib/error-logger';


export async function GET() {
  try {
    // Authentication & Authorization
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    // Check admin role (staff dashboard requires admin access)
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden. Admin access required for staff insights.' },
        { status: 403 }
      );
    }

    // Generate comprehensive platform health report
    const report = await generatePlatformHealthReport();

    return NextResponse.json({
      success: true,
      data: report,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    logError('Staff insights error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate staff insights',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
