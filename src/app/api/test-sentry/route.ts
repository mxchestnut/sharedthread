import { NextResponse } from 'next/server';
import { logError } from '@/lib/error-logger';

export async function GET() {
  try {
    // Simulate a server error
    throw new Error('Test server-side error from API route');
  } catch (error) {
    logError('API test error', error, { 
      apiRoute: '/api/test-sentry',
      method: 'GET',
      testMode: true
    });
    
    return NextResponse.json(
      { 
        message: 'Server error logged to Sentry!',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
