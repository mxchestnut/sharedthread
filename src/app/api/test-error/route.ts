// Test endpoint to verify Sentry error reporting
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function GET() {
  try {
    // Intentionally throw an error to test Sentry
    throw new Error('Test error for Sentry verification - this is intentional');
  } catch (error) {
    // Capture the error with Sentry
    Sentry.captureException(error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Test error captured by Sentry',
        message: 'Check Sentry dashboard for this error'
      },
      { status: 500 }
    );
  }
}